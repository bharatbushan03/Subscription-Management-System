# Brightloop Frontend Architecture Specification

## 1. Architectural Overview

The frontend of the **Brightloop Enterprise Subscription & Billing System** is built as a high-performance, modular Single Page Application (SPA). It combines modern JavaScript (ES Modules), Vite for sub-second hot module replacement (HMR), a reactive centralized state store, client-side routing, and a component system adhering to the Design System tokens defined in `docs/DESIGN.md`.

```
                                  ┌────────────────────────┐
                                  │      index.html        │
                                  │   (Vite Mount Shell)   │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │       main.js          │
                                  │  (App Lifecycle Boot)  │
                                  └─────┬──────────────┬───┘
                                        │              │
                   ┌────────────────────┴───┐      ┌───┴────────────────────┐
                   ▼                        ▼      ▼                        ▼
         ┌───────────────────┐    ┌───────────────────┐   ┌───────────────────┐
         │  store/index.js   │    │     router.js     │   │  services/api.js  │
         │ (Reactive State)  │    │  (Client Router)  │   │   (REST Client)   │
         └─────────┬─────────┘    └─────────┬─────────┘   └─────────┬─────────┘
                   │                        │                       │
                   └────────────────────────┼───────────────────────┘
                                            ▼
                               ┌─────────────────────────┐
                               │   components/layout/    │
                               │  AppLayout · Sidebar    │
                               │  Header · Cmd+K Palette │
                               └────────────┬────────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │        pages/         │
                                │  Dashboard · Customers│
                                │  Invoices · TaxLedgers│
                                │  Churn · OrgSettings  │
                                └───────────────────────┘
```

---

## 2. Directory Structure

```text
frontend/
├── dist/                                  # Production build output
├── public/                                # Standalone static assets & legacy HTML prototypes
│   ├── churn-retention.html
│   ├── customer-detail.html
│   ├── invoices-receipts.html
│   ├── payments-dunning.html
│   ├── revenue-analytics.html
│   ├── tax-ledgers.html
│   └── organization-settings.html
├── src/
│   ├── components/                        # Component Library
│   │   ├── common/
│   │   │   ├── Badge.js                   # Status badges & pill indicators
│   │   │   ├── Button.js                  # Primary, secondary, danger, and ghost buttons
│   │   │   └── CommandPalette.js          # Global Cmd+K quick launcher modal
│   │   ├── layout/
│   │   │   ├── AppLayout.js               # Shell layout combining Sidebar + Header + Content
│   │   │   ├── Header.js                  # Top sticky bar, breadcrumbs, search & notifications
│   │   │   └── Sidebar.js                 # Collapsible navigation rail with active route states
│   │   └── metrics/
│   │       └── MetricCard.js              # KPI telemetry cards with tabular numbers & sparklines
│   ├── pages/                             # Page View Controllers
│   │   ├── ChurnRetentionPage.js          # Churn & retention ML telemetry & cohort decay
│   │   ├── CustomersPage.js               # Customer 360 & enterprise account directory
│   │   ├── DashboardPage.js               # Executive MRR/ARR velocity & plan cohorts
│   │   ├── InvoicesPage.js                # Invoices, credit notes & global collections ledger
│   │   ├── OrganizationSettingsPage.js    # Multi-tenant realm, SSO federation & RBAC matrix
│   │   └── TaxLedgersPage.js              # Economic nexus monitoring & GAAP RevRec
│   ├── services/
│   │   └── api.js                         # REST API gateway with robust mock fallbacks
│   ├── store/
│   │   └── index.js                       # Reactive global state management
│   ├── styles/
│   │   ├── main.css                       # Global styles, font settings & animations
│   │   └── tokens.css                     # CSS Custom Properties mapped from DESIGN.md
│   ├── main.js                            # Application entry point and event orchestrator
│   └── router.js                          # Zero-dependency client-side SPA router
├── index.html                             # SPA HTML shell
├── package.json                           # NPM dependencies and scripts
├── tailwind.config.js                     # Tailwind theme configuration
└── vite.config.js                         # Vite bundler and dev server configuration
```

---

## 3. Core Architectural Modules

### 3.1. Client-Side Router (`src/router.js`)
- Zero-dependency client-side hash router listening to `window.onhashchange`.
- Maps URL hashes (`#dashboard`, `#customers`, `#invoices-receipts`, `#tax-ledgers`, `#churn-retention`, `#organization-settings`) directly to async view functions.
- Updates document titles, breadcrumbs, and active navigation indicators on the fly without page reloads.

### 3.2. Reactive State Store (`src/store/index.js`)
- Lightweight publish-subscribe store pattern.
- Maintains central application state:
  - `currentRoute`: Active view identifier.
  - `isSidebarCollapsed`: Desktop and mobile sidebar toggle state.
  - `isCommandPaletteOpen`: Modal state for the Cmd+K launcher.
  - `searchQuery`: Live filter query.
  - `user`: Authenticated operator identity and profile metadata.
  - `notifications`: Unread alerts counter and list.

### 3.3. API Service Gateway (`src/services/api.js`)
- Encapsulates network communication with the backend (`/api/subscriptions`, `/api/analytics`, `/api/customers`).
- Features **intelligent fallback telemetry**: If the backend service is offline during local preview, mock datasets matching all financial and telemetry requirements render seamlessly.

### 3.4. Global Command Palette (`Cmd+K` / `Ctrl+K`)
- Accessible anywhere in the application via `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux), or by clicking the top search bar.
- Allows instantaneous keyboard-driven navigation across all views, customers, and financial ledgers.

---

## 4. Development & Build Commands

Inside `frontend/`:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server (hot-reload on port 3000)
npm run dev

# 3. Compile optimized production build (into frontend/dist)
npm run build

# 4. Preview production build locally
npm run preview
```

