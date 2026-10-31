from datetime import timedelta

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    subscription_plan_id = fields.Many2one(
        'subscription.plan',
        string='Subscription Plan',
        ondelete='restrict',
        tracking=True,
    )
    quotation_expired = fields.Boolean(
        compute='_compute_quotation_expired',
        help='Whether this quotation is past its validity date.',
    )

    @api.depends('validity_date', 'state')
    def _compute_quotation_expired(self):
        today = fields.Date.context_today(self)
        for order in self:
            order.quotation_expired = bool(
                order.state in ('draft', 'sent')
                and order.validity_date
                and order.validity_date < today
            )

    @api.constrains(
        'subscription_plan_id',
        'order_line',
        'validity_date',
        'date_order',
        'sale_order_template_id',
    )
    def _check_subscription_quotation(self):
        for order in self.filtered('subscription_plan_id'):
            plan = order.subscription_plan_id
            quotation_date = fields.Date.to_date(order.date_order)
            plan._check_available_for_new_subscription(quotation_date)
            if order.validity_date and order.validity_date < quotation_date:
                raise ValidationError(_("Quotation validity cannot precede its creation date."))
            template = order.sale_order_template_id
            if template and template.applicable_plan_ids and plan not in template.applicable_plan_ids:
                raise ValidationError(
                    _("The selected subscription plan is not allowed by the quotation template.")
                )
            for line in order.order_line.filtered(lambda line: not line.display_type):
                plan.validate_quantity(line.product_uom_qty)
                if not plan.line_ids.filtered(
                    lambda plan_line: plan_line.matches_product(line.product_id)
                ):
                    raise ValidationError(_(
                        "The product '%(product)s' is not included in plan '%(plan)s'.",
                        product=line.product_id.display_name,
                        plan=plan.display_name,
                    ))

    @api.model
    def create(self, vals):
        order = super().create(vals)
        order._check_subscription_quotation()
        return order

    def write(self, vals):
        result = super().write(vals)
        self._check_subscription_quotation()
        return result

    def action_customer_accept(self):
        self.ensure_one()
        if self.state not in ('draft', 'sent'):
            raise ValidationError(_("Only an open quotation can be accepted."))
        self.sudo().action_confirm()
        self.message_post(body=_("Quotation accepted by the customer."))
        return True

    def action_customer_reject(self):
        self.ensure_one()
        if self.state not in ('draft', 'sent'):
            raise ValidationError(_("Only an open quotation can be rejected."))
        self.sudo().action_cancel()
        self.message_post(body=_("Quotation rejected by the customer."))
        return True


class SaleOrderTemplate(models.Model):
    _inherit = 'sale.order.template'

    applicable_plan_ids = fields.Many2many(
        'subscription.plan',
        'sale_order_template_subscription_plan_rel',
        'template_id',
        'plan_id',
        string='Applicable Subscription Plans',
        domain="[('available_for_selection', '=', True)]",
    )

    @api.constrains('number_of_days')
    def _check_validity_days(self):
        for template in self:
            if template.number_of_days < 0:
                raise ValidationError(_("Template validity duration cannot be negative."))
