from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    subscription_plan_id = fields.Many2one(
        'subscription.plan',
        string='Subscription Plan',
        ondelete='restrict',
    )

    @api.constrains('product_id')
    def _check_product_subscription_selectable(self):
        self.product_id._check_subscription_selectable()

    @api.constrains('subscription_plan_id', 'product_id', 'product_uom_qty')
    def _check_subscription_plan_line(self):
        for line in self.filtered('subscription_plan_id'):
            plan = line.subscription_plan_id
            plan._check_available_for_new_subscription()
            plan.validate_quantity(line.product_uom_qty)
            if not plan.line_ids.filtered(lambda plan_line: plan_line.matches_product(line.product_id)):
                raise ValidationError(_(
                    "The product '%(product)s' is not included in plan '%(plan)s'.",
                    product=line.product_id.display_name,
                    plan=plan.display_name,
                ))
