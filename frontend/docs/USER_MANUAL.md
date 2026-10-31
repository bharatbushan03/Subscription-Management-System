# Brightloop Subscription & Billing Management — User Manual & Operations Guide

Welcome to the **Brightloop Enterprise Subscription Management Platform**. This guide provides operations teams, Customer Success Managers (CSMs), and finance administrators with actionable workflows to manage subscriptions, execute billing operations, handle dunning recovery, and track revenue health.

---

## 🧭 Navigation & Core Modules

The platform is accessible via the web client interface (default `http://localhost:3000` or the standalone prototypes in your browser).

The interface is organized into 7 primary operational modules:

1. **Dashboard (Executive Overview):** Top-level MRR, ARR, active subscriber growth, and billing velocity.
2. **Customers (Customer 360):** Unified accounts directory, stakeholder registry, entitlement allocations, and health scores.
3. **Invoices & Receipts:** Comprehensive ledger of posted, draft, and paid customer invoices with PDF receipts.
4. **Payments & Dunning:** Automated collections queue, smart retry scheduling, and card decline diagnostics.
5. **Tax & General Ledgers:** Real-time economic nexus thresholds (Avalara integration) and NetSuite/Odoo ERP chart-of-accounts sync.
6. **Churn & Retention:** Cohort retention matrices, downsell risk exposure, and net negative churn tracking.
7. **Organization Settings:** User directory, RBAC governance, Okta/SCIM SSO, and compliance audit logs.

---

## 1. Managing Customer Subscriptions & Lifecycles

### Viewing Customer 360
1. Navigate to **Customers** from the left navigation sidebar.
2. Use the search bar to locate an account by legal entity name (e.g., `OmniFlow Logistics`) or Account ID (`CUST-4481`).
3. Click the customer card to open the **Customer 360 View**, showing:
   - Contract tenure and Net ARR
   - Account Health Score & warning indicators
   - Primary billing contact & technical administrator
   - Active payment method and token status

### Modifying Subscription Plans (Upgrades & Seat Expansion)
1. On the customer detail page, locate the **Active Subscription** section.
2. Click **Manage Subscription** &rarr; **Change Plan / Add Seats**.
3. Select the target plan tier or enter new provisioned seat counts.
4. The system automatically computes:
   - **Delta MRR:** The difference between current and new recurring rates.
   - **Proration Charge:** Prorated amount for remaining days in the active billing cycle.
5. Confirm by clicking **Apply Plan Change**. An immediate prorated invoice is created if applicable.

### Pausing and Resuming a Subscription
- **To Pause:** Click **Action Menu** &rarr; **Pause Subscription**. Enter a business reason (e.g., *Customer migration hold*). Billing invoices are paused while preserving account configuration.
- **To Resume:** When the customer is ready to resume, click **Resume Subscription**. The billing schedule automatically re-aligns to the current date.

---

## 2. Invoicing, Payments & Dunning Automation

### Reviewing Invoices
- Navigate to **Invoices & Receipts**.
- Filter invoices by status: **Paid**, **Open**, **Past Due**, or **Void**.
- Click any invoice number to view the itemized breakdown, tax breakdown, and audit timeline.
- Click **Download PDF Receipt** to export customer-ready statements.

### Handling Failed Payments & Dunning
When an automated charge fails (e.g., insufficient funds or expired card):
1. The subscription enters **Past Due** status.
2. The invoice is automatically enqueued into **Payments & Dunning**.
3. The platform initiates the **Smart Dunning Retry Strategy** (Days +1, +3, +7).
4. **Manual Intervention:** To trigger an immediate retry outside the scheduled cron:
   - Go to **Payments & Dunning** &rarr; **Dunning Queue**.
   - Locate the target invoice (e.g., `INV-2024-8841`).
   - Click **Retry Payment Now**. The gateway issues a live charge request and updates the timeline.

---

## 3. Tax Nexus & General Ledger Integration

### Monitoring Economic Nexus
Brightloop monitors multi-jurisdiction sales thresholds to ensure tax compliance:
1. Navigate to **Tax & General Ledgers**.
2. View **Active Nexus Jurisdictions** (e.g., California CDTFA, New York, EU VAT).
3. If an account approaches the annual revenue threshold (e.g., >80% threshold reached), the system triggers a **Warning: Near Limit** notification to alert finance teams to register for local tax collection.

### Validating General Ledger Postings
- Under **GL Mappings**, verify automated event mappings:
  - **Subscription Renewal Charge:** Debits `1100 - Cash / Stripe Clearing` and Credits `2200 - Deferred SaaS Revenue`.
  - **Revenue Recognition (ASC 606):** Monthly amortized release from Deferred Revenue to Recognized SaaS Revenue.
- Click **Test Post GL** to simulate posting a test journal entry to Odoo / NetSuite.

---

## 4. Organization Access & Security Governance

### Inviting Team Members
1. Go to **Organization Settings** &rarr; **Team & Access Governance**.
2. Click **Invite Member**.
3. Specify user details:
   - **Email:** `colleague@brightloop.io`
   - **Role:** Select *Super Administrator*, *Billing Operations*, *CSM Lead*, or *Finance Auditor*.
4. Click **Send Invitation**.

### Enforcing Multi-Factor Authentication (MFA)
- All administrator accounts require Hardware Key (WebAuthn) or Authenticator App MFA.
- Review compliance status under **Security Health Score** on the settings page.

### Compliance Audit Log Stream
- Review the immutable log stream at the bottom of **Organization Settings** for all actions including plan modifications, manual invoice voids, member invitations, and SSO logins.

