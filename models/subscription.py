from datetime import timedelta

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class Subscription(models.Model):
    _name = 'subscription.subscription'
    _description = 'Subscription'
    _order = 'start_date desc, id desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    _sql_constraints = [
        (
            'subscription_number_unique',
            'unique(subscription_number)',
            'Subscription number must be unique.',
        ),
        (
            'subscription_renewal_unique',
            'unique(previous_subscription_id)',
            'A subscription can only be renewed once.',
        ),
    ]

    subscription_number = fields.Char(
        required=True,
        copy=False,
        default='New',
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Customer',
        required=True,
        ondelete='restrict',
        index=True,
    )
    plan_id = fields.Many2one(
        'subscription.plan',
        required=True,
        ondelete='restrict',
        index=True,
    )
    start_date = fields.Date(required=True, default=fields.Date.context_today)
    expiry_date = fields.Date(required=True)
    next_invoice_date = fields.Date(required=True)
    payment_term_id = fields.Many2one(
        'account.payment.term',
        string='Payment Terms',
        ondelete='restrict',
    )
    currency_id = fields.Many2one(
        'res.currency',
        required=True,
        default=lambda self: self.env.company.currency_id,
    )
    state = fields.Selection(
        [
            ('draft', 'Draft'),
            ('quotation', 'Quotation'),
            ('confirmed', 'Confirmed'),
            ('active', 'Active'),
            ('paused', 'Paused'),
            ('closed', 'Closed'),
        ],
        required=True,
        default='draft',
        index=True,
        tracking=True,
    )
    quotation_id = fields.Many2one(
        'sale.order',
        string='Quotation',
        ondelete='restrict',
    )
    previous_subscription_id = fields.Many2one(
        'subscription.subscription',
        string='Previous Subscription',
        readonly=True,
        copy=False,
        ondelete='restrict',
    )
    renewal_subscription_id = fields.Many2one(
        'subscription.subscription',
        string='Renewal',
        readonly=True,
        copy=False,
        ondelete='restrict',
    )
    line_ids = fields.One2many(
        'subscription.line',
        'subscription_id',
        string='Products',
        copy=True,
    )
    invoice_ids = fields.One2many(
        'account.move',
        'subscription_id',
        string='Invoices',
        readonly=True,
    )
    note = fields.Text(string='Internal Notes')
    responsible_user_id = fields.Many2one(
        'res.users',
        string='Responsible User',
        required=True,
        default=lambda self: self.env.user,
        ondelete='restrict',
    )
    amount_untaxed = fields.Monetary(
        compute='_compute_amounts',
        currency_field='currency_id',
        store=True,
    )
    amount_tax = fields.Monetary(
        compute='_compute_amounts',
        currency_field='currency_id',
        store=True,
    )
    amount_total = fields.Monetary(
        compute='_compute_amounts',
        currency_field='currency_id',
        store=True,
    )
    billing_eligible = fields.Boolean(
        compute='_compute_billing_eligible',
        help='Whether recurring billing may process this subscription.',
    )

    @api.depends('state', 'expiry_date')
    def _compute_billing_eligible(self):
        today = fields.Date.context_today(self)
        for subscription in self:
            subscription.billing_eligible = bool(
                subscription.state == 'active'
                and subscription.expiry_date >= today
            )

    @api.model_create_multi
    def create(self, vals_list):
        sequence = self.env.ref(
            'subscription_management.seq_subscription_subscription',
            raise_if_not_found=False,
        )
        for vals in vals_list:
            if not vals.get('subscription_number') or vals['subscription_number'] == 'New':
                vals['subscription_number'] = (
                    sequence.sudo().next_by_id() if sequence else _('New')
                )
            if self.with_context(active_test=False).search_count([
                ('subscription_number', '=', vals['subscription_number']),
            ]):
                raise ValidationError(_("Subscription number must be unique."))
        subscriptions = super().create(vals_list)
        subscriptions._validate_subscription()
        subscriptions._post_lifecycle_message(_("Subscription created."))
        return subscriptions

    def write(self, vals):
        if 'subscription_number' in vals and self.with_context(
            active_test=False
        ).search_count([
            ('subscription_number', '=', vals['subscription_number']),
            ('id', 'not in', self.ids),
        ]):
            raise ValidationError(_("Subscription number must be unique."))
        result = super().write(vals)
        self._validate_subscription()
        return result

    @api.depends('line_ids.subtotal', 'line_ids.tax_amount', 'line_ids.total')
    def _compute_amounts(self):
        for subscription in self:
            subscription.amount_untaxed = sum(subscription.line_ids.mapped('subtotal'))
            subscription.amount_tax = sum(subscription.line_ids.mapped('tax_amount'))
            subscription.amount_total = sum(subscription.line_ids.mapped('total'))

    @api.constrains(
        'partner_id',
        'plan_id',
        'start_date',
        'expiry_date',
        'next_invoice_date',
        'currency_id',
        'line_ids',
    )
    def _check_subscription(self):
        self._validate_subscription()

    def _validate_subscription(self):
        for subscription in self:
            if subscription.expiry_date < subscription.start_date:
                raise ValidationError(
                    _("The expiry date cannot be earlier than the start date.")
                )
            if not (
                subscription.start_date
                <= subscription.next_invoice_date
                <= subscription.expiry_date
            ):
                raise ValidationError(
                    _("The next invoice date must be between the start and expiry dates.")
                )
            subscription.plan_id._check_available_for_new_subscription(
                subscription.start_date
            )
            if subscription.currency_id != subscription.plan_id.currency_id:
                raise ValidationError(
                    _("The subscription currency must match the plan currency.")
                )
            if not subscription.line_ids:
                raise ValidationError(_("A subscription must contain at least one line."))
            for line in subscription.line_ids:
                line._validate_subscription_line()
        return True

    def _check_transition(self, allowed_states):
        for subscription in self:
            if subscription.state not in allowed_states:
                raise ValidationError(
                    _("Subscription '%s' cannot transition from %s.")
                    % (subscription.display_name, subscription.state)
                )
        return True

    def _post_lifecycle_message(self, message):
        for subscription in self:
            subscription.message_post(body=message)

    def action_create_quotation(self):
        self._check_transition(('draft',))
        self._validate_subscription()
        self.write({'state': 'quotation'})
        self._post_lifecycle_message(_("Quotation prepared."))
        return True

    def action_confirm(self):
        self._check_transition(('quotation',))
        for subscription in self:
            if not subscription.payment_term_id:
                raise ValidationError(_("Payment terms are required before confirmation."))
            subscription._validate_subscription()
        self.write({'state': 'confirmed'})
        self._post_lifecycle_message(_("Subscription confirmed."))
        return True

    def action_activate(self):
        self._check_transition(('confirmed',))
        today = fields.Date.context_today(self)
        for subscription in self:
            if subscription.start_date > today:
                raise ValidationError(_("A subscription cannot be activated before its start date."))
            if subscription.expiry_date < today:
                raise ValidationError(_("An expired subscription cannot be activated."))
            subscription._validate_subscription()
        self.write({
            'state': 'active',
            'next_invoice_date': fields.Date.context_today(self),
        })
        self._post_lifecycle_message(_("Subscription activated."))
        return True

    def action_pause(self):
        self._check_transition(('active',))
        for subscription in self:
            if not subscription.plan_id.can_pause():
                raise ValidationError(_("This subscription plan does not allow pausing."))
        self.write({'state': 'paused'})
        self._post_lifecycle_message(_("Subscription paused."))
        return True

    def action_resume(self):
        self._check_transition(('paused',))
        today = fields.Date.context_today(self)
        for subscription in self:
            if subscription.expiry_date < today:
                raise ValidationError(_("An expired subscription cannot be resumed."))
        self.write({'state': 'active'})
        self._post_lifecycle_message(_("Subscription resumed."))
        return True

    def action_close(self):
        self._check_transition(('confirmed', 'active', 'paused'))
        today = fields.Date.context_today(self)
        for subscription in self:
            if (
                subscription.expiry_date > today
                and not subscription.plan_id.can_close_early()
            ):
                raise ValidationError(
                    _("This subscription plan does not allow early closure.")
                )
        self.write({'state': 'closed'})
        self._post_lifecycle_message(_("Subscription closed."))
        return True

    def action_renew(self):
        self._check_transition(('closed',))
        today = fields.Date.context_today(self)
        renewed = self.env['subscription.subscription']
        for subscription in self:
            if subscription.renewal_subscription_id:
                raise ValidationError(_("This subscription has already been renewed."))
            if not subscription.plan_id.can_renew():
                raise ValidationError(_("This subscription plan does not allow renewal."))
            start_date = max(
                subscription.expiry_date + timedelta(days=1),
                today,
            )
            next_date = subscription.plan_id.get_next_billing_date(start_date)
            renewal = self.create({
                'partner_id': subscription.partner_id.id,
                'plan_id': subscription.plan_id.id,
                'start_date': start_date,
                'expiry_date': next_date - timedelta(days=1),
                'next_invoice_date': start_date,
                'payment_term_id': subscription.payment_term_id.id,
                'currency_id': subscription.currency_id.id,
                'previous_subscription_id': subscription.id,
                'responsible_user_id': subscription.responsible_user_id.id,
                'line_ids': [
                    (0, 0, {
                        'product_id': line.product_id.id,
                        'quantity': line.quantity,
                        'unit_price': line.unit_price,
                        'tax_ids': [(6, 0, line.tax_ids.ids)],
                        'discount': line.discount,
                    })
                    for line in subscription.line_ids
                ],
            })
            subscription.write({'renewal_subscription_id': renewal.id})
            subscription._post_lifecycle_message(
                _("Renewal created: %s.") % renewal.display_name
            )
            renewal._post_lifecycle_message(
                _("Renewed from %s.") % subscription.display_name
            )
            renewed |= renewal
        return renewed

    def _close_expired_subscriptions(self):
        today = fields.Date.context_today(self)
        subscriptions = self.search([
            ('state', 'in', ('active', 'paused')),
            ('expiry_date', '<=', today),
        ]).filtered(lambda subscription: subscription.plan_id.automatic_closure)
        if subscriptions:
            subscriptions.action_close()
        return subscriptions

    @api.model
    def cron_close_expired_subscriptions(self):
        return self._close_expired_subscriptions()


