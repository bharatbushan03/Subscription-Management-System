# Brightloop REST API Specification & Gateway Reference

The Brightloop REST API powers the enterprise frontend and integrates with Odoo 19 accounting, automated dunning, customer lifecycle operations, and multi-jurisdiction tax engines.

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`  
**Authentication:** Bearer Token (Header: `Authorization: Bearer <token>`)

---

## 📑 API Endpoint Index

| Category | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **System** | `GET` | `/health` | System health, version & uptime check |
| **Analytics** | `GET` | `/api/analytics/overview` | MRR/ARR, churn rates, growth telemetry |
| **Customers** | `GET` | `/api/customers` | Query & list customer accounts with search/tier filters |
| **Customers** | `GET` | `/api/customers/:id` | Full Customer 360 profile, stakeholders, and payment methods |
| **Subscriptions** | `GET` | `/api/subscriptions` | List subscriptions (supports `?status=` filter) |
| **Subscriptions** | `POST` | `/api/subscriptions` | Create a new subscription |
| **Subscriptions** | `GET` | `/api/subscriptions/:id` | Retrieve subscription detail |
| **Subscriptions** | `GET` | `/api/subscriptions/:id/lifecycle` | Complete audit history timeline of transitions |
| **Lifecycle** | `POST` | `/api/subscriptions/:id/activate` | Transition `draft` / `paused` &rarr; `active` |
| **Lifecycle** | `POST` | `/api/subscriptions/:id/pause` | Transition `active` &rarr; `paused` |
| **Lifecycle** | `POST` | `/api/subscriptions/:id/resume` | Transition `paused` &rarr; `active` |
| **Lifecycle** | `POST` | `/api/subscriptions/:id/renew` | Renew subscription term & advance period |
| **Lifecycle** | `POST` | `/api/subscriptions/:id/upgrade` | Tier change, seat adjustment & proration |
| **Lifecycle** | `POST` | `/api/subscriptions/:id/cancel` | Cancel subscription (immediate or at period end) |
| **Invoices** | `GET` | `/api/invoices` | List invoices and billing records |
| **Invoices** | `POST` | `/api/invoices` | Create a new invoice |
| **Invoices** | `GET` | `/api/invoices/:id` | Retrieve single invoice details |
| **Dunning** | `GET` | `/api/dunning/queue` | Retrieve past due recovery queue |
| **Dunning** | `POST` | `/api/dunning/retry/:invoiceId` | Trigger smart dunning payment retry |
| **Tax & GL** | `GET` | `/api/tax/nexus` | Multi-jurisdiction economic nexus thresholds |
| **Tax & GL** | `GET` | `/api/tax/gl-mappings` | Chart of accounts sync & NetSuite/Odoo mapping |
| **Tax & GL** | `POST` | `/api/tax/test-post` | Test posting journal entry to General Ledger |
| **Governance** | `GET` | `/api/organization/members` | List enterprise RBAC users and MFA status |
| **Governance** | `POST` | `/api/organization/invite` | Send enterprise team invite |
| **Governance** | `GET` | `/api/organization/audit-logs` | Retrieve security and compliance audit log stream |

---

## 1. Subscription Lifecycle Endpoints

### 1.1 List Subscriptions
- **Endpoint:** `GET /api/subscriptions`
- **Query Params:** `status` (optional: `active`, `paused`, `past_due`, `draft`, `canceled`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "sub_4481_ent",
      "subscriptionNumber": "SUB-2024-4481",
      "customerId": "CUST-4481",
      "customerName": "OmniFlow Logistics",
      "planName": "Enterprise Custom",
      "mrrAmount": 2041.66,
      "status": "past_due",
      "billingCycle": "annually",
      "seatsProvisioned": 38,
      "seatsTotal": 50
    }
  ]
}
```

### 1.2 Create Subscription
- **Endpoint:** `POST /api/subscriptions`
- **Request Body:**
```json
{
  "customerId": "CUST-1049",
  "customerName": "HyperScale Technologies",
  "planId": "plan_growth_pro",
  "planName": "Dedicated Cloud Shard",
  "mrrAmount": 4000.00,
  "billingCycle": "monthly",
  "seatsProvisioned": 60,
  "seatsTotal": 60,
  "apiQuotaRequests": 5000000
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": "sub_1730364800000",
    "subscriptionNumber": "SUB-8291",
    "status": "draft"
  }
}
```

### 1.3 State Transitions

#### Activate
`POST /api/subscriptions/:id/activate`
```json
{ "actor": "Marcus Vance" }
```

#### Pause
`POST /api/subscriptions/:id/pause`
```json
{
  "reason": "Customer seasonal hold",
  "actor": "Elena Vance"
}
```

#### Upgrade / Downgrade & Proration
`POST /api/subscriptions/:id/upgrade`
```json
{
  "newPlanId": "plan_ent_scale",
  "newPlanName": "Enterprise Scale Plus",
  "newMrrAmount": 3500.00,
  "newSeats": 50,
  "newApiQuota": 10000000,
  "actor": "Account Executive"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Plan change executed. Proration evaluated.",
  "data": {
    "subscription": { ... },
    "proration": {
      "oldPlan": "Growth Pro Shard",
      "newPlan": "Enterprise Scale Plus",
      "deltaMrr": 2000,
      "isUpgrade": true,
      "immediateInvoiceRequired": true,
      "proratedCreditOrCharge": "$2000.00"
    }
  }
}
```

#### Cancel
`POST /api/subscriptions/:id/cancel`
```json
{
  "reason": "Migrated to proprietary stack",
  "cancelAtPeriodEnd": false,
  "actor": "Elena Vance"
}
```

---

## 2. Telemetry & Analytics

### 2.1 Overview Telemetry
- **Endpoint:** `GET /api/analytics/overview`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "mrr": {
      "total": 15000,
      "growthRatePercent": 50,
      "history": [
        { "month": "Jun '24", "amount": 2500 },
        { "month": "May '25", "amount": 15000 }
      ]
    },
    "kpis": {
      "newMrr": { "amount": 5000, "deltaPercent": 67, "trend": "up" },
      "expansionMrr": { "amount": 2000, "deltaPercent": 33, "trend": "up" },
      "churnedMrr": { "amount": 2500, "deltaPercent": 17, "trend": "down" },
      "netNewMrr": { "amount": 4500, "deltaPercent": 38, "trend": "up" }
    },
    "activeSubscriptions": {
      "count": 428,
      "deltaPercent": 14.2
    }
  }
}
```

---

## 3. Dunning & Payment Recovery

### 3.1 Dunning Queue
- **Endpoint:** `GET /api/dunning/queue`
- **Returns:** List of past due subscriptions with retry count, card failure codes, and recovery health scores.

### 3.2 Trigger Manual/Smart Retry
- **Endpoint:** `POST /api/dunning/retry/:invoiceId`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Immediate retry dispatched for invoice INV-2024-8841",
  "attemptNumber": 3,
  "scheduledAt": "2026-10-31T09:12:00.000Z"
}
```

