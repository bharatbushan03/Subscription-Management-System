from odoo import api, models


class SubscriptionAnalytics(models.Model):
    _inherit = 'subscription.subscription'

    @api.model
    def get_dashboard_kpis(self, date_from=None, date_to=None):
        domain = []
        if date_from:
            domain.append(('create_date', '>=', date_from))
        if date_to:
            domain.append(('create_date', '<=', date_to))
        grouped = self.read_group(domain, ['id:count'], ['state'])
        states = {row['state']: row['id_count'] for row in grouped if row.get('state')}
        invoice_domain = [
            ('move_type', '=', 'out_invoice'),
            ('state', '=', 'posted'),
        ]
        if date_from:
            invoice_domain.append(('invoice_date', '>=', date_from))
        if date_to:
            invoice_domain.append(('invoice_date', '<=', date_to))
        invoice_data = self.env['account.move'].read_group(
            invoice_domain,
            ['amount_total:sum', 'amount_residual:sum', 'id:count'],
            [],
        )
        values = invoice_data[0] if invoice_data else {}
        payment_data = self.env['account.payment'].read_group(
            [('state', '=', 'paid')],
            ['amount:sum', 'id:count'],
            [],
        )
        payments = payment_data[0] if payment_data else {}
        overdue = self.env['account.move'].search_count([
            ('subscription_overdue', '=', True),
        ])
        return {
            'total_subscriptions': sum(states.values()),
            'active_subscriptions': states.get('active', 0),
            'draft_subscriptions': states.get('draft', 0),
            'confirmed_subscriptions': states.get('confirmed', 0),
            'paused_subscriptions': states.get('paused', 0),
            'closed_subscriptions': states.get('closed', 0),
            'total_invoices': values.get('id_count', 0),
            'total_invoiced': values.get('amount_total', 0),
            'outstanding': values.get('amount_residual', 0),
            'overdue_invoices': overdue,
            'total_payments': payments.get('amount', 0),
            'paid_invoice_count': self.env['account.move'].search_count(
                invoice_domain + [('payment_state', '=', 'paid')]
            ),
        }

    @api.model
    def get_recurring_revenue_metrics(self):
        active = self.search([('state', '=', 'active')])
        monthly = 0
        for subscription in active:
            price = subscription.plan_id.recurring_price
            monthly += {
                'daily': price * 365 / 12,
                'weekly': price * 52 / 12,
                'monthly': price,
                'yearly': price / 12,
            }[subscription.plan_id.billing_frequency]
        return {'mrr': monthly, 'arr': monthly * 12}

    @api.model
    def get_revenue_report(self, date_from=None, date_to=None):
        domain = [('move_type', '=', 'out_invoice'), ('state', '=', 'posted')]
        if date_from:
            domain.append(('invoice_date', '>=', date_from))
        if date_to:
            domain.append(('invoice_date', '<=', date_to))
        return self.env['account.move'].read_group(
            domain,
            ['amount_untaxed:sum', 'amount_tax:sum', 'amount_total:sum',
             'amount_residual:sum'],
            ['invoice_date:month'],
            orderby='invoice_date:month',
        )

    @api.model
    def get_plan_distribution(self):
        return self.read_group(
            [('state', 'in', ('active', 'paused', 'confirmed'))],
            ['id:count'],
            ['plan_id'],
            orderby='plan_id',
        )
