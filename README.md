# Subscription Management

## Subscription plan frontend contract

The plan-management phase exposes these Odoo models:

- `subscription.plan`: `name` (char), `description` (text),
  `recurring_price` (monetary), `currency_id` (many2one `res.currency`),
  `billing_frequency` (selection), `minimum_quantity` (float),
  `available_from`/`available_until` (date), `automatic_closure`,
  `allow_early_closure`, `allow_pause`, `allow_renewal`, and `active` (boolean),
  and `line_ids` (one2many `subscription.plan.line`).
- `subscription.plan.line`: `plan_id` (many2one), `product_tmpl_id` (product
  reference), `product_id` (optional product variant), `minimum_quantity`
  (float), `unit_price` (monetary), `currency_id` (related currency),
  `tax_ids` (many2many `account.tax`), and `active` (boolean).

Use the exact billing-frequency values `daily`, `weekly`, `monthly`, and
`yearly`. Next billing dates use calendar arithmetic, so month ends and leap
days are preserved correctly.

Available actions are plan create, edit, activate, and archive for
`group_subscription_admin`. Staff can read available plans and use them on a
quotation line through `sale.order.line.subscription_plan_id`. Customers can
read only active plans within their availability dates. New quotation lines
must use an available plan, an active product line, and a quantity at least
the plan minimum. Expired and inactive plans are rejected.

The backend methods `is_available`, `validate_quantity`,
`get_next_billing_date`, `automatic_closure_applies`, `can_pause`,
`can_close_early`, and `can_renew` are the frontend's permission and
calculation contract. Invoice generation and subscription records are not part
of this phase.
> **Brightloop Enterprise Billing & Subscription Management Platform**

A production-grade, enterprise SaaS architecture designed for high-precision subscription lifecycle management, recurring revenue telemetry (MRR/ARR), plan tiering, and billing automation.

---

## 📸 Preview

![Dashboard Overview](docs/screenshots/dashboard-preview.png)

The complete design specification and design token standards are documented in [docs/DESIGN.md](docs/DESIGN.md).

---

## 🏗️ Project Architecture & Directory Structure

This repository follows industry-standard separation of concerns for modern multi-tier SaaS systems:

```text
Subscription-Management-System/
├── docs/                                  # Product and Design Documentation
│   ├── DESIGN.md                          # UI/UX design system tokens, typography, and color palette
│   └── screenshots/                       # High-fidelity visual mockups and component previews
│       └── dashboard-preview.png
├── frontend/                              # Frontend Web Application & Dashboard
│   ├── public/                            # Static assets
│   │   └── index.html                     # Interactive high-fidelity prototype dashboard
│   ├── src/                               # Frontend source code
│   │   ├── components/                    # Modular UI components
│   │   │   ├── common/                    # Status pills, buttons, date filters
│   │   │   ├── layout/                    # Sidebar navigation, header, top-bar
│   │   │   └── metrics/                   # MRR growth chart, KPI cards
│   │   ├── pages/                         # Route views (Overview, Subscriptions, Invoices)
│   │   ├── styles/                        # CSS design tokens mapped from design system
│   │   │   └── tokens.css
│   │   └── main.js
│   ├── index.html                         # Root entry for Vite / bundlers
│   └── package.json
├── backend/                               # REST API & Billing Microservice
│   ├── src/
│   │   ├── config/                        # Database & environment configurations
│   │   ├── controllers/                   # Request handlers (subscriptions, analytics)
│   │   ├── models/                        # Domain entities (Subscription, Customer, Plan, Invoice)
│   │   ├── routes/                        # Express API route declarations
│   │   ├── services/                      # Business logic (pricing calculator, MRR aggregator)
│   │   └── server.js                      # Application server entry point
│   ├── .env.example                       # Environment variable templates
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. View the Interactive Dashboard UI
The frontend includes a self-contained, live dashboard. You can inspect or run it immediately:
- **Direct Browser View:** Open `frontend/public/index.html` (or `frontend/index.html`) in any modern browser.
- **Using a local dev server:**
  ```bash
  cd frontend
  npx serve .
  # or: npx vite
  ```

### 2. Run the Backend API Service
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API server will listen on `http://localhost:5000` with available endpoints:
- `GET /health` — Service health check
- `GET /api/analytics/overview` — Telemetry (MRR, Expansion MRR, Churn, Net New MRR)
- `GET /api/subscriptions` — List active/past due subscriptions
- `POST /api/subscriptions` — Create new subscription contract

---

## 🎨 Design System & Visual Tokens

The design is engineered around financial data clarity, rigorous 8px spatial grid alignment, and tabular numeric figures:

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| **Primary** | `#004AC6` / `#2563EB` | Active selection, primary CTA buttons |
| **Surface** | `#F8F9FF` | Application background canvas |
| **Surface Lowest** | `#FFFFFF` | Metric containers and data table cards |
| **Tertiary (Growth)** | `#006242` | Positive MRR trajectory, resolved invoices |
| **Error (Churn/Alert)** | `#BA1A1A` | Churned accounts, past due dunning events |
| **Outline Hairline** | `#E2E8F0` / `#737686` | Structural 1px boundary borders |

See full token guide in [docs/DESIGN.md](docs/DESIGN.md).

---

## 🤝 Collaborator Workflow

1. **Pull the latest main branch:**
   ```bash
   git pull origin main
   ```
2. **Create a dedicated feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes and push:**
   ```bash
   git add .
   git commit -m "feat: implement feature"
   git push -u origin feature/your-feature-name
   ```
