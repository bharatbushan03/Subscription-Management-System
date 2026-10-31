import re

from odoo import api, models, _
from odoo.exceptions import UserError, ValidationError


class ResUsers(models.Model):
    _inherit = 'res.users'

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('login'):
                vals['login'] = self._normalize_login(vals['login'])
                self._check_unique_login(vals['login'])
        return super().create(vals_list)

    def write(self, vals):
        if vals.get('login'):
            vals['login'] = self._normalize_login(vals['login'])
            self._check_unique_login(vals['login'])
        return super().write(vals)

    @api.model
    def _normalize_login(self, login):
        login = login.strip()
        if '@' in login:
            return login.lower()
        return login

    def _check_unique_login(self, login):
        if not login or '@' not in login:
            return
        domain = [('login', '=ilike', login)]
        if self.ids:
            domain.append(('id', 'not in', self.ids))
        if self.sudo().with_context(active_test=False).search_count(domain):
            raise ValidationError(_("This email is already registered."))

    def _check_password_policy(self, passwords):
        failures = []
        for password in passwords:
            if password and not self._password_meets_policy(password):
                failures.append(_(
                    "Password must be longer than 8 characters and include an uppercase letter, a lowercase letter, and a special character."
                ))
        if failures:
            raise UserError("\n".join(failures))
        return super()._check_password_policy(passwords)

    @api.model
    def _password_meets_policy(self, password):
        return bool(
            len(password) > 8
            and re.search(r'[A-Z]', password)
            and re.search(r'[a-z]', password)
            and re.search(r'[^A-Za-z0-9]', password)
        )
