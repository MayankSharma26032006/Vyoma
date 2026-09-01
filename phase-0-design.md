# VYOMA — Phase 0 Design Specification

> **Version:** 1.0.0  
> **Status:** Reference document — governs all frontend visual/structural decisions  
> **Last updated:** 2026-08-30  
> **Project:** VYOMA — GIS-based disaster relocation decision-support tool  
> **Authority:** Ministry of Home Affairs, Smart India Hackathon 2026  
> **End users:** NDRF / district disaster management officials  

---

## Table of Contents

1. [What VYOMA Is](#1-what-vyoma-is)
2. [What VYOMA Is Not](#2-what-vyoma-is-not)
3. [Anti-Generic-AI Design Directive](#3-anti-generic-ai-design-directive)
4. [Data Model](#4-data-model)
5. [Color Token System](#5-color-token-system)
6. [Typography System](#6-typography-system)
7. [Spacing, Radii, and Shadows](#7-spacing-radii-and-shadows)
8. [Animation Rules](#8-animation-rules)
9. [Visual Modes](#9-visual-modes)
10. [Component Inventory](#10-component-inventory)
11. [Page Specifications](#11-page-specifications)
12. [ASCII Wireframes](#12-ascii-wireframes)
13. [Sidebar Navigation](#13-sidebar-navigation)
14. [Region Selection](#14-region-selection)
15. [State, Error, and Loading Rules](#15-state-error-and-loading-rules)
16. [Compliance Self-Review](#16-compliance-self-review)

---

## 1. What VYOMA Is

VYOMA is a **command-center GIS tool** for disaster management officials at the district and state level. It visualizes village-level risk data produced by an XGBoost classifier covering ~44,000 villages across 7 North-Eastern Indian states. Its purpose is to support **relocation prioritization decisions** — not to educate the public, not to look beautiful, and not to win design awards.

The interface should feel like a **situation room display**: dense, precise, scannable at a glance under operational pressure. Every pixel earns its place.

## 2. What VYOMA Is Not

- Not a consumer dashboard
- Not a public-facing website
- Not an analytics BI tool
- Not a mobile-first app (primary display: large desktop monitors in ops rooms)
- Not a data exploration playground

Official terminology, dense data tables, and 44k-row scales are **appropriate**. Do not simplify for a general audience.

---

## 3. Anti-Generic-AI Design Directive

The following patterns are **prohibited**. If you find yourself reaching for any of these, stop and find a better solution:

| Prohibited Pattern | Why |
|---|---|
| Purple-to-blue gradient heroes | Decorative, not operational |
| Default shadcn styling left untouched (rounded-xl, drop shadows everywhere) | Looks like every other SaaS dashboard |
| Cream + terracotta palette | Warm tones belong in consumer apps, not ops rooms |
| Near-black + acid-green palette | Looks like a gaming dashboard |
| Decorative numbered badges | Adds visual noise without information |
| Motion for motion's sake | Animate only one thing (CRITICAL markers on the map); everything else stays still |
| Rounded-xl on cards | Soft corners read as consumer/friendly — VYOMA is sharp and utilitarian |
| Drop shadows in dark mode | Shadows are invisible against dark backgrounds; use borders instead |
| "Empty state" illustrations | No kawaii characters, no friendly icons — just a clear message and an action |

**Visual references:** Military situation rooms, radar displays, GIS operations centers, air traffic control panels, NASA mission control circa 2000s. Not Apple. Not Linear. Not Vercel.

---

## 4. Data Model

The AI/ML model outputs this exact shape per village. **Design against this shape. Do not design around hypothetical richer data.**

### 4.1 Village (Habitation)

```typescript
interface Village {
  village_id: string;                    // e.g. "VIL-44012"
  name: string;                          // e.g. "Kunchithanny"
  district: string;                      // e.g. "Idukki"
  state: string;                         // e.g. "Kerala"

  latitude: number;
  longitude: number;

  population: number;

  // Risk output from XGBoost model
  risk_score: number;                    // Continuous 0.0–1.0
  risk_level: "RED" | "ORANGE" | "GREEN";  // 3-tier bucket derived from risk_score

  // Relocation priority — derived from risk_score × vulnerability_multiplier
  relocation_priority:
    | "IMMEDIATE"
    | "SHORT-TERM"
    | "MEDIUM-TERM"
    | "ROUTINE";

  vulnerability_multiplier: number;      // 0.0–2.0, scales risk_score

  // SHAP-based feature importance (model explainability)
  top_factors: {
    feature: string;                     // e.g. "slope_gradient"
    value: string;                       // e.g. "42°"
    impact: "high" | "medium" | "low";   // SHAP impact tier
  }[];

  // Data quality flag
  low_confidence: boolean;               // true if training data for this village is sparse

  // Site recommendation (may be null if no suitable site exists)
  recommended_site_id: string | null;

  // Metadata
  prediction_timestamp: string;          // ISO 8601
  model_version: string;                 // e.g. "xgb-v2.3.1"
}
```

**Key distinctions:**

- `risk_level` has **3 buckets** (RED / ORANGE / GREEN).
- `relocation_priority` has **4 tiers** (IMMEDIATE / SHORT-TERM / MEDIUM-TERM / ROUTINE).
- These are **not** a 1:1 mapping. Both are derived from `risk_score` combined with `vulnerability_multiplier`, but through different thresholds.
- The model does **NOT** output hazard-type breakdowns (flood vs landslide vs etc.). Do not design a hazard-type color system.
- The model does **NOT** output red-zone polygon geometry. Only point-level village data.

### 4.2 Relocation Site

```typescript
interface RelocationSite {
  site_id: string;                       // e.g. "SITE-01"
  name: string;                          // e.g. "Nedumkandam Relief Camp"
  district: string;
  state: string;

  latitude: number;
  longitude: number;

  suitability_score: number;             // 0–100

  total_capacity: number;
  occupied: number;
  available: number;

  infrastructure: {
    water_supply: boolean;
    electricity: boolean;
    road_access: boolean;
    shelter: boolean;
    medical_facility: boolean;
    sanitation: boolean;
  };
}
```

### 4.3 Hierarchy

```
State → District → Village
```

Village is the **atomic analytical unit**. There is no separate Block layer in the model output. Block appears in mock data and UI wireframes as a UI-only grouping field for demo/layout purposes -- it is not part of the real model schema and should not be treated as analytical data.

### 4.4 What Does NOT Exist in the Data

The following concepts do **not** appear in the model output and should not be designed as first-class UI features:

- Hazard-type categorical breakdowns per village (no "flood exposure: 72%")
- Red-zone polygon geometry (only point markers)
- Disaster history records
- Real-time sensor data
- Weather feeds
- Satellite imagery
- Block-level grouping (blocks appear in mock data and UI as a demo/layout field; they are **not** in the real model schema and carry no analytical meaning)

---

## 5. Color Token System

### 5.1 Severity Colors (Risk / Priority / Status)

One shared system for all severity communication. Used for risk_level badges, relocation_priority badges, stat card values, capacity bar fill, and map markers.

| Token | Hex | Use |
|---|---|---|
| `severity-red` | `#DC2626` | RED risk level / IMMEDIATE priority / >=90% capacity |
| `severity-orange` | `#EA580C` | SHORT-TERM priority |
| `severity-amber` | `#D97706` | ORANGE risk level / MEDIUM-TERM priority / 70-90% capacity |
| `severity-green` | `#16A34A` | GREEN risk level / ROUTINE priority / <70% capacity |

**Priority-to-color mapping (4 tiers):**

| Priority | Color Token |
|---|---|
| IMMEDIATE | `severity-red` |
| SHORT-TERM | `severity-orange` |
| MEDIUM-TERM | `severity-amber` |
| ROUTINE | `severity-green` |

**Risk-level-to-color mapping (3 buckets):**

| Risk Level | Color Token |
|---|---|
| RED | `severity-red` |
| ORANGE | `severity-amber` |
| GREEN | `severity-green` |

Note: ORANGE risk level uses `severity-amber`, not `severity-orange`. SHORT-TERM priority uses `severity-orange`, not `severity-amber`. These are different scales.

### 5.2 Neutral Text Colors

| Token | Hex | Use |
|---|---|---|
| `phase-text` | `#E8EAED` | Primary text — headings, data values, labels |
| `phase-text-secondary` | `#9CA3AF` | Secondary text — metadata, timestamps, placeholders |

### 5.3 Background Colors (Dark Ops-Room Mode)

| Token | Hex | Use |
|---|---|---|
| `phase-bg` | `#0B0E14` | Page background |
| `phase-elevated` | `#12151C` | Elevated panels, cards |
| `phase-card` | `#1A1E28` | Card surfaces, table row hover |

### 5.4 Border Colors

| Token | Hex | Use |
|---|---|---|
| `border-subtle` | `#262626` | Standard border for all cards, panels, inputs |

### 5.5 What Is NOT a Color Token

- **No hazard-type color palette.** The model does not output hazard types. Do not create one.
- **No blue.** Blue is not in either palette. Any blue in the current UI is a bug to fix.
- **No purple.** Ever.
- **No gradient fills.** Solid colors only.

---

## 6. Typography System

### 6.1 Font Families

| Role | Font | Fallback | Use |
|---|---|---|---|
| Body / sans | Geist | system-ui, sans-serif | Headings, labels, descriptions, body text |
| Monospace | JetBrains Mono | monospace | IDs, coordinates, risk scores, numeric data, feature values |

### 6.2 Type Scale

| Token | Size | Line Height | Letter Spacing | Weight | Use |
|---|---|---|---|---|---|
| `headline-lg` | 32px | 40px | -0.02em | 600 | Page titles |
| `headline-md` | 24px | 32px | -0.01em | 500 | Section headings |
| `body-lg` | 16px | 24px | normal | 400 | Body text, descriptions |
| `body-md` | 14px | 20px | normal | 400 | Secondary body text |
| `label-md` | 13px | 16px | normal | 500 | Table headers, nav items |
| `label-sm` | 11px | 14px | normal | 400 | Metadata, captions, filter chips |
| `mono-lg` | 20px | 24px | normal | 600 | Large numeric displays (risk scores) |
| `mono-md` | 14px | 20px | normal | 400 | Table cell numeric data, coordinates |
| `mono-sm` | 11px | 14px | normal | 400 | Inline IDs, small numeric values |

### 6.3 Monospace Usage Rule

Use `font-mono` (JetBrains Mono) for:
- Village IDs (`VIL-44012`)
- Site IDs (`SITE-01`)
- Coordinates (`9.8312, 77.1548`)
- Risk scores (`0.87`)
- Population counts in tables
- Model version strings
- Timestamps
- SHAP feature values

Use `font-body` (Geist) for:
- Village/site names
- Section headings
- Labels and descriptions
- Navigation items
- Button text
- Filter chip labels

---

## 7. Spacing, Radii, and Shadows

### 7.1 Spacing Scale

| Token | Value | Use |
|---|---|---|
| `space-unit` | 4px | Base unit — gaps between inline items |
| `stack-sm` | 8px | Tight vertical spacing |
| `gutter` | 16px | Standard gap between grid items |
| `stack-md` | 16px | Standard vertical spacing |
| `stack-lg` | 32px | Section separation |
| `margin-page` | 24px | Page edge padding |

### 7.2 Border Radii

Maximum corner radius is **6px**. Nothing should ever exceed this.

| Element | Radius | Tailwind Class |
|---|---|---|
| Cards, panels, containers | 4px | `rounded-[4px]` |
| Inputs, selectors, dropdowns | 6px | `rounded-[6px]` |
| Buttons, filter chips, badges | 2px | `rounded-[2px]` |
| Map tool buttons | 2px | `rounded-[2px]` |
| Circular elements (avatars, dots) | 50% | `rounded-full` (only for true circles) |

**Never use:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`, or any radius > 6px. Always use arbitrary values (`rounded-[Npx]`) to guarantee the exact pixel size.

### 7.3 Shadows

**None in dark mode.** Use 1px borders (`border-subtle`) to separate surfaces. Shadows are invisible against dark backgrounds and add rendering cost for zero visual benefit.

The only exception: map overlay panels use `shadow-xl` because they float above the map image and need visual separation from the cartographic content beneath them.

---

## 8. Animation Rules

### 8.1 The One Allowed Animation

**CRITICAL/RED marker pulse on the GIS map.**

Villages with `risk_level: "RED"` get a pulsing red dot marker. This is the single animated element in the entire interface. It serves a functional purpose: drawing the eye to the most urgent items on the map.

```css
@keyframes critical-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.8); }
}

.critical-marker {
  animation: critical-pulse 2s ease-in-out infinite;
}
```

### 8.2 Everything Else

- No page transition animations
- No hover animations beyond a 150ms color change
- No skeleton shimmer animations (use static gray placeholders)
- No loading spinners (use a text label: "Loading..." in monospace)
- No parallax, no scroll-triggered reveals, no entrance animations

---

## 9. Visual Modes

VYOMA has two visual modes. The current implementation uses only the dark mode; the daylight mode is specified here for future phases.

### 9.1 Dark Ops-Room Mode (Default)

Used for: Dashboard, GIS Map, any overview/scanning view.

| Property | Value |
|---|---|
| Background | `#0B0E14` (phase-bg) |
| Elevated panels | `#12151C` (phase-elevated) |
| Card surface | `#1A1E28` (phase-card) |
| Primary text | `#E8EAED` (phase-text) |
| Secondary text | `#9CA3AF` (phase-text-secondary) |
| Borders | `#262626` (border-subtle) |
| Shadows | None |
| Map | Full visual weight — the centerpiece |

### 9.2 Daylight Mode (Future — Data-Dense Tables/Reports)

Used for: Village table, Relocation Priority kanban, Carrying Capacity, Analytics — any view where reading dense tabular data is the primary task.

| Property | Value |
|---|---|
| Background | `#F8F9FA` |
| Elevated panels | `#FFFFFF` |
| Card surface | `#FFFFFF` |
| Primary text | `#111827` |
| Secondary text | `#6B7280` |
| Borders | `#E5E7EB` |
| Shadows | `0 1px 2px rgba(0,0,0,0.05)` (subtle, functional) |
| Severity colors | Same tokens (red/orange/amber/green) — they contrast well on light backgrounds |

The switch between modes is **not** a user toggle. It is determined by the page/route: map-centric pages use dark mode, table-centric pages use daylight mode. This is a future-phase decision.

---

## 10. Component Inventory

### 10.1 Layout Components

| Component | File (current) | Description |
|---|---|---|
| `Sidebar` | `src/components/layout/Sidebar.jsx` | Fixed left nav, 256px wide, dark background |
| `TopBar` | `src/components/layout/TopBar.jsx` | Top header with region selectors + action icons |
| `PageShell` | (planned) | Wraps page content with padding, max-width, background |

### 10.2 Map Components

| Component | File (current) | Description |
|---|---|---|
| `MapPanel` | `src/components/dashboard/MapPanel.jsx` | Container for the GIS map view |
| `MapFilterButton` | `src/components/ui/MapFilterButton.jsx` | Toggle button for map layer visibility |
| `MapToolButton` | `src/components/ui/MapToolButton.jsx` | Icon-only button for zoom/layers/search |
| `VillageMarker` | (planned) | Point marker on the map, colored by risk_level |
| `MarkerCluster` | (planned) | Clusters markers when >~50 are visible |
| `CriticalMarker` | (planned) | RED village marker with pulse animation |

### 10.3 Data Display Components

| Component | File (current) | Description |
|---|---|---|
| `StatCard` | `src/components/ui/StatCard.jsx` | Single KPI metric card |
| `ProgressBar` | `src/components/ui/ProgressBar.jsx` | Labeled horizontal bar with color fill |
| `Icon` | `src/components/ui/Icon.jsx` | Material Symbols wrapper |

### 10.4 Planned Components (Not Yet Built)

| Component | Description |
|---|---|
| `TopFactorsList` | Ranked display of a village's `top_factors`. Shows feature name, SHAP value, and impact badge (high/medium/low). Replaces any idea of a "hazard exposure breakdown." |
| `LowConfidenceBadge` | Small informational badge shown when `low_confidence === true`. Displayed near the risk score on Village Details. Text: "Low confidence — limited training data" |
| `CapacityBar` | Extended `ProgressBar` with hardcoded thresholds: >=90% occupied = red, 70-90% = amber, <70% = green. Shows occupied/total. |
| `KanbanBoard` | Four-column board for relocation priority. Lanes: IMMEDIATE, SHORT-TERM, MEDIUM-TERM, ROUTINE. ROUTINE lane is collapsed by default (likely high volume) but must always be present and never hide data. |
| `KanbanCard` | Clickable card in the kanban (navigates to village details). Shows village name, risk score, population, risk_level badge. Not draggable — this is a view-only triage board. |
| `RegionSelector` | Cascading state → district dropdown. State options: Mizoram, Nagaland, Manipur, Meghalaya, Arunachal Pradesh, Assam, Tripura. |
| `DataTable` | Reusable sortable/filterable table with column headers, sort indicators, filter chips. Used for Village table and Relocation Sites table. |
| `FilterChip` | Toggle filter button with optional color class. |
| `SkeletonRow` | Animated loading placeholder matching table row height. |
| `EmptyState` | Clear message + action button for empty filter results or missing data. |
| `ChartCard` | Wrapper for Recharts with token inheritance. |
| `Badge` | Generic badge with severity color or neutral style. |

### 10.5 Recharts Token Inheritance Rule

All charts **must** use the severity color tokens above. **Never** use Recharts' own default palette.

Implementation: define a shared `chartTheme` object:

```typescript
const CHART_COLORS = {
  RED: "#DC2626",
  ORANGE: "#EA580C",
  AMBER: "#D97706",
  GREEN: "#16A34A",
  TEXT: "#E8EAED",
  TEXT_SECONDARY: "#9CA3AF",
  GRID: "#262626",
  BACKGROUND: "#12151C",
};

// Pass to every Recharts component via props:
// <Bar dataKey="count" fill={CHART_COLORS.RED} />
// <XAxis tick={{ fill: CHART_COLORS.TEXT_SECONDARY }} />
// <CartesianGrid stroke={CHART_COLORS.GRID} />
```

No chart component should ever reference `recharts-default-colors` or any hex value outside this object.

---

## 11. Page Specifications

### 11.1 Dashboard (`/`)

**Route:** `/`  
**Visual mode:** Dark ops-room  
**Purpose:** At-a-glance situation overview for the selected district.

**Sections:**
1. **Header** — "District Overview" title, selected state/district breadcrumb, last-updated timestamp
2. **Stats Row** — 5 KPI cards: Critical Habitations, High-Risk, Immediate Relocation, Suitable Sites, Population at Risk
3. **Map + Side Panel** — GIS map (3 cols) + Critical Habitations table (1 col) in a 4-column grid
4. **Bottom Row** — Relocation Priority Summary + Relocation Site Capacity (2-col grid)

**Data source:** Aggregated from village + site data for the selected district.

### 11.2 GIS Map (`/map`)

**Route:** `/map`  
**Visual mode:** Dark ops-room  
**Purpose:** Spatial visualization of village risk distribution.

**Key behaviors:**
- Village-level **point markers only**, colored by `risk_level`
- No polygon overlays (no polygon geometry exists)
- Marker clustering activates above ~50 visible points
- RED markers get the pulse animation
- Layer toggle panel controls **risk-level visibility** (RED / ORANGE / GREEN each independently toggleable)
- District filter in the controls panel
- **No per-hazard-type toggles** (model doesn't output hazard breakdowns)
- Zoom, pan, search controls
- Legend: risk-level colors + relocation site marker

### 11.3 Village Table (`/villages`)

**Route:** `/villages`  
**Visual mode:** Daylight (future) / Dark (current)  
**Purpose:** Sortable, filterable list of all villages in the selected district.

**Columns:** Rank, Village Name (+ ID in monospace), Population, Risk Score (monospace, colored), Risk Level (colored badge), Relocation Priority (colored badge), Low Confidence (badge if true).

**Filters:** Risk Level, Relocation Priority, Block (UI-only mock field — not present in real model output; filter included for demo layout only).

**Sort:** Any column. Default: risk_score descending.

**Row click** → navigates to `/villages/:id`.

### 11.4 Village Details (`/villages/:id`)

**Route:** `/villages/:id`  
**Visual mode:** Dark ops-room  
**Purpose:** Deep-dive on a single village's risk profile and relocation recommendation.

**Two-column layout (gap: 24px):**

**Left column (narrower, ~340px):**
1. Mini-map placeholder (static, non-interactive for now) showing village location
2. **Location** — Block, Village, Coordinates (monospace)
3. **Demographics** — Population, Households (monospace numbers)
4. **Recommended Site** — Site name, suitability score, available capacity. If `recommended_site_id` is null, show explicit "No suitable site identified" badge. Never leave blank.

**Right column (wider):**
1. **Risk Assessment** — Three large badges: Risk Score (monospace), Risk Level (colored), Priority (colored). LowConfidenceBadge shown conditionally near Risk Score if `low_confidence === true`.
2. **Top Contributing Factors** — `TopFactorsList` component showing ranked SHAP factors with feature name, value, and impact badge. This replaces any "hazard exposure" section.


**Do NOT include:**
- Hazard Exposure section (model doesn't output per-hazard breakdowns)
- Disaster History section (not in model output)

### 11.5 Relocation Priority (`/priority`)

**Route:** `/priority`  
**Visual mode:** Dark ops-room  
**Purpose:** Kanban board showing villages organized by relocation priority.

**Four lanes:**
1. **IMMEDIATE** — red header
2. **SHORT-TERM** — orange header
3. **MEDIUM-TERM** — amber header
4. **ROUTINE** — green header (collapsed by default, but always present and never hides data)

**KanbanCard content:** Village name, risk score (monospace), population, risk_level badge.

### 11.6 Relocation Sites (`/sites`)

**Route:** `/sites`  
**Visual mode:** TBD  
**Purpose:** Table of relocation sites with capacity and infrastructure status.

**Columns:** Site ID (monospace), Name, Suitability Score, Capacity (occupied/total), Available, Infrastructure checklist.

### 11.7 Carrying Capacity (`/capacity`)

**Route:** `/capacity`  
**Visual mode:** TBD  
**Purpose:** Aggregate view of site utilization across the district.

**Uses:** `CapacityBar` components with threshold coloring (>=90% red, 70-90% amber, <70% green).

### 11.8 Analytics (`/analytics`)

**Route:** `/analytics`  
**Visual mode:** TBD  
**Purpose:** Statistical summaries and charts.

**Uses:** Recharts with `CHART_COLORS` token inheritance.

---

## 12. ASCII Wireframes

### 12.1 Dashboard

```
+--------------------------------------------------------------------------+
| SIDEBAR (256px)  |  TOPBAR: [State v] [District v]          ^  @  o   |
|                  |------------------------------------------------------|
|                  |                                                      |
|  o VYOMA GIS     |  District Overview                     Last sync    |
|    Operational    |  State / District                      ^ 14:30      |
|    Suite          |------------------------------------------------------|
|                  |                                                      |
| +--------------+ |  +-----+ +-----+ +------+ +-----+ +-----+          |
| | Dashboard    | |  | 12  | | 48  | |1,420 | | 08  | |8.4k |          |
| | Hazard Map   | |  |crit | |high | |imm r | |sites| |pop  |          |
| | Habitations  | |  +-----+ +-----+ +------+ +-----+ +-----+          |
| | Reloc. Prior | |                                                      |
| | Reloc. Sites | |  +---------------------------+--------------------+ |
| | Analytics    | |  |                           |  Critical Vils      | |
| |              | |  |    GIS MAP                |  +----------------| | |
| |              | |  |    (point markers)        |  |Name  Score Pop | | |
| |              | |  |    [Red Zones] [Flood]    |  |Vil A  91  1.2k | | |
| |              | |  |    [Landslide]            |  |Set B  87   850 | | |
| |              | |  |                           |  |Haml C  82   420| | |
| |              | |  |  legend                   |  |Vil D  78  2.1k | | |
| |              | |  |                           |  |Col E  75   340 | | |
| |              | |  +---------------------------+--------------------+ |
| |              | |                                                      |
| |--------------| |  +---------------------+--------------------------+ |
| | Help         | |  | Relocation Prior.   | | Site Capacity            | |
| | Logout       | |  | IMM: 12  STR: 34   | | R-17  [|||||||||||] 53% | |
| +--------------+ |  | MED: 89             | | R-08  [||||||||||||] 72% | |
|                  |  +---------------------+--------------------------+ |
+--------------------------------------------------------------------------+
```

### 12.2 GIS Map (Full-Page View)

```
+--------------------------------------------------------------------------+
| SIDEBAR |  TOPBAR: [State v] [District v]                   ^  @  o    |
|---------|--------------------------------------------------------------|
|         |                                                              |
|  [Map   |  +-- Filter Bar ----------------------------------------+   |
|  page]  |  | RED risk  | ORANGE risk  | GREEN risk  | District: v  |   |
|         |  +--------------------------------------------------------+   |
|         |                                                              |
|         |  +----------------------------------------------------------+|
|         |  |                                                          ||
|         |  |       .  .                                              ||
|         |  |    .  @  .     <-- RED marker (pulsing)                 ||
|         |  |  .  .  .  .                                             ||
|         |  | . @.  .        <-- RED marker                            ||
|         |  |  .  .  .                                                 ||
|         |  |    o  .  o    <-- ORANGE/GREEN markers                   ||
|         |  |     .  .                                                 ||
|         |  |                                                          ||
|         |  |  [+]                                        +-- Legend-+||
|         |  |  [-]                                        | @ RED    |||
|         | |  [Layers]                                    | o ORANGE |||
|         |  |  [Search]                                   | . GREEN  |||
|         |  |                                             | ^ Reloc  |||
|         |  |                                             +----------+||
|         |  +----------------------------------------------------------+|
+--------------------------------------------------------------------------+

Layer toggle panel:
  [x] RED risk level
  [x] ORANGE risk level
  [x] GREEN risk level
  ----------------------
  District: [All v]

Marker rules:
  - Each village = 1 point marker
  - Color = risk_level (RED/ORANGE/GREEN)
  - RED markers pulse (critical-pulse animation)
  - Above ~50 visible markers -> cluster by proximity
  - Click marker -> popup with village name, risk score, population
  - Click popup -> navigate to /villages/:id
```

### 12.3 Village Details

```
+--------------------------------------------------------------------------+
| SIDEBAR |  TOPBAR                                                       |
|---------|--------------------------------------------------------------|
|         |                                                              |
|         |  <- Back to Villages                                         |
|         |                                                              |
|         |  Kunchithanny                        [RED] [IMMEDIATE]       |
|         |  VIL-44012                                                   |
|         |--------------------------------------------------------------|
|         |                                                              |
|         |  +-- LEFT (340px) -----+  +-- RIGHT (flex) ---------------+ |
|         |  |                     |  |                               | |
|         |  |  +-- Mini Map ----+ |  |  Risk Assessment              | |
|         |  |  |  [static map]  | |  |  +---------+--------+-------+ | |
|         |  |  |  . lat/lng     | |  |  | Score   | Level  | Prior | | |
|         |  |  |  "coming soon" | |  |  |  0.91   |  RED   |  IMM  | | |
|         |  |  +----------------+ |  |  +---------+--------+-------+ | |
|         |  |                     |  |  (!) Low confidence --         | |
|         |  |  Location           |  |      limited training data     | |
|         |  |  Village: Kunchi-   |  |                               | |
|         |  |    thanny           |  |  Top Contributing Factors     | |
|         |  |  Coords: 9.8312,    |  |  +-------------------------+  | |
|         |  |          77.1548    |  |  | 1. slope_gradient       |  | |
|         |  |  (monospace)        |  |  |    42 deg    [HIGH]      |  | |
|         |  |                     |  |  | 2. soil_moisture         |  | |
|         |  |  Demographics       |  |  |    0.87       [HIGH]     |  | |
|         |  |  Population: 1,240  |  |  | 3. proximity_to_river    |  | |
|         |  |  Households: 285    |  |  |    <50m       [MED]      |  | |
|         |  |  (monospace)        |  |  | 4. road_access           |  | |
|         |  |                     |  |  |    none        [LOW]     |  | |
|         |  |  Recommended Site   |  |  +-------------------------+  | |
|         |  |  +----------------+ |  |                               | |
|         |  |  | Nedumkandam    | |  +-------------------------------+ |
|         |  |  | Relief Camp    | |                                    |
|         |  |  | SITE-01        | |                                    |
|         |  |  | Suitability:87%| |                                    |
|         |  |  | Capacity: 2,400| |                                    |
|         |  |  +----------------+ |                                    |
|         |  |                     |                                    |
|         |  |  (or if null:)      |                                    |
|         |  |  (!) No suitable    |                                    |
|         |  |  site identified    |                                    |
|         |  +---------------------+                                    |
+--------------------------------------------------------------------------+
```

TopFactorsList rendering:
  Each factor shows:
    [rank]. [feature_name]  [value]  [impact badge]

  Impact badge colors:
    HIGH   -> severity-red background
    MEDIUM -> severity-amber background
    LOW    -> severity-green background (or neutral)

LowConfidenceBadge:
  Displayed immediately below Risk Score badge when low_confidence === true.
  Style: small amber warning icon + text "Low confidence -- limited training data"
  Never hidden, never collapsed, never dismissable.
### 12.4 Relocation Priority Kanban

+--------------------------------------------------------------------------+
| SIDEBAR |  TOPBAR                                                       |
|---------|--------------------------------------------------------------|
|         |                                                              |
|         |  Relocation Priority                      District: Idukki   |
|         |--------------------------------------------------------------|
|         |                                                              |
|         |  +-- IMMEDIATE --+ +-- SHORT-TERM -+ +-- MEDIUM-TERM ------+|
|         |  | (red header)  | | (orange hdr)  | |  (amber header)     ||
|         |  |               | |               | |                     ||
|         |  | +-----------+ | | +-----------+ | | +-----------+       ||
|         |  | |Kunchi-    | | | |Vagapparai | | | |Anakkadavu |       ||
|         |  | | thanny    | | | |score: 0.82| | | |score: 0.68|       ||
|         |  | |score:0.91 | | | |pop: 420   | | | |pop: 560   |       ||
|         |  | |pop: 1,240 | | | |[ORANGE]   | | | |[ORANGE]   |       ||
|         |  | |[RED]      | | | +-----------+ | | +-----------+       ||
|         |  | +-----------+ | | +-----------+ | | +-----------+       ||
|         |  | +-----------+ | | |Panchali   | | | |Kuzhithurai|       ||
|         |  | |Edamalakudy| | | |Medu       | | | |score: 0.64|       ||
|         |  | |score:0.87 | | | |score: 0.78| | | |pop: 1,850 |       ||
|         |  | |pop: 850   | | | |pop: 2,100 | | | |[GREEN]    |       ||
|         |  | |[RED]      | | | |[ORANGE]   | | | +-----------+       ||
|         |  | +-----------+ | | +-----------+ | |                     ||
|         |  +---------------+ +---------------+ +---------------------+|
|         |                                                              |
|         |  +-- ROUTINE ---v-+                                          |
|         |  | (collapsed)    |  <- Always present, never hidden.        |
|         |  | 23 villages    |    Click to expand. Shows all cards.     |
|         |  +-----------------+                                         |
+--------------------------------------------------------------------------+

---

## 13. Sidebar Navigation

### 13.1 Structure

```
+------------------+
|  o VYOMA GIS     |  <- Logo + title
|    Operational    |  <- Subtitle
|    Suite          |
|------------------|
|                  |
|  Dashboard       |  <- Active route highlight
|  Hazard Map      |
|  Habitations     |
|  Reloc. Prior    |
|  Reloc. Sites    |
|  Analytics       |
|                  |
|------------------|
|  Help            |
|  Logout          |
+------------------+
```

### 13.2 Behavior

- **Width:** 256px, fixed, non-collapsible (primary display is large desktop monitors)
- **Active state:** Background highlight (`secondary-container`), white text
- **Inactive state:** Muted text (`on-surface-variant`), no background
- **Hover:** Slight background change, text brightens
- **Navigation:** Uses React Router `NavLink` with `isActive` for automatic highlighting
- **Footer items** (Help, Logout): Separated by top border, visually distinct from main nav

### 13.3 Planned Routes

| Nav Item | Route | Status |
|---|---|---|
| Dashboard | `/` | Built |
| Hazard Map | `/map` | Planned (Phase 3) |
| Habitations | `/villages` | Built (currently `/habitations`) |
| Relocation Priority | `/priority` | Planned (Phase 3) |
| Relocation Sites | `/sites` | Planned (Phase 4) |
| Analytics | `/analytics` | Planned (Phase 4) |
| Help | -- | Planned |
| Logout | -- | Planned |

---

## 14. Region Selection

### 14.1 State Selector

The TopBar contains a cascading State -> District selector. The State dropdown has these fixed options:

| State |
|---|
| Arunachal Pradesh |
| Assam |
| Manipur |
| Meghalaya |
| Mizoram |
| Nagaland |
| Tripura |

**Alphabetical order** in the dropdown. No "All States" option -- a state must be selected.

### 14.2 District Selector

Districts cascade from the selected state. The district list is dynamic (fetched from the data layer based on the selected state). The district selector is disabled until a state is selected.

### 14.3 Region Context

Once a state and district are selected, all views filter to that district's data. The selected region is displayed in the TopBar and in page headers. Changing the region resets the view to the Dashboard.


---

## 15. State, Error, and Loading Rules

### 15.1 Loading States

| Scenario | Display |
|---|---|
| Page loading | Skeleton rows matching the content layout (8 rows for tables, card-shaped skeletons for grids). Use static gray placeholders, NOT animated shimmer. |
| Data fetching for a single item | Text label "Loading..." in monospace, centered in the content area. |
| Map tiles loading | Map container shows the dark background color. Tiles render as they load. |

### 15.2 Empty States

| Scenario | Display |
|---|---|
| No villages match filters | "No villages match these filters" + "Clear filters" button |
| No relocation sites in district | "No relocation sites registered for this district" |
| Empty kanban lane | Lane header with "0 villages" count. Empty lane area shows "No villages in this priority tier" |
| No disaster history | "No disaster events recorded" in italic secondary text |

### 15.3 Error States

| Scenario | Display |
|---|---|
| Village not found (bad ID) | Full-page: error icon + "Village not found" + "No village matches ID: {id}" + "Back to Villages" link |
| Network error | Inline banner at top of page: "Connection lost -- showing cached data" (if cached) or "Unable to load data -- retry" button |
| API error (500) | Full-page: "Server error -- try again later" |

### 15.4 Low Confidence Handling

When `low_confidence === true` for a village:

1. Show `LowConfidenceBadge` near the risk score on Village Details
2. In the village table, show a small amber icon next to the risk score
3. Never suppress the village from results -- always show it, just flag it
4. The badge text: "Low confidence -- limited training data"

### 15.5 Null Site Recommendation

When `recommended_site_id === null`:

1. Show an explicit badge: "No suitable site identified" with a warning icon
2. Never leave the field blank or show "N/A"
3. Use amber/neutral styling -- this is informational, not an error


---

## 16. Compliance Self-Review

This table checks the design document against the Anti-Generic-AI Design Directive (Section 3).

| Directive Rule | Compliance Status | Where Enforced |
|---|---|---|
| No purple-to-blue gradient heroes | Compliant | No gradients anywhere. Solid severity tokens only. |
| No default shadcn styling | Compliant | Max radius 6px. No drop shadows in dark mode. Border-based separation. |
| No cream+terracotta palette | Compliant | Dark ops-room base (#0B0E14). No warm consumer tones. |
| No near-black+acid-green | Compliant | Green limited to severity-green (#16A34A) for functional status only. |
| No decorative numbered badges | Compliant | Numbers are data (risk scores, counts), not decoration. Monospace font makes this explicit. |
| No motion for motion's sake | Compliant | One animation only: CRITICAL marker pulse on the map. |
| Sharp, tight corners | Compliant | Max 6px (inputs). Cards 4px. Badges 2px. All via arbitrary values (rounded-[Npx]). No default-scale Tailwind radius classes. |
| Monospace for IDs/coordinates/scores | Compliant | JetBrains Mono for all numeric/ID data. Geist for everything else. |
| Map is the one place with visual weight | Compliant | Map gets full-panel treatment. Everything else stays quiet. |
| Two visual modes (dark ops + daylight) | Partially compliant | Dark mode is built. Daylight mode is specified in Section 9.2 for future phases. |
| No hazard-type color system | Compliant | Spec explicitly prohibits it (Section 5.5). Model does not output hazard types. |
| No polygon red-zone overlays | Compliant | GIS map spec uses point markers only. No polygon geometry. |
| TopFactorsList instead of hazard exposure | Compliant | Spec calls for TopFactorsList in Section 10.4. Hazard Exposure section explicitly prohibited in Section 11.4. |
| ROUTINE lane always present | Compliant | Kanban spec (Section 12.4) specifies collapsed by default but never hidden. |

### Remaining Debt

| Item | Status | Notes |
|---|---|---|
| Daylight mode for tables | Specified in Section 9.2 | Not yet implemented. Current tables use dark mode. |
| TopFactorsList component | Specified in Section 10.4 | Not yet built. Current mock data uses `vulnerability_factors` which is a different shape. |
| LowConfidenceBadge component | Specified in Section 10.4 | Not yet built. Current mock data does not include `low_confidence` field. |
| KanbanBoard component | Specified in Section 10.4 | Not yet built. Current "RelocationPrioritySummary" is a stat card, not a kanban. |
| MapLibre GL JS interactive map | Specified in Section 11.2 | Current map is a static Google-hosted image. MapLibre chosen over Leaflet for native marker clustering support (>50 points) without additional plugins. |
| Correct data model shape | Specified in Section 4 | Current mockData/habitations.json uses a different schema (has hazard_types, hazard_exposure, disaster_history which are NOT in the model output). |
| Route path cleanup | -- | Habitations currently at `/habitations`, spec uses `/villages` |

---

*End of Phase 0 Design Specification.*
