from datetime import date

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class SubscriptionDiscount(models.Model):
    _name = 'subscription.discount'
    _description = 'Subscription Discount'
    _order = 'name'

    name = fields.Char(required=True)
    description = fields.Text()
    discount_type = fields.Selection(
        [('fixed', 'Fixed Amount'), ('percentage', 'Percentage')],
        required=True,
        default='percentage',
    )
    value = fields.Monetary(required=True, currency_field='currency_id')
    minimum_purchase_amount = fields.Monetary(
        currency_field='currency_id', default=0
    )
    minimum_quantity = fields.Float(default=0)
    start_date = fields.Date()
    end_date = fields.Date()
    maximum_usage_count = fields.Integer()
    usage_count = fields.Integer(default=0, readonly=True, copy=False)
    active = fields.Boolean(default=True)
    product_ids = fields.Many2many('product.product')
    plan_ids = fields.Many2many('subscription.plan')
    scope = fields.Selection(
        [('products', 'Specific Products'), ('subscription', 'Entire Subscription')],
        required=True,
        default='products',
    )
    company_id = fields.Many2one(
        'res.company', required=True, default=lambda self: self.env.company
    )
    currency_id = fields.Many2one(
        'res.currency', required=True, default=lambda self: self.env.company.currency_id
    )
    application_ids = fields.One2many(
        'subscription.discount.application',
        'discount_id',
        readonly=True,
    )

    @api.constrains('value', 'minimum_purchase_amount', 'minimum_quantity',
                    'maximum_usage_count', 'start_date', 'end_date')
    def _check_discount_values(self):
        for discount in self:
            if discount.value < 0 or discount.minimum_purchase_amount < 0:
                raise ValidationError(_("Discount values cannot be negative."))
            if discount.discount_type == 'percentage' and discount.value > 100:
                raise ValidationError(_("Percentage discounts cannot exceed 100%."))
            if discount.minimum_quantity < 0 or discount.maximum_usage_count < 0:
                raise ValidationError(_("Discount limits cannot be negative."))
            if discount.start_date and discount.end_date and discount.end_date < discount.start_date:
                raise ValidationError(_("Discount end date cannot precede its start date."))

    def _is_eligible(self, subscription, lines, period_date):
        self.ensure_one()
        if (
            not self.active
            or self.company_id != subscription.env.company
            or self.currency_id != subscription.currency_id
        ):
            return False
        if self.start_date and period_date < self.start_date:
            return False
        if self.end_date and period_date > self.end_date:
            return False
        if self.maximum_usage_count and (self.usage_count or 0) >= self.maximum_usage_count:
            return False
        if self.plan_ids and subscription.plan_id not in self.plan_ids:
            return False
        if self.scope == 'products':
            lines = lines.filtered(lambda line: line.product_id in self.product_ids)
            if not lines:
                return False
        purchase_amount = sum(lines.mapped('subtotal'))
        quantity = sum(lines.mapped('quantity'))
        return (
            purchase_amount >= self.minimum_purchase_amount
            and quantity >= self.minimum_quantity
        )

    def _reserve_usage(self):
        self.ensure_one()
        self.env.cr.execute(
            "SELECT usage_count, maximum_usage_count FROM subscription_discount "
            "WHERE id = %s FOR UPDATE",
            [self.id],
        )
        usage_count, maximum = self.env.cr.fetchone()
        usage_count = usage_count or 0
        maximum = maximum or 0
        if maximum and usage_count >= maximum:
            return False
        self.write({'usage_count': usage_count + 1})
        return True


class SubscriptionDiscountApplication(models.Model):
    _name = 'subscription.discount.application'
    _description = 'Applied Subscription Discount'

    discount_id = fields.Many2one('subscription.discount', required=True, ondelete='restrict')
    partner_id = fields.Many2one('res.partner', required=True, ondelete='restrict')
    subscription_id = fields.Many2one(
        'subscription.subscription', required=True, ondelete='restrict'
    )
    invoice_id = fields.Many2one('account.move', required=True, ondelete='restrict')
    amount = fields.Monetary(required=True, currency_field='currency_id')
    applied_at = fields.Datetime(default=fields.Datetime.now, required=True)
    billing_period_start = fields.Date(required=True)
    billing_period_end = fields.Date(required=True)
    currency_id = fields.Many2one('res.currency', required=True)
    state = fields.Selection(
        [('applied', 'Applied'), ('reversed', 'Reversed')],
        default='applied',
        required=True,
    )

    _sql_constraints = [
        (
            'discount_invoice_unique',
            'unique(discount_id, invoice_id)',
            'A discount can only be applied once to an invoice.',
        ),
    ]
