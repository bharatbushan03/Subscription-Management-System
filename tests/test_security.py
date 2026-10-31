from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestSubscriptionSecurity(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.staff = cls._create_user(
            'staff.security@brightloop.test',
            'subscription_management.group_subscription_staff',
        )
        cls.admin = cls._create_user(
            'admin.security@brightloop.test',
            'subscription_management.group_subscription_admin',
        )
        cls.customer_a = cls._create_user(
            'customer.a@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        cls.customer_b = cls._create_user(
            'customer.b@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        cls.invoice_a = cls._create_posted_invoice(cls.customer_a.partner_id)

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

    @classmethod
    def _create_posted_invoice(cls, partner):
        income = cls.env['account.account'].search([
            ('account_type', '=', 'income'),
        ], limit=1)
        move = cls.env['account.move'].create({
            'move_type': 'out_invoice',
            'partner_id': partner.id,
            'invoice_line_ids': [(0, 0, {
                'name': 'Security fixture',
                'quantity': 1,
                'price_unit': 25.0,
                'account_id': income.id,
            })],
        })
        move.action_post()
        return move

    def test_role_implications(self):
        self.assertTrue(self.customer_a.share)
        self.assertTrue(self.customer_a.has_group('base.group_portal'))
        self.assertFalse(self.customer_a.has_group('base.group_user'))

        self.assertTrue(self.staff.has_group('account.group_account_invoice'))
        self.assertTrue(self.staff.has_group('sales_team.group_sale_salesman_all_leads'))
        self.assertFalse(self.staff.has_group('base.group_erp_manager'))
        self.assertFalse(self.staff.has_group('account.group_account_manager'))
        self.assertFalse(self.staff.has_group('product.group_product_manager'))
        self.assertFalse(self.staff.has_group('base.group_system'))

        self.assertTrue(self.admin.has_group('subscription_management.group_subscription_staff'))
        self.assertTrue(self.admin.has_group('account.group_account_manager'))
        self.assertTrue(self.admin.has_group('product.group_product_manager'))
        self.assertTrue(self.admin.has_group('base.group_erp_manager'))
        self.assertFalse(self.admin.has_group('base.group_system'))

    def test_staff_cannot_create_users(self):
        with self.assertRaises(AccessError):
            self.env['res.users'].with_user(self.staff).create({
                'name': 'Extra staff',
                'login': 'extra.staff@brightloop.test',
                'password': 'Validpass1!',
            })

    def test_admin_can_create_staff_user(self):
        created = self.env['res.users'].with_user(self.admin).create({
            'name': 'Hired staff',
            'login': 'hired.staff@brightloop.test',
            'password': 'Validpass1!',
            'group_ids': [(6, 0, [self.env.ref('subscription_management.group_subscription_staff').id])],
        })
        self.assertTrue(created.has_group('subscription_management.group_subscription_staff'))

    def test_staff_cannot_change_taxes(self):
        tax = self.env['account.tax'].search([('type_tax_use', '=', 'sale')], limit=1)
        self.assertTrue(tax)
        with self.assertRaises(AccessError):
            tax.with_user(self.staff).write({'amount': tax.amount})
        tax.with_user(self.admin).write({'name': tax.name})

    def test_staff_cannot_create_products(self):
        with self.assertRaises(AccessError):
            self.env['product.template'].with_user(self.staff).create({
                'name': 'Staff product',
            })
        product = self.env['product.template'].with_user(self.admin).create({
            'name': 'Admin product',
        })
        self.assertEqual(product.name, 'Admin product')

    def test_customer_cannot_read_other_customer_records(self):
        partners = self.env['res.partner'].with_user(self.customer_a)
        self.assertIn(self.customer_a.partner_id, partners.search([]))
        self.assertNotIn(self.customer_b.partner_id, partners.search([]))
        with self.assertRaises(AccessError):
            self.customer_b.partner_id.with_user(self.customer_a).read(['name'])

        invoices = self.env['account.move'].with_user(self.customer_a)
        self.assertIn(self.invoice_a, invoices.search([]))
        with self.assertRaises(AccessError):
            self.invoice_a.with_user(self.customer_b).read(['name'])

        users = self.env['res.users'].with_user(self.customer_a).search([])
        self.assertIn(self.customer_a, users)
        self.assertNotIn(self.customer_b, users)
        self.assertNotIn(self.staff, users)

    def test_staff_can_read_customer_invoice_customer_cannot_create_partner(self):
        self.assertIn(
            self.invoice_a,
            self.env['account.move'].with_user(self.staff).search([('id', '=', self.invoice_a.id)]),
        )
        with self.assertRaises(AccessError):
            self.env['res.partner'].with_user(self.customer_a).create({'name': 'Smuggled'})
        partner = self.env['res.partner'].with_user(self.staff).create({'name': 'Walk-in customer'})
        self.assertTrue(partner)

    def test_password_policy_and_unique_email(self):
        Users = self.env['res.users']
        for password in ('Abcd123!', 'longpassword', 'Longpassword', 'Longpassword1'):
            with self.assertRaises(UserError):
                Users.create({
                    'name': 'Weak',
                    'login': 'weak-%s@brightloop.test' % password,
                    'password': password,
                })
        user = Users.create({
            'name': 'Mixed Case',
            'login': 'Person@Example.com',
            'password': 'Validpass1!',
        })
        self.assertEqual(user.login, 'person@example.com')
        with self.assertRaises(ValidationError):
            Users.create({
                'name': 'Duplicate',
                'login': 'PERSON@example.com',
                'password': 'Validpass1!',
            })

    def test_password_reset_stays_on_auth_signup(self):
        params = self.env['ir.config_parameter'].sudo()
        self.assertEqual(params.get_param('auth_signup.reset_password'), 'True')
        self.assertGreaterEqual(int(params.get_param('auth_password_policy.minlength')), 9)
