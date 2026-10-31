from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class ProductProduct(models.Model):
    _inherit = 'product.product'

    standard_price = fields.Float(
        company_dependent=True,
        groups='product.group_product_manager',
    )

    @api.constrains('standard_price')
    def _check_standard_price_nonnegative(self):
        for product in self:
            if product.sudo().standard_price < 0:
                raise ValidationError(_("Cost price cannot be negative."))

    def _check_subscription_selectable(self):
        """Reject products that cannot be put on a new quotation or subscription."""
        for product in self:
            template = product.product_tmpl_id
            if not product.active or not template.active or not template.sale_ok:
                raise ValidationError(_(
                    "%(product)s cannot be added. The product must be active and available for sale.",
                    product=template.display_name,
                ))
