from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # Keep the native compute. Restrict cost to product managers, which subscription administrators have.
    standard_price = fields.Float(
        compute='_compute_standard_price',
        inverse='_set_standard_price',
        search='_search_standard_price',
        groups='product.group_product_manager',
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not str(vals.get('name') or '').strip():
                raise ValidationError(_("Product name is required."))
        return super().create(vals_list)

    def write(self, vals):
        if 'name' in vals and not str(vals.get('name') or '').strip():
            raise ValidationError(_("Product name is required."))
        return super().write(vals)

    @api.constrains('list_price')
    def _check_list_price_nonnegative(self):
        for template in self:
            if template.list_price < 0:
                raise ValidationError(_("Sales price cannot be negative."))

    @api.constrains('standard_price')
    def _check_standard_price_nonnegative(self):
        for template in self:
            if template.standard_price < 0:
                raise ValidationError(_("Cost price cannot be negative."))
