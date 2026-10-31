# Subscription-Management-System
> **Brightloop Enterprise Billing & Subscription Management Platform**

A production-grade, enterprise SaaS architecture designed for high-precision subscription lifecycle management, recurring revenue telemetry (MRR/ARR), plan tiering, and billing automation.

---

## 📸 Previews

### 1. Executive Telemetry & Plans Dashboard
![Dashboard Overview](docs/screenshots/dashboard-preview.png)

### 2. Customer 360 & Subscription Lifecycle View
![Customer Detail Overview](docs/screenshots/customer-detail-preview.jpg)

The complete design specification and design token standards are documented in [docs/DESIGN.md](docs/DESIGN.md).

---

## 🏗️ Project Architecture & Directory Structure

This repository follows industry-standard separation of concerns for modern multi-tier SaaS and Odoo enterprise modules:

```text
Subscription-Management-System/
├── docs/                                  # Product and Design Documentation
│   ├── DESIGN.md                          # UI/UX design system tokens, typography, and color palette
│   └── screenshots/                       # High-fidelity visual mockups and component previews
│       ├── dashboard-preview.png          # Main billing dashboard preview
│       └── customer-detail-preview.jpg    # Customer 360 & dunning detail preview
├── frontend/                              # Frontend Web Application & Dashboard
│   ├── public/                            # Static assets
│   │   ├── index.html                     # Live dashboard prototype (code.html)
│   │   └── customer-detail.html           # Live customer 360 & lifecycle detail prototype
│   ├── src/                               # Modular UI components
│   │   ├── components/                    # Common, layout, and metrics components
│   │   ├── pages/                         # Overview & customer views
│   │   ├── styles/                        # CSS design tokens mapped from DESIGN.md
│   │   │   └── tokens.css
│   │   └── main.js
│   ├── index.html                         # Bundler entry point
│   ├── customer-detail.html
│   └── package.json
├── backend/                               # REST API & Billing Microservice
│   ├── src/
│   │   ├── config/                        # Database & environment configurations
│   │   ├── controllers/                   # Request handlers (subscriptions, analytics)
│   │   ├── models/                        # Domain entities (Subscription, Customer, Plan, Invoice)
│   │   ├── routes/                        # Express API route declarations
│   │   ├── services/                      # Business logic (pricing calculator, MRR aggregator)
│   │   └── server.js                      # Application server entry point
│   ├── .env.example
│   └── package.json
├── static/                                # Odoo module static assets
│   └── description/                       # Odoo app description, views & screenshots
│       ├── index.html
│       ├── customer-detail.html
│       ├── screen.png
│       └── customer-detail-preview.jpg
├── models/                                # Odoo ORM Models
├── views/                                 # Odoo XML Views
├── security/                              # Access control & record rules
├── controllers/                           # Odoo HTTP Controllers
├── code.html                              # Root standalone dashboard
├── customer-detail.html                   # Root standalone customer 360 view
├── DESIGN.md                              # Root design system documentation
├── screen.png                             # Root dashboard preview image
├── screen-customer.jpg                    # Root customer detail preview image
├── docker-compose.yml                     # Odoo container configuration
├── __manifest__.py                        # Odoo module manifest
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. View the Interactive Dashboard UI
Open either interactive prototype directly in any modern browser:
- **Executive Dashboard:** [`code.html`](file:///c:/Users/offic/Desktop/Odoo/Subscription-Management-System/code.html) or `frontend/public/index.html`
- **Customer 360 Detail View:** [`customer-detail.html`](file:///c:/Users/offic/Desktop/Odoo/Subscription-Management-System/customer-detail.html) or `frontend/public/customer-detail.html`

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
