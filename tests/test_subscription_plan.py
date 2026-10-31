from datetime import date

from odoo.exceptions import AccessError, ValidationError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestSubscriptionPlan(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.staff = cls._create_user(
            'staff.plan@brightloop.test',
            'subscription_management.group_subscription_staff',
        )
        cls.admin = cls._create_user(
            'admin.plan@brightloop.test',
            'subscription_management.group_subscription_admin',
        )
        cls.customer = cls._create_user(
            'customer.plan@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        cls.product = cls.env['product.template'].with_user(cls.admin).create({
            'name': 'Plan service',
            'type': 'service',
            'sale_ok': True,
            'list_price': 25,
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

    def _plan(self, **values):
        vals = {
            'name': 'Monthly plan',
            'recurring_price': 25,
            'billing_frequency': 'monthly',
            'line_ids': [(0, 0, {
                'product_tmpl_id': self.product.id,
                'unit_price': 25,
            })],
        }
        vals.update(values)
        return self.env['subscription.plan'].with_user(self.admin).create(vals)

    def test_create_update_and_validation(self):
        plan = self._plan()
        self.assertEqual(plan.name, 'Monthly plan')
        plan.write({'name': 'Updated plan', 'allow_pause': True})
        self.assertEqual(plan.name, 'Updated plan')
        self.assertTrue(plan.can_pause())

        invalid_values = (
            {'name': False},
            {'recurring_price': -1},
            {'minimum_quantity': 0},
            {'available_from': date(2026, 2, 1), 'available_until': date(2026, 1, 1)},
        )
        for values in invalid_values:
            with self.assertRaises(ValidationError):
                self._plan(**values)

    def test_billing_dates_include_month_end_and_leap_year(self):
        cases = (
            ('daily', date(2024, 2, 28), date(2024, 2, 29)),
            ('weekly', date(2024, 2, 28), date(2024, 3, 6)),
            ('monthly', date(2024, 1, 31), date(2024, 2, 29)),
            ('monthly', date(2023, 1, 31), date(2023, 2, 28)),
            ('yearly', date(2024, 2, 29), date(2025, 2, 28)),
        )
        for frequency, start, expected in cases:
            plan = self._plan(billing_frequency=frequency)
            self.assertEqual(plan.get_next_billing_date(start), expected)

    def test_availability_and_permissions(self):
        plan = self._plan(
            available_from=date(2026, 1, 1),
            available_until=date(2026, 12, 31),
            automatic_closure=True,
            allow_early_closure=True,
            allow_pause=True,
            allow_renewal=True,
        )
        self.assertTrue(plan.is_available(date(2026, 6, 1)))
        self.assertFalse(plan.is_available(date(2027, 1, 1)))
        self.assertTrue(plan.automatic_closure_applies(date(2026, 12, 31)))
        self.assertTrue(plan.can_close_early())
        self.assertTrue(plan.can_pause())
        self.assertTrue(plan.can_renew())
        self.assertFalse(plan.is_available(date(2025, 12, 31)))

        inactive_plan = self._plan(active=False)
        with self.assertRaises(ValidationError):
            inactive_plan._check_available_for_new_subscription()

    def test_minimum_quantity_and_quotation_use(self):
        plan = self._plan(minimum_quantity=2)
        plan.validate_quantity(2)
        with self.assertRaises(ValidationError):
            plan.validate_quantity(1)

        order = self.env['sale.order'].with_user(self.staff).create({
            'partner_id': self.customer.partner_id.id,
            'order_line': [(0, 0, {
                'product_id': self.product.product_variant_id.id,
                'product_uom_qty': 2,
                'subscription_plan_id': plan.id,
            })],
        })
        self.assertEqual(order.order_line.subscription_plan_id, plan)

        with self.assertRaises(ValidationError):
            self.env['sale.order'].with_user(self.staff).create({
                'partner_id': self.customer.partner_id.id,
                'order_line': [(0, 0, {
                    'product_id': self.product.product_variant_id.id,
                    'product_uom_qty': 1,
                    'subscription_plan_id': plan.id,
                })],
            })

    def test_role_restrictions_and_available_plan_visibility(self):
        plan = self._plan()
        self.assertIn(plan, self.env['subscription.plan'].with_user(self.staff).search([]))
        self.assertIn(plan, self.env['subscription.plan'].with_user(self.customer).search([]))
        with self.assertRaises(AccessError):
            self.env['subscription.plan'].with_user(self.staff).create({
                'name': 'Staff plan',
                'recurring_price': 10,
            })
        with self.assertRaises(AccessError):
            plan.with_user(self.staff).write({'name': 'No edit'})

        plan.with_user(self.admin).write({'active': False})
        self.assertNotIn(
            plan,
            self.env['subscription.plan'].with_user(self.staff).with_context(
                active_test=False
            ).search([]),
        )
