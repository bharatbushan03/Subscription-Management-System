{
    'name': 'Subscription Management',
    'summary': 'Recurring subscriptions for Brightloop',
    'version': '19.0.1.0.0',
    'category': 'Sales',
    'author': 'Brightloop Software',
    'license': 'LGPL-3',
    'depends': [
        'sale_management',
        'account',
        'portal',
        'auth_signup',
        'auth_password_policy',
        'auth_password_policy_signup',
    ],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'security/record_rules.xml',
        'data/password_policy.xml',
    ],
    'installable': True,
    'application': True,
}