class SubscriptionLine(models.Model):
    _name = 'subscription.line'
    _description = 'Subscription Line'
    _order = 'subscription_id, id'

    subscription_id = fields.Many2one(
        'subscription.subscription',
        required=True,
        ondelete='cascade',
        index=True,
    )
    product_id = fields.Many2one(
        'product.product',
        required=True,
        ondelete='restrict',
    )
    quantity = fields.Float(required=True, default=1.0)
    unit_price = fields.Monetary(
        required=True,
        currency_field='currency_id',
    )
    tax_ids = fields.Many2many(
        'account.tax',
        string='Taxes',
        domain="[('type_tax_use', '=', 'sale')]",
    )
    discount = fields.Float(string='Discount (%)', default=0.0)
    currency_id = fields.Many2one(
        related='subscription_id.currency_id',
        store=True,
        readonly=True,
    )
    subtotal = fields.Monetary(
        compute='_compute_amounts',
        currency_field='currency_id',
        store=True,
    )
    tax_amount = fields.Monetary(
        compute='_compute_amounts',
        currency_field='currency_id',
        store=True,
    )
    total = fields.Monetary(
        compute='_compute_amounts',
        currency_field='currency_id',
        store=True,
    )

    _sql_constraints = [
        (
            'subscription_line_quantity_positive',
            'check(quantity > 0)',
            'Product quantity must be positive.',
        ),
        (
            'subscription_line_unit_price_nonnegative',
            'check(unit_price >= 0)',
            'Unit price cannot be negative.',
        ),
        (
            'subscription_line_discount_valid',
            'check(discount >= 0 and discount <= 100)',
            'Discount must be between 0 and 100 percent.',
        ),
    ]

    @api.depends(
        'quantity',
        'unit_price',
        'discount',
        'tax_ids',
        'subscription_id.partner_id',
        'currency_id',
    )
    def _compute_amounts(self):
        for line in self:
            discounted_price = line.unit_price * (1 - line.discount / 100)
            taxes = line.tax_ids.compute_all(
                discounted_price,
                currency=line.currency_id,
                quantity=line.quantity,
                product=line.product_id,
                partner=line.subscription_id.partner_id,
            )
            line.subtotal = taxes['total_excluded']
            line.tax_amount = taxes['total_included'] - taxes['total_excluded']
            line.total = taxes['total_included']

    @api.constrains(
        'subscription_id',
        'product_id',
        'quantity',
        'unit_price',
        'discount',
        'currency_id',
        'tax_ids',
    )
    def _check_line(self):
        for line in self:
            line._validate_subscription_line()

    def _validate_subscription_line(self):
        self.ensure_one()
        if self.quantity <= 0:
            raise ValidationError(_("Product quantity must be positive."))
        if self.unit_price < 0:
            raise ValidationError(_("Unit price cannot be negative."))
        if not 0 <= self.discount <= 100:
            raise ValidationError(_("Discount must be between 0 and 100 percent."))
        if self.currency_id != self.subscription_id.currency_id:
            raise ValidationError(_("Line currency must match the subscription currency."))
        self.subscription_id.plan_id._check_available_for_new_subscription(
            self.subscription_id.start_date
        )
        if not self.subscription_id.plan_id.line_ids.filtered(
            lambda plan_line: plan_line.matches_product(self.product_id)
        ):
            raise ValidationError(
                _("The product '%s' is not included in the subscription plan.")
                % self.product_id.display_name
            )
        return True


class AccountMove(models.Model):
    _inherit = 'account.move'

    subscription_id = fields.Many2one(
        'subscription.subscription',
        string='Subscription',
        ondelete='restrict',
        index=True,
    )
