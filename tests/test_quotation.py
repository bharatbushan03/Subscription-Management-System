from datetime import date, timedelta
from unittest.mock import patch

from odoo.exceptions import AccessError, ValidationError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestQuotationManagement(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.staff = cls._create_user(
            'staff.quotation@brightloop.test',
            'subscription_management.group_subscription_staff',
        )
        cls.customer = cls._create_user(
            'customer.quotation@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        cls.other_customer = cls._create_user(
            'other.quotation@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        cls.product = cls.env['product.template'].with_user(
            cls.env.user
        ).create({
            'name': 'Quotation service',
            'type': 'service',
            'sale_ok': True,
            'list_price': 80,
        })
        cls.plan = cls.env['subscription.plan'].create({
            'name': 'Quotation plan',
            'recurring_price': 80,
            'billing_frequency': 'monthly',
            'line_ids': [(0, 0, {
                'product_tmpl_id': cls.product.id,
                'unit_price': 80,
            })],
        })

    @classmethod
    def _create_user(cls, login, group_xmlid):
        return cls.env['res.users'].create({
            'name': login,
            'login': login,
            'password': 'Validpass1!',
            'company_id': cls.env.company.id,
            'company_ids': [(6, 0, [cls.env.company.id])],
            'group_ids': [(6, 0, [cls.env.ref(group_xmlid).id])],
        })

    def _order(self, partner=None, **values):
        vals = {
            'partner_id': (partner or self.customer.partner_id).id,
            'subscription_plan_id': self.plan.id,
            'validity_date': date(2026, 12, 31),
            'payment_term_id': self.env.ref(
                'account.account_payment_term_immediate'
            ).id,
            'order_line': [(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'product_uom_qty': 1,
            })],
        }
        vals.update(values)
        return self.env['sale.order'].with_user(self.staff).create(vals)

    def test_create_reference_validity_and_native_totals(self):
        order = self._order()
        self.assertTrue(order.name)
        self.assertEqual(order.state, 'draft')
        self.assertFalse(order.quotation_expired)
        self.assertEqual(order.amount_untaxed, 80)
        self.assertEqual(order.amount_total, order.amount_untaxed + order.amount_tax)

        with self.assertRaises(ValidationError):
            self._order(validity_date=date(2025, 1, 1))

    def test_template_copy_is_independent_and_restricted(self):
        template = self.env['sale.order.template'].with_user(self.staff).create({
            'name': 'Standard quotation',
            'number_of_days': 15,
            'applicable_plan_ids': [(6, 0, self.plan.ids)],
            'sale_order_template_line_ids': [(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'product_uom_qty': 1,
            })],
        })
        order = self._order(sale_order_template_id=template.id)
        self.assertEqual(order.sale_order_template_id, template)
        original_quantity = order.order_line.product_uom_qty
        template.sale_order_template_line_ids.product_uom_qty = 3
        self.assertEqual(order.order_line.product_uom_qty, original_quantity)

        other_plan = self.env['subscription.plan'].create({
            'name': 'Other quotation plan',
            'recurring_price': 80,
            'billing_frequency': 'monthly',
            'line_ids': [(0, 0, {
                'product_tmpl_id': self.product.id,
                'unit_price': 80,
            })],
        })
        with self.assertRaises(ValidationError):
            self._order(
                sale_order_template_id=template.id,
                subscription_plan_id=other_plan.id,
            )

    def test_customer_acceptance_rejection_and_isolation(self):
        order = self._order()
        self.assertIn(order, self.env['sale.order'].with_user(self.customer).search([]))
        other = self._order(partner=self.other_customer.partner_id)
        self.assertNotIn(
            other,
            self.env['sale.order'].with_user(self.customer).search([]),
        )
        with self.assertRaises(AccessError):
            order.with_user(self.customer).write({'note': 'changed'})
        order.with_user(self.customer).action_customer_accept()
        self.assertEqual(order.state, 'sale')

        rejected = self._order()
        rejected.with_user(self.customer).action_customer_reject()
        self.assertEqual(rejected.state, 'cancel')

    def test_convert_accepted_quotation_to_active_subscription(self):
        order = self._order()
        order.with_user(self.customer).action_customer_accept()

        action = order.with_user(self.staff).action_convert_to_subscription()
        subscription = self.env['subscription.subscription'].search(
            [('quotation_id', '=', order.id)]
        )

        self.assertEqual(action['res_id'], subscription.id)
        self.assertEqual(order.subscription_id, subscription)
        self.assertEqual(subscription.state, 'active')
        self.assertEqual(subscription.partner_id, order.partner_id)
        self.assertEqual(subscription.plan_id, order.subscription_plan_id)
        self.assertEqual(subscription.currency_id, order.currency_id)
        self.assertEqual(subscription.payment_term_id, order.payment_term_id)
        self.assertEqual(subscription.converted_by_id, self.staff)
        self.assertTrue(subscription.converted_at)
        self.assertEqual(subscription.line_ids.product_id, order.order_line.product_id)
        self.assertEqual(subscription.line_ids.quantity, order.order_line.product_uom_qty)
        self.assertEqual(subscription.line_ids.unit_price, order.order_line.price_unit)
        self.assertEqual(subscription.line_ids.tax_ids, order.order_line.tax_ids)
        self.assertEqual(
            subscription.expiry_date,
            self.plan.get_next_billing_date(subscription.start_date) - timedelta(days=1),
        )

        repeated_action = order.with_user(self.staff).action_convert_to_subscription()
        self.assertEqual(repeated_action['res_id'], subscription.id)
        self.assertEqual(
            self.env['subscription.subscription'].search_count([
                ('quotation_id', '=', order.id),
            ]),
            1,
        )

    def test_convert_preserves_multiple_products_and_variants(self):
        second_product = self.env['product.template'].create({
            'name': 'Second quotation service',
            'type': 'service',
            'sale_ok': True,
            'list_price': 25,
        })
        self.plan.line_ids = [(0, 0, {
            'product_tmpl_id': second_product.id,
            'product_id': second_product.product_variant_id.id,
            'unit_price': 25,
        })]
        order = self._order(order_line=[
            (0, 0, {
                'product_id': self.product.product_variant_id.id,
                'product_uom_qty': 2,
                'price_unit': 80,
            }),
            (0, 0, {
                'product_id': second_product.product_variant_id.id,
                'product_uom_qty': 3,
                'price_unit': 25,
            }),
        ])
        order.with_user(self.customer).action_customer_accept()
        order.action_convert_to_subscription()

        lines = order.subscription_id.line_ids.sorted('id')
        self.assertEqual(lines.mapped('product_id'), order.order_line.mapped('product_id'))
        self.assertEqual(lines.mapped('quantity'), [2, 3])
        self.assertEqual(lines.mapped('unit_price'), [80, 25])

    def test_conversion_rejects_expired_or_rejected_quotations(self):
        expired = self._order()
        with patch(
            'odoo.fields.Date.context_today',
            return_value=date(2027, 1, 1),
        ):
            expired.with_user(self.customer).action_customer_accept()
            with self.assertRaises(ValidationError):
                expired.action_convert_to_subscription()
        self.assertFalse(expired.subscription_id)

        rejected = self._order()
        rejected.with_user(self.customer).action_customer_reject()
        with self.assertRaises(ValidationError):
            rejected.action_convert_to_subscription()

    def test_customer_cannot_convert_quotation(self):
        order = self._order()
        order.with_user(self.customer).action_customer_accept()
        with self.assertRaises(AccessError):
            order.with_user(self.customer).action_convert_to_subscription()

    def test_future_start_conversion_remains_confirmed(self):
        order = self._order(
            subscription_start_date=date(2026, 12, 1),
            subscription_expiry_date=date(2026, 12, 31),
        )
        order.with_user(self.customer).action_customer_accept()
        order.action_convert_to_subscription()
        self.assertEqual(order.subscription_id.state, 'confirmed')
        self.assertEqual(order.subscription_id.start_date, date(2026, 12, 1))
        self.assertEqual(order.subscription_id.expiry_date, date(2026, 12, 31))
