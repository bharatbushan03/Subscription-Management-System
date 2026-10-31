from datetime import date
from unittest.mock import patch

from odoo.exceptions import UserError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestRecurringBilling(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.admin = cls.env['res.users'].create({
            'name': 'Billing admin',
            'login': 'billing.admin@brightloop.test',
            'password': 'Validpass1!',
            'company_id': cls.env.company.id,
            'company_ids': [(6, 0, [cls.env.company.id])],
            'group_ids': [(6, 0, [cls.env.ref(
                'subscription_management.group_subscription_admin'
            ).id])],
        })
        cls.partner = cls.env['res.partner'].create({
            'name': 'Billing customer',
        })
        cls.product = cls.env['product.template'].with_user(cls.admin).create({
            'name': 'Recurring service',
            'type': 'service',
            'sale_ok': True,
            'list_price': 100,
        })
        cls.tax = cls.env['account.tax'].with_user(cls.admin).create({
            'name': 'Recurring tax',
            'amount': 10,
            'amount_type': 'percent',
            'type_tax_use': 'sale',
        })

    def _plan(self, frequency):
        return self.env['subscription.plan'].with_user(self.admin).create({
            'name': 'Billing %s' % frequency,
            'recurring_price': 100,
            'billing_frequency': frequency,
            'line_ids': [(0, 0, {
                'product_tmpl_id': self.product.id,
                'unit_price': 100,
            })],
        })

    def _subscription(self, plan, start, expiry, next_invoice=None, **line):
        return self.env['subscription.subscription'].with_user(self.admin).create({
            'partner_id': self.partner.id,
            'plan_id': plan.id,
            'start_date': start,
            'expiry_date': expiry,
            'next_invoice_date': next_invoice or start,
            'state': 'active',
            'currency_id': self.env.company.currency_id.id,
            'line_ids': [(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'quantity': line.get('quantity', 2),
                'unit_price': line.get('unit_price', 100),
                'tax_ids': [(6, 0, self.tax.ids)],
                'discount': line.get('discount', 10),
            })],
        })

    def test_all_frequencies_and_calendar_boundaries(self):
        cases = [
            ('daily', date(2026, 10, 30), date(2026, 10, 30)),
            ('weekly', date(2026, 10, 24), date(2026, 10, 30)),
            ('monthly', date(2026, 1, 31), date(2026, 2, 27)),
            ('yearly', date(2024, 2, 29), date(2025, 2, 27)),
        ]
        for frequency, start, expected_end in cases:
            plan = self._plan(frequency)
            subscription = self._subscription(
                plan,
                start,
                date(2026, 12, 31) if frequency != 'yearly'
                else date(2025, 12, 31),
            )
            today = {
                'daily': date(2026, 10, 31),
                'weekly': date(2026, 10, 31),
                'monthly': date(2026, 2, 1),
                'yearly': date(2024, 3, 1),
            }[frequency]
            with patch('odoo.fields.Date.context_today', return_value=today):
                invoice = subscription._create_recurring_invoice()
            self.assertEqual(invoice.billing_period_start, start)
            self.assertEqual(invoice.billing_period_end, expected_end)
            self.assertEqual(invoice.state, 'draft')
            self.assertEqual(
                subscription.next_invoice_date,
                plan.get_next_billing_date(start),
            )

    def test_invoice_mapping_totals_taxes_and_link(self):
        plan = self._plan('monthly')
        subscription = self._subscription(
            plan,
            date(2026, 10, 1),
            date(2026, 12, 31),
        )
        subscription.cron_generate_recurring_invoices()
        invoice = subscription.invoice_ids
        line = invoice.invoice_line_ids
        self.assertEqual(invoice.subscription_id, subscription)
        self.assertEqual(invoice.partner_id, self.partner)
        self.assertEqual(line.product_id, self.product.product_variant_id)
        self.assertEqual(line.quantity, 2)
        self.assertEqual(line.price_unit, 100)
        self.assertEqual(line.discount, 10)
        self.assertEqual(line.tax_ids, self.tax)
        self.assertEqual(invoice.amount_untaxed, 180)
        self.assertEqual(invoice.amount_total, 198)

    def test_paused_closed_expired_and_duplicate_are_skipped(self):
        plan = self._plan('monthly')
        paused = self._subscription(
            plan, date(2026, 10, 1), date(2026, 12, 31)
        )
        paused.state = 'paused'
        closed = self._subscription(
            plan, date(2026, 10, 1), date(2026, 12, 31)
        )
        closed.state = 'closed'
        expired = self._subscription(
            plan, date(2026, 1, 1), date(2026, 1, 31), date(2026, 1, 1)
        )
        result = self.env['subscription.subscription'].cron_generate_recurring_invoices()
        self.assertEqual(result['invoices'], 0)
        self.assertFalse(paused.invoice_ids)
        self.assertFalse(closed.invoice_ids)
        self.assertFalse(expired.invoice_ids)

        active = self._subscription(
            plan, date(2026, 10, 1), date(2026, 12, 31)
        )
        active.cron_generate_recurring_invoices()
        first = active.invoice_ids
        active.cron_generate_recurring_invoices()
        self.assertEqual(active.invoice_ids, first)
        active.next_invoice_date = date(2026, 10, 1)
        duplicate = active._create_recurring_invoice()
        self.assertEqual(duplicate, first)

    def test_failed_subscription_does_not_stop_batch_and_can_retry(self):
        plan = self._plan('monthly')
        failing = self._subscription(
            plan, date(2026, 10, 1), date(2026, 12, 31)
        )
        succeeding = self._subscription(
            plan, date(2026, 10, 2), date(2026, 12, 31)
        )
        model = type(self.env['subscription.subscription'])
        original = model._create_recurring_invoice

        calls = [0]

        def create_invoice():
            calls[0] += 1
            if calls[0] == 1:
                raise UserError('temporary billing failure')
            return original(succeeding)

        with patch.object(model, '_create_recurring_invoice', side_effect=create_invoice):
            result = self.env['subscription.subscription'].cron_generate_recurring_invoices()
        self.assertEqual(result['failures'], 1)
        self.assertEqual(result['invoices'], 1)
        self.assertEqual(failing.next_invoice_date, date(2026, 10, 1))
        self.assertEqual(succeeding.next_invoice_date, date(2026, 11, 2))
