create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);
alter table users enable row level security;

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  recurring_price numeric(12,2) not null default 0,
  billing_frequency text not null check (billing_frequency in ('daily','weekly','monthly','yearly')),
  minimum_quantity numeric(12,2) not null default 1,
  active boolean not null default true,
  available boolean not null default true,
  allow_pause boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  phone text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscription_number text not null unique,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  plan_id uuid references plans(id) on delete set null,
  plan_name text not null,
  monthly_recurring_revenue numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','quotation','confirmed','active','paused','closed')),
  start_date date not null default current_date,
  expiry_date date,
  next_invoice_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  customer_id uuid references customers(id) on delete set null,
  subscription_id uuid references subscriptions(id) on delete set null,
  amount_total numeric(12,2) not null default 0,
  amount_residual numeric(12,2) not null default 0,
  payment_state text not null default 'not_paid',
  invoice_date date not null default current_date,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  payment_state text not null default 'posted',
  payment_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  plan_id uuid references plans(id) on delete set null,
  plan_name text not null,
  state text not null default 'draft',
  validity_date date,
  created_at timestamptz not null default now()
);

alter table plans enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table subscriptions enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table quotations enable row level security;
