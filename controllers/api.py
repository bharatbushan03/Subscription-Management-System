from odoo import fields, http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import request


class SubscriptionApi(http.Controller):

    def _response(self, data):
        return request.make_json_response({'data': data})

    def _is_staff(self):
        return request.env.user.has_group(
            'subscription_management.group_subscription_staff'
        ) or request.env.user.has_group(
            'subscription_management.group_subscription_admin'
        )

    def _require_staff(self):
        if not self._is_staff():
            raise AccessError('Subscription staff access is required.')

    def _error(self, error):
        return request.make_json_response(
            {'error': str(error)}, status=400
        )

    def _date(self, value):
        return fields.Date.to_string(value) if value else None

    def _plan(self, plan):
        currency = plan.currency_id
        formatted_price = currency.format(plan.recurring_price)
        return {
            'id': plan.id,
            'name': plan.name,
            'description': plan.description or '',
            'recurring_price': plan.recurring_price,
            'currency': plan.currency_id.name,
            'billing_frequency': plan.billing_frequency,
            'minimum_quantity': plan.minimum_quantity,
            'active': plan.active,
            'available': plan.available_for_selection,
            'available_from': self._date(plan.available_from),
            'available_until': self._date(plan.available_until),
            'allow_pause': plan.allow_pause,
            'allow_renewal': plan.allow_renewal,
            'automatic_closure': plan.automatic_closure,
            'active_subscription_count': request.env[
                'subscription.subscription'
            ].search_count([
                ('plan_id', '=', plan.id),
                ('state', 'in', ('confirmed', 'active', 'paused')),
            ]),
            'tier': 'Subscription plan',
            'priceAnnual': formatted_price,
            'priceMonthly': formatted_price,
            'desc': plan.description or 'Subscription plan',
            'badge': 'Active' if plan.active else 'Archived',
            'badgeColor': 'success' if plan.active else 'neutral',
            'activeCount': '%s active subscriptions' % request.env[
                'subscription.subscription'
            ].search_count([
                ('plan_id', '=', plan.id),
                ('state', '=', 'active'),
            ]),
        }

    def _subscription(self, subscription):
        return {
            'id': subscription.id,
            'number': subscription.subscription_number,
            'customer_id': subscription.partner_id.id,
            'customer_name': subscription.partner_id.display_name,
            'plan_id': subscription.plan_id.id,
            'plan_name': subscription.plan_id.display_name,
            'amount': subscription.amount_total,
            'currency': subscription.currency_id.name,
            'billing_cycle': dict(
                subscription.plan_id._fields['billing_frequency'].selection
            ).get(subscription.plan_id.billing_frequency),
            'status': subscription.state,
            'next_billing': self._date(subscription.next_invoice_date),
            'start_date': self._date(subscription.start_date),
            'expiry_date': self._date(subscription.expiry_date),
            'billing_eligible': subscription.billing_eligible,
        }

    def _customer(self, partner):
        subscriptions = request.env['subscription.subscription'].search(
            [('partner_id', 'child_of', [partner.commercial_partner_id.id])]
        )
        return {
            'id': partner.id,
            'name': partner.display_name,
            'email': partner.email or '',
            'phone': partner.phone or '',
            'subscription_count': len(subscriptions),
            'active_subscription_count': len(
                subscriptions.filtered(lambda record: record.state == 'active')
            ),
            'status': 'active' if subscriptions else 'prospect',
        }

    def _invoice(self, invoice):
        amount = invoice.currency_id.format(invoice.amount_total)
        subtotal = invoice.currency_id.format(invoice.amount_untaxed)
        tax = invoice.currency_id.format(invoice.amount_tax)
        return {
            'id': invoice.id,
            'number': invoice.name or invoice.ref or str(invoice.id),
            'customer_id': invoice.partner_id.id,
            'customer': invoice.partner_id.display_name,
            'subscription_id': invoice.subscription_id.id,
            'subscription_number': invoice.subscription_id.subscription_number,
            'date': self._date(invoice.invoice_date),
            'due_date': self._date(invoice.invoice_date_due),
            'amount_total': invoice.amount_total,
            'amount_residual': invoice.amount_residual,
            'currency': invoice.currency_id.name,
            'state': invoice.state,
            'payment_state': invoice.payment_state,
            'billing_period_start': self._date(invoice.billing_period_start),
            'billing_period_end': self._date(invoice.billing_period_end),
            'hash': invoice.ref or str(invoice.id),
            'account': 'CUST-%s' % invoice.partner_id.id,
            'plan': invoice.subscription_id.plan_id.display_name,
            'amount': amount,
            'subtotal': subtotal,
            'tax': tax,
            'status': (
                'paid' if invoice.payment_state == 'paid'
                else 'past_due' if invoice.subscription_overdue
                else 'pending'
            ),
        }

    def _payment(self, payment):
        return {
            'id': payment.id,
            'name': payment.name,
            'customer_id': payment.partner_id.id,
            'customer': payment.partner_id.display_name,
            'amount': payment.amount,
            'currency': payment.currency_id.name,
            'date': self._date(payment.date),
            'state': payment.state,
        }

    @http.route('/api/me', type='http', auth='user', methods=['GET'], csrf=False)
    def me(self):
        user = request.env.user
        role = 'customer'
        if user.has_group('subscription_management.group_subscription_admin'):
            role = 'admin'
        elif self._is_staff():
            role = 'staff'
        return self._response({
            'id': user.id,
            'name': user.name,
            'email': user.email or '',
            'role': role,
        })

    @http.route(
        '/api/analytics/overview',
        type='http',
        auth='user',
        methods=['GET'],
        csrf=False,
    )
    def analytics_overview(self):
        model = request.env['subscription.subscription']
        kpis = model.get_dashboard_kpis()
        revenue = model.get_recurring_revenue_metrics()
        return self._response({
            'mrr': {
                'total': revenue['mrr'],
                'formatted': request.env.company.currency_id.format(
                    revenue['mrr']
                ),
                'activeSubscriptions': kpis['active_subscriptions'],
            },
            'arr': {
                'total': revenue['arr'],
                'formatted': request.env.company.currency_id.format(
                    revenue['arr']
                ),
            },
            'churn': {
                'ratePercent': 0,
                'netRetention': 100,
                'atRiskExposure': request.env.company.currency_id.format(
                    kpis['outstanding']
                ),
            },
            'receivables': {
                'outstanding': kpis['outstanding'],
                'pastDue': kpis['overdue_invoices'],
                'settledMTD': kpis['total_payments'],
            },
            'kpis': kpis,
        })

    @http.route('/api/plans', type='http', auth='user', methods=['GET'], csrf=False)
    def plans(self):
        records = request.env['subscription.plan'].search(
            [], order='name', limit=100
        )
        return self._response([self._plan(plan) for plan in records])

    @http.route('/api/products', type='http', auth='user', methods=['GET'], csrf=False)
    def products(self):
        records = request.env['product.template'].search(
            [('active', '=', True)], order='name', limit=100
        )
        return self._response([{
            'id': product.id,
            'name': product.name,
            'default_code': product.default_code or '',
            'list_price': product.list_price,
            'currency': request.env.company.currency_id.name,
        } for product in records])

    @http.route(
        '/api/subscriptions',
        type='http',
        auth='user',
        methods=['GET'],
        csrf=False,
    )
    def subscriptions(self):
        args = request.httprequest.args
        domain = []
        if args.get('state'):
            domain.append(('state', '=', args['state']))
        if args.get('search'):
            term = args['search']
            domain += ['|', ('subscription_number', 'ilike', term),
                       ('partner_id.name', 'ilike', term)]
        records = request.env['subscription.subscription'].search(
            domain, order='start_date desc, id desc',
            limit=min(int(args.get('limit', 100)), 100),
        )
        return self._response([self._subscription(record) for record in records])

    @http.route('/api/customers', type='http', auth='user', methods=['GET'], csrf=False)
    def customers(self):
        args = request.httprequest.args
        domain = [('customer_rank', '>', 0)]
        if args.get('search'):
            domain.append(('name', 'ilike', args['search']))
        records = request.env['res.partner'].search(
            domain, order='name', limit=min(int(args.get('limit', 100)), 100)
        )
        return self._response([self._customer(record) for record in records])

    @http.route('/api/invoices', type='http', auth='user', methods=['GET'], csrf=False)
    def invoices(self):
        args = request.httprequest.args
        domain = [
            ('move_type', '=', 'out_invoice'),
            ('state', '!=', 'cancel'),
        ]
        if args.get('payment_state'):
            domain.append(('payment_state', '=', args['payment_state']))
        records = request.env['account.move'].search(
            domain, order='invoice_date desc, id desc',
            limit=min(int(args.get('limit', 100)), 100),
        )
        return self._response([self._invoice(record) for record in records])

    @http.route('/api/payments', type='http', auth='user', methods=['GET'], csrf=False)
    def payments(self):
        records = request.env['account.payment'].search(
            [], order='date desc, id desc', limit=100
        )
        return self._response([self._payment(record) for record in records])

    @http.route('/api/quotations', type='http', auth='user', methods=['GET'], csrf=False)
    def quotations(self):
        records = request.env['sale.order'].search(
            [], order='date_order desc, id desc', limit=100
        )
        return self._response([{
            'id': record.id,
            'name': record.name,
            'customer_id': record.partner_id.id,
            'customer': record.partner_id.display_name,
            'plan_id': record.subscription_plan_id.id,
            'plan_name': record.subscription_plan_id.display_name,
            'state': record.state,
            'validity_date': self._date(record.validity_date),
            'subscription_id': record.subscription_id.id,
        } for record in records])

    @http.route(
        '/api/subscriptions/<int:subscription_id>/action',
        type='http',
        auth='user',
        methods=['POST'],
        csrf=False,
    )
    def subscription_action(self, subscription_id):
        self._require_staff()
        payload = request.httprequest.get_json(silent=True) or {}
        action = payload.get('action')
        actions = {
            'create_quotation': 'action_create_quotation',
            'confirm': 'action_confirm',
            'activate': 'action_activate',
            'pause': 'action_pause',
            'resume': 'action_resume',
            'close': 'action_close',
            'renew': 'action_renew',
        }
        method_name = actions.get(action)
        if not method_name:
            return self._error('Unsupported subscription action.')
        try:
            subscription = request.env['subscription.subscription'].browse(
                subscription_id
            ).exists()
            if not subscription:
                return self._error('Subscription not found.')
            result = getattr(subscription, method_name)()
            if hasattr(result, 'read'):
                result = self._subscription(result)
            return self._response(result or self._subscription(subscription))
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route(
        '/api/quotations/<int:quotation_id>/convert',
        type='http',
        auth='user',
        methods=['POST'],
        csrf=False,
    )
    def convert_quotation(self, quotation_id):
        self._require_staff()
        try:
            quotation = request.env['sale.order'].browse(quotation_id).exists()
            if not quotation:
                return self._error('Quotation not found.')
            result = quotation.action_convert_to_subscription()
            subscription = quotation.subscription_id
            return self._response({
                'subscription': self._subscription(subscription),
                'action': result,
            })
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)
