from odoo import http, _
from odoo.http import request
from odoo.addons.portal.controllers.portal import CustomerPortal


class SubscriptionCustomerPortal(CustomerPortal):

    def _customer_partner(self):
        return request.env.user.commercial_partner_id

    def _owned(self, model_name, record_id, field='partner_id'):
        record = request.env[model_name].browse(record_id).exists()
        if not record or record[field].commercial_partner_id != self._customer_partner():
            return request.not_found()
        return record

    @http.route('/my/subscriptions', type='http', auth='user', website=True)
    def portal_subscriptions(self, **kwargs):
        subscriptions = request.env['subscription.subscription'].search([
            ('partner_id', 'child_of', [self._customer_partner().id]),
        ])
        return request.render('subscription_management.portal_subscriptions', {
            'subscriptions': subscriptions,
            'page_name': 'subscriptions',
        })

    @http.route('/my/subscription/<int:subscription_id>', type='http', auth='user', website=True)
    def portal_subscription(self, subscription_id, **kwargs):
        subscription = self._owned(
            'subscription.subscription', subscription_id
        )
        return request.render('subscription_management.portal_subscription', {
            'subscription': subscription,
            'page_name': 'subscription',
        })

    @http.route('/my/invoices', type='http', auth='user', website=True)
    def portal_invoices(self, **kwargs):
        invoices = request.env['account.move'].search([
            ('move_type', 'in', ('out_invoice', 'out_refund')),
            ('partner_id', 'child_of', [self._customer_partner().id]),
            ('state', '!=', 'cancel'),
        ])
        return request.render('subscription_management.portal_invoices', {
            'invoices': invoices,
            'page_name': 'invoices',
        })

    @http.route('/my/invoice/<int:invoice_id>', type='http', auth='user', website=True)
    def portal_invoice(self, invoice_id, **kwargs):
        invoice = self._owned('account.move', invoice_id)
        if invoice.move_type not in ('out_invoice', 'out_refund'):
            return request.not_found()
        return request.render('subscription_management.portal_invoice', {
            'invoice': invoice,
            'page_name': 'invoice',
        })

    @http.route('/my/invoice/<int:invoice_id>/pdf', type='http', auth='user')
    def portal_invoice_pdf(self, invoice_id, **kwargs):
        invoice = self._owned('account.move', invoice_id)
        if invoice.move_type not in ('out_invoice', 'out_refund'):
            return request.not_found()
        pdf, _ = request.env['ir.actions.report'].with_user(
            request.env.user
        )._render_qweb_pdf('account.account_invoices', invoice.ids)
        return request.make_response(pdf, headers=[
            ('Content-Type', 'application/pdf'),
            ('Content-Disposition', 'inline; filename=%s.pdf' % invoice.name),
        ])

    @http.route('/my/payments', type='http', auth='user', website=True)
    def portal_payments(self, **kwargs):
        payments = request.env['account.payment'].search([
            ('partner_id', 'child_of', [self._customer_partner().id]),
        ])
        return request.render('subscription_management.portal_payments', {
            'payments': payments,
            'page_name': 'payments',
        })

    @http.route('/my/quotations', type='http', auth='user', website=True)
    def portal_quotations(self, **kwargs):
        quotations = request.env['sale.order'].search([
            ('partner_id', 'child_of', [self._customer_partner().id]),
        ])
        return request.render('subscription_management.portal_quotations', {
            'quotations': quotations,
            'page_name': 'quotations',
        })
