from datetime import date
from unittest.mock import patch

from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestSubscriptionDiscount(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.admin = cls.env['res.users'].create({
            'name': 'Discount admin',
            'login': 'discount.admin@brightloop.test',
            'password': 'Validpass1!',
            'company_id': cls.env.company.id,
            'company_ids': [(6, 0, [cls.env.company.id])],
            'group_ids': [(6, 0, [cls.env.ref(
                'subscription_management.group_subscription_admin'
            ).id])],
        })
        cls.partner = cls.env['res.partner'].create({'name': 'Discount customer'})
        cls.product = cls.env['product.template'].with_user(cls.admin).create({
            'name': 'Discounted service',
            'type': 'service',
            'sale_ok': True,
            'list_price': 100,
        })
        cls.plan = cls.env['subscription.plan'].with_user(cls.admin).create({
            'name': 'Discount plan',
            'recurring_price': 100,
            'billing_frequency': 'monthly',
            'line_ids': [(0, 0, {
                'product_tmpl_id': cls.product.id,
                'unit_price': 100,
            })],
        })

    def _subscription(self):
        return self.env['subscription.subscription'].with_user(self.admin).create({
            'partner_id': self.partner.id,
            'plan_id': self.plan.id,
            'start_date': date(2026, 10, 1),
            'expiry_date': date(2026, 12, 31),
            'next_invoice_date': date(2026, 10, 1),
            'state': 'active',
            'line_ids': [(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'quantity': 1,
                'unit_price': 100,
            })],
        })

    def test_percentage_discount_is_applied_once(self):
        discount = self.env['subscription.discount'].with_user(self.admin).create({
            'name': 'Ten percent',
            'discount_type': 'percentage',
            'value': 10,
            'scope': 'subscription',
            'maximum_usage_count': 1,
        })
        subscription = self._subscription()
        with patch('odoo.fields.Date.context_today', return_value=date(2026, 10, 31)):
            subscription.cron_generate_recurring_invoices()
        invoice = subscription.invoice_ids
        self.assertEqual(invoice.invoice_line_ids.discount, 10)
        self.assertEqual(invoice.amount_total, 90)
        self.assertEqual(discount.usage_count, 1)
        self.assertEqual(len(discount.application_ids), 1)
        subscription.next_invoice_date = date(2026, 10, 1)
        with patch('odoo.fields.Date.context_today', return_value=date(2026, 10, 31)):
            subscription._create_recurring_invoice()
        self.assertEqual(discount.usage_count, 1)

    def test_fixed_discount_is_a_native_negative_invoice_line(self):
        self.env['subscription.discount'].with_user(self.admin).create({
            'name': 'Fixed five',
            'discount_type': 'fixed',
            'value': 5,
            'scope': 'subscription',
        })
        subscription = self._subscription()
        with patch('odoo.fields.Date.context_today', return_value=date(2026, 10, 31)):
            subscription.cron_generate_recurring_invoices()
        self.assertEqual(subscription.invoice_ids.amount_total, 95)
        self.assertEqual(
            subscription.invoice_ids.invoice_line_ids.filtered(
                lambda line: line.price_unit == -5
            ).price_unit,
            -5,
        )
