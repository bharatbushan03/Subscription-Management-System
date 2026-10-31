from odoo import api, models, _
from odoo.exceptions import ValidationError


class ProductTemplateAttributeValue(models.Model):
    _inherit = 'product.template.attribute.value'

    @api.constrains('price_extra')
    def _check_price_extra_nonnegative(self):
        for value in self:
            if value.price_extra < 0:
                raise ValidationError(_("Variant extra price cannot be negative."))
