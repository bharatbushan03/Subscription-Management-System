from datetime import timedelta

from odoo import api, fields, models, _
from odoo.exceptions import AccessError, ValidationError
from psycopg2 import IntegrityError


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
    subscription_start_date = fields.Date(
        string='Subscription Start Date',
        help='Optional start date used when converting this quotation.',
    )
    subscription_expiry_date = fields.Date(
        string='Subscription Expiry Date',
        help='Optional expiry date used when converting this quotation.',
    )
    subscription_id = fields.Many2one(
        'subscription.subscription',
        string='Subscription',
        readonly=True,
        copy=False,
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
        'subscription_start_date',
        'subscription_expiry_date',
    )
    def _check_subscription_quotation(self):
        for order in self.filtered('subscription_plan_id'):
            plan = order.subscription_plan_id
            quotation_date = fields.Date.to_date(order.date_order)
            if (
                order.subscription_start_date
                and order.subscription_expiry_date
                and order.subscription_expiry_date < order.subscription_start_date
            ):
                raise ValidationError(
                    _("The subscription expiry date cannot be earlier than its start date.")
                )
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

    def action_convert_to_subscription(self):
        self.ensure_one()
        if not (
            self.env.user.has_group('subscription_management.group_subscription_staff')
            or self.env.user.has_group('subscription_management.group_subscription_admin')
        ):
            raise AccessError(_("Only subscription staff can convert quotations."))
        if self.state != 'sale':
            raise ValidationError(
                _("Only an accepted quotation can be converted to a subscription.")
            )
        existing = self.env['subscription.subscription'].search(
            [('quotation_id', '=', self.id)],
            limit=1,
        )
        if existing:
            return existing._get_form_action()
        if self.subscription_id:
            return self.subscription_id._get_form_action()
        if not self.subscription_plan_id:
            raise ValidationError(_("An accepted quotation must have a subscription plan."))
        today = fields.Date.context_today(self)
        if self.validity_date and self.validity_date < today:
            raise ValidationError(_("An expired quotation cannot be converted."))
        self._check_subscription_quotation()
        plan = self.subscription_plan_id
        start_date = fields.Date.to_date(
            self.subscription_start_date
            or fields.Date.to_date(self.date_order)
            or today
        )
        plan._check_available_for_new_subscription(start_date)
        next_invoice_date = plan.get_next_billing_date(start_date)
        expiry_date = fields.Date.to_date(
            self.subscription_expiry_date
            or (next_invoice_date - timedelta(days=1))
        )
        if expiry_date < start_date:
            raise ValidationError(
                _("The subscription expiry date cannot be earlier than its start date.")
            )
        lines = self.order_line.filtered(lambda line: not line.display_type)
        if not lines:
            raise ValidationError(_("An accepted quotation must contain product lines."))
        line_values = [
            (0, 0, {
                'product_id': line.product_id.id,
                'quantity': line.product_uom_qty,
                'unit_price': line.price_unit,
                'tax_ids': [(6, 0, line.tax_ids.ids)],
                'discount': line.discount,
            })
            for line in lines
        ]
        values = {
            'partner_id': self.partner_id.id,
            'plan_id': plan.id,
            'start_date': start_date,
            'expiry_date': expiry_date,
            'next_invoice_date': start_date,
            'payment_term_id': self.payment_term_id.id,
            'currency_id': self.currency_id.id,
            'quotation_id': self.id,
            'note': self.note,
            'responsible_user_id': self.user_id.id,
            'converted_at': fields.Datetime.now(),
            'converted_by_id': self.env.user.id,
            'line_ids': line_values,
        }
        Subscription = self.env['subscription.subscription']
        try:
            with self.env.cr.savepoint():
                subscription = Subscription.create(values)
                subscription.action_create_quotation()
                subscription.action_confirm()
                if start_date <= today:
                    subscription.action_activate()
                self.write({'subscription_id': subscription.id})
                self.message_post(
                    body=_("Converted to subscription %s.") % subscription.display_name
                )
        except IntegrityError:
            subscription = Subscription.search(
                [('quotation_id', '=', self.id)],
                limit=1,
            )
            if not subscription:
                raise
            return subscription._get_form_action()
        return subscription._get_form_action()

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
