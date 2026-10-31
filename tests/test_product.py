from odoo.exceptions import AccessError, ValidationError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestProductVariants(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.staff = cls._create_user(
            'staff.product@brightloop.test',
            'subscription_management.group_subscription_staff',
        )
        cls.admin = cls._create_user(
            'admin.product@brightloop.test',
            'subscription_management.group_subscription_admin',
        )
        cls.customer = cls._create_user(
            'customer.product@brightloop.test',
            'subscription_management.group_subscription_customer',
        )
        brand = cls.env['product.attribute'].create({
            'name': 'Brand',
            'create_variant': 'always',
        })
        cls.brand_standard = cls.env['product.attribute.value'].create({
            'name': 'Standard',
            'attribute_id': brand.id,
        })
        cls.brand_odoo = cls.env['product.attribute.value'].create({
            'name': 'Odoo',
            'attribute_id': brand.id,
        })
        sale_tax = cls.env['account.tax'].search([
            ('type_tax_use', '=', 'sale'),
            ('company_id', '=', cls.env.company.id),
        ], limit=1)
        cls.template = cls.env['product.template'].create({
            'name': 'Brightloop Subscription',
            'type': 'service',
            'list_price': 1000.0,
            'standard_price': 400.0,
            'default_code': 'BL-SUB',
            'description': '<p>Internal description</p>',
            'description_sale': 'Customer notes',
            'sale_ok': True,
            'taxes_id': [(6, 0, sale_tax.ids)],
            'attribute_line_ids': [(0, 0, {
                'attribute_id': brand.id,
                'value_ids': [(6, 0, [cls.brand_standard.id, cls.brand_odoo.id])],
            })],
        })
        extras = {
            'Standard': 0.0,
            'Odoo': 560.0,
        }
        for value in cls.template.attribute_line_ids.product_template_value_ids:
            value.price_extra = extras[value.name]
        # Variant creation resets the template cost. Set it on the variants.
        cls.template.product_variant_ids.write({'standard_price': 400.0})
        cls.variant_standard = cls._variant_for(cls.brand_standard)
        cls.variant_odoo = cls._variant_for(cls.brand_odoo)

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
    def _variant_for(cls, attribute_value):
        return cls.template.product_variant_ids.filtered(
            lambda variant: attribute_value in variant.product_template_attribute_value_ids.product_attribute_value_id
        )

    def test_create_and_edit_product(self):
        self.assertEqual(self.template.name, 'Brightloop Subscription')
        self.assertEqual(self.template.type, 'service')
        self.assertEqual(self.template.list_price, 1000.0)
        self.assertEqual(self.variant_standard.standard_price, 400.0)
        self.assertEqual(self.variant_odoo.standard_price, 400.0)
        self.assertEqual(self.template.default_code, 'BL-SUB')
        self.assertIn('Internal description', self.template.description)
        self.assertEqual(self.template.description_sale, 'Customer notes')
        self.assertTrue(self.template.active)
        self.assertTrue(self.template.taxes_id)
        self.template.write({
            'list_price': 1100.0,
            'description_sale': 'Updated notes',
        })
        self.assertEqual(self.template.list_price, 1100.0)
        self.assertEqual(self.variant_odoo.lst_price, 1660.0)
        self.template.list_price = 1000.0

    def test_variant_price_extra(self):
        self.assertEqual(len(self.template.product_variant_ids), 2)
        self.assertEqual(self.variant_standard.price_extra, 0.0)
        self.assertEqual(self.variant_standard.lst_price, 1000.0)
        self.assertEqual(self.variant_odoo.price_extra, 560.0)
        self.assertEqual(self.variant_odoo.lst_price, 1560.0)

    def test_variant_on_sale_order_line(self):
        order = self.env['sale.order'].with_user(self.staff).create({
            'partner_id': self.customer.partner_id.id,
            'order_line': [(0, 0, {
                'product_id': self.variant_odoo.id,
                'product_uom_qty': 2,
            })],
        })
        line = order.order_line
        self.assertEqual(line.product_id, self.variant_odoo)
        self.assertEqual(line.product_uom_qty, 2)
        self.assertEqual(line.price_unit, 1560.0)
        portal_line = line.with_user(self.customer).read(['name', 'price_unit', 'product_uom_qty'])[0]
        self.assertEqual(portal_line['price_unit'], 1560.0)
        self.assertEqual(portal_line['product_uom_qty'], 2)

    def test_negative_prices_rejected(self):
        with self.assertRaises(ValidationError):
            self.template.write({'list_price': -1})
        with self.assertRaises(ValidationError):
            self.variant_standard.write({'standard_price': -1})
        extra = self.variant_odoo.product_template_attribute_value_ids[:1]
        with self.assertRaises(ValidationError):
            extra.price_extra = -1

    def test_name_required(self):
        with self.assertRaises(ValidationError):
            self.env['product.template'].create({'name': False, 'type': 'service'})

    def test_inactive_and_not_for_sale_cannot_be_added(self):
        self.template.active = False
        with self.assertRaises(ValidationError):
            self.env['sale.order'].with_context(active_test=False).create({
                'partner_id': self.customer.partner_id.id,
                'order_line': [(0, 0, {'product_id': self.variant_odoo.id})],
            })
        self.template.active = True
        self.template.sale_ok = False
        with self.assertRaises(ValidationError):
            self.env['sale.order'].create({
                'partner_id': self.customer.partner_id.id,
                'order_line': [(0, 0, {'product_id': self.variant_odoo.id})],
            })

    def test_cost_is_hidden_from_staff_and_customers(self):
        self.template.with_user(self.staff).read(['name', 'list_price'])
        with self.assertRaises(AccessError):
            self.variant_odoo.with_user(self.staff).read(['standard_price'])
        self.assertEqual(self.variant_odoo.with_user(self.admin).standard_price, 400.0)
        with self.assertRaises(AccessError):
            self.template.with_user(self.customer).read(['name'])
        with self.assertRaises(AccessError):
            self.variant_odoo.with_user(self.customer).read(['lst_price'])

    def test_admin_can_create_product_staff_cannot(self):
        product = self.env['product.template'].with_user(self.admin).create({
            'name': 'Admin created service',
            'type': 'service',
            'list_price': 50.0,
            'standard_price': 20.0,
        })
        self.assertEqual(product.standard_price, 20.0)
        with self.assertRaises(AccessError):
            self.env['product.template'].with_user(self.staff).create({
                'name': 'Staff created service',
                'type': 'service',
            })
