---
name: Brightloop Enterprise Billing System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.025em
  caption-mono:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-precision, enterprise-grade aesthetic tailored for mission-critical subscription management and recurring revenue infrastructure. The visual tone radiates operational clarity, institutional trust, and computational exactitude. 

Rooted in modern corporate minimalism, the design avoids fleeting ornamental trends, loud gradients, and skeuomorphic novelties. Instead, it leverages rigorous alignment, disciplined information density, razor-sharp 1px structural borders, and purposeful contrast. Data density is balanced with purposeful whitespace, ensuring operators can scan massive transaction ledgers, evaluate recurring billing events, and audit revenue health with zero cognitive friction.

## Colors

The palette is engineered around pure functional utility and standard financial conventions:

- **Primary (`#2563EB`)**: Royal cobalt anchors primary calls-to-action, active selection states, focus halos, and core branding elements.
- **Secondary (`#0F172A`)**: Slate deep navy provides uncompromising readability for primary data points, headlines, and critical metrics.
- **Tertiary / Semantic Success (`#10B981`)**: Emerald green signals positive monetary velocity, MRR growth, healthy status pills, and resolved invoices.
- **Semantic Warning (`#F59E0B`)**: Amber communicates pending cycles, grace periods, and trial expirations.
- **Semantic Danger (`#EF4444`)**: Crimson isolates churn risks, delinquent accounts, and dunning events.
- **Canvas & Neutrals**: Pure white (`#FFFFFF`) surfaces sit elevated on an ultra-subtle cool slate foundation (`#F8FAFC`), structured by slate hairlines (`#E2E8F0`). Secondary text renders in `#475569`, while meta captions settle at `#94A3B8`.

## Typography

Inter serves as the single typographic backbone across display, body, and tabular instances. The hierarchy emphasizes geometric cleanliness and legibility across high-density layouts.

- **Financial and Numeric Output**: Numbers, revenue amounts, currencies, and dates must explicitly enforce OpenType tabular figures (`font-feature-settings: "tnum" 1, "cv05" 1`) to ensure vertically aligned ledgers.
- **Optical Density**: Letter spacing tightens progressively as font size ascends (`-0.025em` on Display down to neutral on Body) to maintain authoritative cohesion in large financial totals.
- **Labels and Microcopy**: Form labels and data grid column headers leverage medium and semi-bold weights in 11px and 12px, ensuring distinct visual separation from the actual cell values.

## Layout & Spacing

The layout is built upon an 8-point spatial model mapped within a responsive fluid grid. 

- **Structure**: Core views utilize a fixed collapsible left navigation rail (240px expanded, 64px collapsed), a 60px sticky top bar, and a responsive fluid content body.
- **Grids & Breakpoints**:
  - **Desktop (≥ 1280px)**: 12 columns, 24px gutters, 32px canvas margins.
  - **Tablet (768px – 1279px)**: 8 columns, 16px gutters, 24px canvas margins. Sidebar collapses to icon-only.
  - **Mobile (< 768px)**: 4 columns, 12px gutters, 16px margins. Metric grids collapse from 4-column layouts to single-column or 2x2 cards.
- **Spacing Rhythm**: Element spacing adheres strictly to multiples of 4px and 8px. Compact groupings (badges, button insets, form controls) employ `space-xs` and `space-sm`, while inter-component boundaries deploy `space-md` to `space-xl`.

## Elevation & Depth

Visual hierarchy relies on low-contrast structural boundaries rather than deep dimensional shadows:

- **Border Hierarchy**: Depth is established primarily via 1px solid borders (`#E2E8F0`). Cards, modal dialogs, and sidebars utilize this hairline container system.
- **Subtle Surface Lift**: When physical separation is required (dropdown menus, popovers, active cards), an ultra-soft, diffuse shadow is deployed:
  - *Base Cards*: `0 1px 2px 0 rgba(15, 23, 42, 0.05)`
  - *Floating Menus & Command Bars*: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`
  - *Modals*: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`
- **Backdrop Diffusion**: Modal underlays use `#0F172A` at 40% opacity paired with a subtle `backdrop-filter: blur(4px)`.

## Shapes

The design system employs a soft, precise corner geometry (`roundedness: 1`). 

- **Base Components**: Input fields, buttons, table cell selections, and tabs utilize a standard radius of `0.25rem` (4px).
- **Cards & Data Containers**: Cards and panel surfaces use `rounded-lg` (`0.5rem` / 8px).
- **Modals & Flyouts**: Floating overlays use `rounded-xl` (`0.75rem` / 12px).
- **Badges & Pills**: Status indicators, delta metrics, and avatar chips use full pill rounding (`9999px`) to immediately distinguish contextual metadata from interactive containers.

## Components

### Buttons
- **Primary**: Solid Royal Cobalt (`#2563EB`) background, pure white text, 4px corner radius. On hover: `#1D4ED8`. Active: subtle inset press. Focus: 2px ring with `#2563EB` offset by 2px white.
- **Secondary / Outline**: White background, 1px border in `#CBD5E1`, text `#0F172A`. Hover: `#F8FAFC`.
- **Destructive**: Rose background (`#EF4444`) or light red tint outline (`#FEE2E2`) with `#DC2626` text for sensitive subscription cancellations.

### KPI Metric Cards
- **Structure**: Surface white (`#FFFFFF`), border `#E2E8F0`, 8px radius, padded with `1.25rem`.
- **Content Flow**: 12px uppercase slate title at the top, followed by 30px bold metric value with tabular figures. Bottom row nests an inline delta pill badge (`+12.4%` in light emerald pill `#DCFCE7` with text `#15803D`) and optional vector micro-sparkline.

### Enterprise Data Tables
- **Header**: 36px height, background `#F8FAFC`, uppercase 11px semibold text `#64748B`, sorted indicators via hairline arrows.
- **Rows**: 52px height for high scan efficiency, bottom border 1px `#F1F5F9`. Hover state shifts row canvas to `#F8FAFC`.
- **Status Pills**: 20px height, fully rounded, containing status dots and 12px medium labels (e.g., Active: `#ECFDF5` background, `#059669` text; Past Due: `#FEF2F2` background, `#DC2626` text).

### Form Controls & Inputs
- **Inputs**: Height 36px (compact) or 40px (default), 1px border `#CBD5E1`, background `#FFFFFF`. Micro-label positioned strictly above the field in 12px semibold `#334155`. Focus triggers a sharp 1px `#2563EB` border and a 3px soft blue ring (`rgba(37, 99, 235, 0.15)`).

### Selection Controls
- **Checkboxes & Radios**: 16x16px boundary, 1px border `#CBD5E1`. Checked state fills `#2563EB` with an ultra-crisp white check or center pip.

### Global Command (Cmd+K) & Navigation
- **Top Bar Search**: Inset pill or soft-rounded search bar displaying subtle keyboard shortcut tag `⌘K`. Modal launcher opens a 600px centered quick-action palette with grouped ledger navigation, customer lookups, and invoice IDs.