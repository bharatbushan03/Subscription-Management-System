# Subscription Management System

A full-stack subscription and billing platform built around an Odoo 19 module plus a lightweight Node.js API and a modern frontend dashboard.

This repository combines:
- an Odoo-based subscription management addon
- a backend REST API for billing and subscription operations
- a Vite frontend for customer and revenue dashboards
- static HTML prototypes and design assets for product exploration

## Overview

The project is designed for subscription lifecycle management, recurring billing, quotation conversion, and operational visibility across plans, subscriptions, invoices, and customer accounts.

Core capabilities include:
- subscription plan definition and validation
- customer-facing quotation workflows
- subscription generation from approved quotations
- recurring invoice processing
- billing and revenue analytics
- portal access and role-based permissions
- dashboard and reporting views

## Tech stack

- Python: Odoo module, models, security, views, business rules
- JavaScript: Node.js API service and Vite frontend
- HTML/CSS: marketing pages, prototypes, UI mockups, static views
- Docker: local deployment and orchestration

## Repository structure

```text
.
├── __manifest__.py                 # Odoo module manifest
├── __init__.py                    # Odoo package init
├── backend/                       # Node.js REST API service
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── .env.example
├── frontend/                      # Vite frontend app
│   ├── src/
│   ├── public/
│   └── package.json
├── models/                        # Odoo model definitions
├── views/                         # Odoo XML views
├── security/                      # Access controls and record rules
├── controllers/                   # Odoo controllers
├── data/                          # Module data and cron definitions
├── reports/                       # Reporting assets
├── static/                        # Odoo static assets and previews
├── docs/                          # Project documentation and design specs
├── tests/                         # Test suite and validation scripts
├── code.html                      # Root dashboard prototype
├── customer-detail.html           # Root customer detail prototype
├── invoices-receipts.html         # Root invoice ledger prototype
├── churn-retention.html           # Root churn analysis prototype
├── tax-ledgers.html               # Root tax/ledger prototype
├── organization-settings.html      # Root settings prototype
├── docker-compose.yml             # Multi-service deployment config
├── deploy.sh / deploy.ps1         # Environment deployment scripts
├── DESIGN.md                     # Design system documentation
├── README.md                     # Project documentation
├── test_complete_application.js   # Full-stack validation runner
└── .gitignore
```

## Features

### Subscription lifecycle
- manage subscription plans with billing frequency and validity rules
- validate plan and product availability during quotation creation
- convert approved quotations into subscriptions
- handle activation, pause, renewal, and closure states

### Billing and invoicing
- recurring invoice generation based on subscription schedules
- tax, currency, and payment-term support
- revenue metrics and recurring analytics

### Governance and reporting
- role-based access control
- discount and monitoring logic
- customer 360 views, revenue dashboards, and operational reports

## Quick start

### 1. Frontend UI prototypes
Open any of the HTML prototypes directly in a browser, or run the frontend app:

```bash
cd frontend
npm install
npm run dev
```

### 2. Backend API
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Odoo module setup
This project includes an Odoo addon. For local installation:

```bash
# run Odoo via Docker
docker compose up -d
```

Then install the module in your Odoo instance and configure the required database and environment variables.

## Documentation

Detailed project references are available in `docs/`:
- `docs/DESIGN.md`
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/USER_MANUAL.md`
- `docs/FRONTEND_ARCHITECTURE.md`

## Development notes

The repository is structured to support a multi-tier SaaS domain model:
- Odoo handles the business logic and model layer
- Node.js exposes API endpoints for application services
- the frontend provides dashboard and customer experiences
- static HTML files act as prototype and design review surfaces

## License

This project is distributed under the LGPL-3 license as declared in the Odoo module manifest.

## Contributing

Contributions are welcome. To contribute:
1. fork the repository
2. create a feature branch
3. make your changes
4. run the relevant tests or validation scripts
5. open a pull request

## Project status

The repository is organized as an enterprise-grade subscription management platform prototype and starter implementation, with both domain logic and frontend presentation layers included in the same codebase.
