from odoo import api, models


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    @api.constrains('product_id')
    def _check_product_subscription_selectable(self):
        self.product_id._check_subscription_selectable()
