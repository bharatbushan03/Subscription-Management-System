from datetime import date

from odoo.exceptions import AccessError, ValidationError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestSubscription(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.staff = cls._create_user(
            'staff.subscription@brightloop.test',
            'subscription_management.group_subscription_staff',
        )
        cls.admin = cls._create_user(
            'admin.subscription@brightloop.test',
            'subscription_management.group_subscription_admin',
        )
        cls.customer = cls._create_user(
            'customer.subscription@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        cls.other_customer = cls._create_user(
            'other.subscription@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        cls.product = cls.env['product.template'].with_user(cls.admin).create({
            'name': 'Subscription product',
            'type': 'service',
            'sale_ok': True,
            'list_price': 100,
        })
        cls.tax = cls.env['account.tax'].with_user(cls.admin).create({
            'name': 'Subscription tax',
            'amount': 10,
            'amount_type': 'percent',
            'type_tax_use': 'sale',
        })
        cls.plan = cls.env['subscription.plan'].with_user(cls.admin).create({
            'name': 'Annual subscription',
            'recurring_price': 200,
            'billing_frequency': 'yearly',
            'line_ids': [(0, 0, {
                'product_tmpl_id': cls.product.id,
                'unit_price': 100,
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

    def _subscription(self, partner=None, **values):
        vals = {
            'partner_id': (partner or self.customer.partner_id).id,
            'plan_id': self.plan.id,
            'start_date': date(2026, 1, 1),
            'expiry_date': date(2026, 12, 31),
            'next_invoice_date': date(2026, 2, 1),
            'line_ids': [(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'quantity': 2,
                'unit_price': 100,
            })],
        }
        vals.update(values)
        return self.env['subscription.subscription'].with_user(self.admin).create(vals)

    def test_creation_sequence_relationships_and_amounts(self):
        subscription = self._subscription()
        self.assertRegex(subscription.subscription_number, r'^SUB/2026/\d{5}$')
        self.assertEqual(subscription.partner_id, self.customer.partner_id)
        self.assertEqual(subscription.plan_id, self.plan)
        self.assertEqual(subscription.line_ids.product_id, self.product.product_variant_id)
        self.assertEqual(subscription.amount_untaxed, 200)
        self.assertEqual(subscription.amount_tax, 0)
        self.assertEqual(subscription.amount_total, 200)

        taxed = self._subscription(line_ids=[(0, 0, {
            'product_id': self.product.product_variant_id.id,
            'quantity': 2,
            'unit_price': 100,
            'tax_ids': [(6, 0, self.tax.ids)],
        })])
        self.assertEqual(taxed.amount_untaxed, 200)
        self.assertEqual(taxed.amount_tax, 20)
        self.assertEqual(taxed.amount_total, 220)

    def test_duplicate_number_and_invalid_values(self):
        subscription = self._subscription()
        with self.assertRaises(ValidationError):
            self._subscription(subscription_number=subscription.subscription_number)
        with self.assertRaises(ValidationError):
            self._subscription(expiry_date=date(2025, 12, 31))
        with self.assertRaises(ValidationError):
            self._subscription(next_invoice_date=date(2027, 1, 1))
        with self.assertRaises(ValidationError):
            self._subscription(line_ids=[(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'quantity': 0,
                'unit_price': 100,
            })])
        with self.assertRaises(ValidationError):
            self._subscription(line_ids=[(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'quantity': 1,
                'unit_price': -1,
            })])

    def test_role_access_and_customer_isolation(self):
        own = self._subscription()
        other = self._subscription(partner=self.other_customer.partner_id)
        subscriptions = self.env['subscription.subscription']
        self.assertIn(own, subscriptions.with_user(self.customer).search([]))
        self.assertNotIn(other, subscriptions.with_user(self.customer).search([]))
        self.assertIn(own, subscriptions.with_user(self.staff).search([]))
        with self.assertRaises(AccessError):
            own.with_user(self.customer).write({'note': 'changed'})
        with self.assertRaises(AccessError):
            subscriptions.with_user(self.customer).create({
                'partner_id': self.customer.partner_id.id,
                'plan_id': self.plan.id,
            })

    def test_lifecycle_transitions_and_billing_eligibility(self):
        payment_term = self.env['account.payment.term'].search([], limit=1)
        self.plan.write({'allow_pause': True, 'allow_early_closure': True})
        subscription = self._subscription(payment_term_id=payment_term.id)
        subscription.action_create_quotation()
        self.assertEqual(subscription.state, 'quotation')
        subscription.action_confirm()
        self.assertEqual(subscription.state, 'confirmed')
        subscription.action_activate()
        self.assertEqual(subscription.state, 'active')
        self.assertTrue(subscription.billing_eligible)
        subscription.action_pause()
        self.assertEqual(subscription.state, 'paused')
        self.assertFalse(subscription.billing_eligible)
        subscription.action_resume()
        subscription.action_close()
        self.assertEqual(subscription.state, 'closed')
        self.assertFalse(subscription.billing_eligible)

    def test_invalid_transitions_and_plan_permissions(self):
        payment_term = self.env['account.payment.term'].search([], limit=1)
        subscription = self._subscription(payment_term_id=payment_term.id)
        with self.assertRaises(ValidationError):
            subscription.action_activate()
        subscription.action_create_quotation()
        subscription.action_confirm()
        subscription.action_activate()

        self.plan.allow_pause = False
        with self.assertRaises(ValidationError):
            subscription.action_pause()
        self.plan.allow_early_closure = False
        with self.assertRaises(ValidationError):
            subscription.action_close()

    def test_automatic_expiry_and_renewal(self):
        payment_term = self.env['account.payment.term'].search([], limit=1)
        self.plan.write({
            'automatic_closure': True,
            'allow_renewal': True,
        })
        expired = self._subscription(
            payment_term_id=payment_term.id,
            start_date=date(2025, 1, 1),
            expiry_date=date(2025, 12, 31),
            next_invoice_date=date(2025, 2, 1),
        )
        expired.write({'state': 'active'})
        closed = self.env['subscription.subscription'].cron_close_expired_subscriptions()
        self.assertIn(expired, closed)
        self.assertEqual(expired.state, 'closed')
        renewed = expired.action_renew()
        self.assertEqual(renewed.previous_subscription_id, expired)
        self.assertEqual(expired.renewal_subscription_id, renewed)
        with self.assertRaises(ValidationError):
            expired.action_renew()
