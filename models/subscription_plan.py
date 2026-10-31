from dateutil.relativedelta import relativedelta

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class SubscriptionPlan(models.Model):
    _name = 'subscription.plan'
    _description = 'Subscription Plan'
    _order = 'name'

    name = fields.Char(required=True)
    description = fields.Text()
    recurring_price = fields.Monetary(required=True, currency_field='currency_id')
    currency_id = fields.Many2one(
        'res.currency',
        required=True,
        default=lambda self: self.env.company.currency_id,
    )
    billing_frequency = fields.Selection(
        [
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('yearly', 'Yearly'),
        ],
        required=True,
        default='monthly',
    )
    minimum_quantity = fields.Float(required=True, default=1.0)
    available_from = fields.Date()
    available_until = fields.Date()
    automatic_closure = fields.Boolean()
    allow_early_closure = fields.Boolean()
    allow_pause = fields.Boolean()
    allow_renewal = fields.Boolean()
    active = fields.Boolean(default=True)
    available_for_selection = fields.Boolean(
        compute='_compute_available_for_selection',
        search='_search_available_for_selection',
    )
    line_ids = fields.One2many(
        'subscription.plan.line',
        'plan_id',
        string='Products',
        copy=True,
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not str(vals.get('name') or '').strip():
                raise ValidationError(_("Plan name is required."))
        return super().create(vals_list)

    def write(self, vals):
        if 'name' in vals and not str(vals.get('name') or '').strip():
            raise ValidationError(_("Plan name is required."))
        return super().write(vals)

    @api.constrains('name')
    def _check_name(self):
        for plan in self:
            if not plan.name or not plan.name.strip():
                raise ValidationError(_("Plan name is required."))

    @api.constrains('recurring_price')
    def _check_recurring_price(self):
        for plan in self:
            if plan.recurring_price < 0:
                raise ValidationError(_("Recurring price cannot be negative."))

    @api.constrains('minimum_quantity')
    def _check_minimum_quantity(self):
        for plan in self:
            if plan.minimum_quantity < 1:
                raise ValidationError(_("Minimum quantity must be at least one."))

    @api.constrains('available_from', 'available_until')
    def _check_availability_dates(self):
        for plan in self:
            if (
                plan.available_from
                and plan.available_until
                and plan.available_until < plan.available_from
            ):
                raise ValidationError(
                    _("The end date cannot be earlier than the start date.")
                )

    @api.depends('active', 'available_from', 'available_until')
    def _compute_available_for_selection(self):
        today = fields.Date.context_today(self)
        for plan in self:
            plan.available_for_selection = plan.is_available(today)

    @api.model
    def _search_available_for_selection(self, operator, value):
        if operator not in ('=', '!=') or not isinstance(value, bool):
            raise ValidationError(_("Unsupported plan availability search."))
        domain = [
            ('active', '=', value if operator == '=' else not value),
        ]
        if value == (operator == '='):
            today = fields.Date.context_today(self)
            domain += [
                '|',
                ('available_from', '=', False),
                ('available_from', '<=', today),
                '|',
                ('available_until', '=', False),
                ('available_until', '>=', today),
            ]
        return domain

    def is_available(self, on_date=None):
        """Return whether the plan can be selected on the given date."""
        self.ensure_one()
        on_date = fields.Date.to_date(on_date or fields.Date.context_today(self))
        return bool(
            self.active
            and (not self.available_from or on_date >= self.available_from)
            and (not self.available_until or on_date <= self.available_until)
        )

    def _check_available_for_new_subscription(self, on_date=None):
        self.ensure_one()
        if not self.is_available(on_date):
            raise ValidationError(
                _("The plan '%s' is inactive or outside its availability dates.")
                % self.display_name
            )
        if not self.line_ids.filtered('active'):
            raise ValidationError(
                _("The plan '%s' must have an active product line.") % self.display_name
            )
        return True

    def validate_quantity(self, quantity):
        self.ensure_one()
        if quantity < self.minimum_quantity:
            raise ValidationError(
                _("The quantity for '%(plan)s' must be at least %(minimum)s.")
                % {
                    'plan': self.display_name,
                    'minimum': self.minimum_quantity,
                }
            )
        return True

    def get_next_billing_date(self, start_date):
        self.ensure_one()
        start_date = fields.Date.to_date(start_date)
        increments = {
            'daily': relativedelta(days=1),
            'weekly': relativedelta(weeks=1),
            'monthly': relativedelta(months=1),
            'yearly': relativedelta(years=1),
        }
        return start_date + increments[self.billing_frequency]

    def automatic_closure_applies(self, on_date=None):
        self.ensure_one()
        on_date = fields.Date.to_date(on_date or fields.Date.context_today(self))
        return bool(
            self.automatic_closure
            and self.available_until
            and on_date >= self.available_until
        )

    def can_pause(self):
        self.ensure_one()
        return self.allow_pause

    def can_close_early(self):
        self.ensure_one()
        return self.allow_early_closure

    def can_renew(self):
        self.ensure_one()
        return self.allow_renewal


class SubscriptionPlanLine(models.Model):
    _name = 'subscription.plan.line'
    _description = 'Subscription Plan Product'
    _order = 'plan_id, id'

    plan_id = fields.Many2one(
        'subscription.plan',
        required=True,
        ondelete='cascade',
    )
    product_tmpl_id = fields.Many2one(
        'product.template',
        string='Product',
        required=True,
        ondelete='restrict',
    )
    product_id = fields.Many2one(
        'product.product',
        string='Product Variant',
        ondelete='restrict',
        domain="[('product_tmpl_id', '=', product_tmpl_id)]",
    )
    minimum_quantity = fields.Float(required=True, default=1.0)
    unit_price = fields.Monetary(
        required=True,
        currency_field='currency_id',
    )
    currency_id = fields.Many2one(related='plan_id.currency_id', store=True)
    tax_ids = fields.Many2many(
        'account.tax',
        string='Taxes',
        domain="[('type_tax_use', '=', 'sale')]",
    )
    active = fields.Boolean(default=True)

    @api.constrains('product_id', 'product_tmpl_id')
    def _check_product_variant(self):
        for line in self:
            if (
                line.product_id
                and line.product_id.product_tmpl_id != line.product_tmpl_id
            ):
                raise ValidationError(
                    _("The selected product variant must belong to the selected product.")
                )

    @api.constrains('minimum_quantity')
    def _check_minimum_quantity(self):
        for line in self:
            if line.minimum_quantity < 1:
                raise ValidationError(_("Minimum quantity must be at least one."))

    @api.constrains('unit_price')
    def _check_unit_price(self):
        for line in self:
            if line.unit_price < 0:
                raise ValidationError(_("Unit price cannot be negative."))

    def matches_product(self, product):
        self.ensure_one()
        return bool(
            self.active
            and (
                self.product_id == product
                or (not self.product_id and self.product_tmpl_id == product.product_tmpl_id)
            )
        )
