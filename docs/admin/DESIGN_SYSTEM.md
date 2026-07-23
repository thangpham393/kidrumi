# Kidrumi Admin — Product Design Specification

> **Status:** Draft v1 — awaiting approval before Phase 2 (implementation).
> **Scope:** The **Admin Panel** for parents, teachers, and school administrators.
> This is *not* the children's interface and *not* the existing clay/pastel kids site.
> **Audience of this doc:** engineering + design. Written in English; product UI copy
> ships in **Vietnamese** (see §11 Voice).

---

## 0. Grounding — what already exists

Decisions below are constrained by the real codebase, not a greenfield:

| Fact | Source | Implication for admin |
|---|---|---|
| Next.js **16.2.10**, React **19**, TypeScript | `package.json` | App Router, Server Components by default. Read `node_modules/next/dist/docs/` before coding (per `AGENTS.md`). |
| Styling = one `globals.css` (749 lines), CSS **variables + semantic classes**. No Tailwind/CSS Modules. | `app/globals.css` | Admin follows the *same primitive* (design tokens as CSS vars) but in an **isolated theme scope** + **CSS Modules per component** for scale (§17–19). |
| Fonts via `next/font/google` (Baloo 2, Nunito) | `app/layout.tsx` | Add **Be Vietnam Pro** as an admin-scoped font var. Kids fonts stay untouched. |
| Auth/data = **Supabase** (`@supabase/ssr`) | `package.json` | Admin gets role-gated routes; RBAC drives navigation visibility (§20). |
| `app/admin/shadowing/` already exists, but styled with **kids** classes (`.wrap`, clay look) + `robots: noindex`. | `app/admin/shadowing/` | This becomes the **first module to migrate** into the new admin shell. Keep `noindex` on all admin routes. |
| Kids brand `--brand: #7c6cf0` | `globals.css` | Admin primary `#7C6CF6` is the **same hue, one shade tighter** — deliberate family resemblance, professional application. |

**Design north star:** the kids site is the playful younger sibling; the admin is the
**calm, competent grown-up sibling**. Same family, different register.

---

## 1. Design philosophy

**"Calm competence with a soft heart."**

The admin panel must feel *Premium · Friendly · Modern · Calm · Professional · High-end* —
never childish, cartoonish, or loud. We borrow the **restraint of Linear**, the
**data clarity of Stripe**, the **spaciousness of Notion**, and just a **warm breath of
Duolingo Kids** in the color temperature and roundedness.

Five operating rules that resolve every future judgment call:

1. **Restraint over decoration.** When in doubt, remove. Whitespace is the primary design element.
2. **One accent, earned.** Purple (`primary`) is used sparingly — for the single most
   important action per view. Everywhere else is neutral. Color that's everywhere means nothing.
3. **Soft, never sharp.** Generous radii, feather-soft indigo-tinted shadows, hairline borders.
   No hard black shadows, no pure `#000`, no harsh dividers.
4. **Data is the hero.** Numbers, tables, and charts get the clearest typography and the most
   breathing room. Chrome (nav, toolbars) recedes.
5. **Alive but never busy.** Motion confirms and delights (150–250ms, ease-out). It never
   demands attention or blocks the user.

**Anti-patterns (explicitly forbidden):** dense Bootstrap/AdminLTE grids, gradient buttons
everywhere, emoji as functional UI, neon status colors, drop-shadow stacks, zebra-striped
tables, cramped 12px paddings, more than one primary action competing per screen.

---

## 2. Color tokens

Two dedicated palettes. **Dark mode is designed, not inverted** (§15). All values below
become CSS custom properties under an admin theme scope (`:root[data-admin-theme]`, §17).

### 2.1 Core — Light

| Role | Token | Hex |
|---|---|---|
| Primary | `--c-primary` | `#7C6CF6` |
| Primary Hover | `--c-primary-hover` | `#6B5AEF` |
| Primary Active (pressed) | `--c-primary-active` | `#5B49E6` |
| Primary Light (tint bg) | `--c-primary-light` | `#EEEAFE` |
| Secondary | `--c-secondary` | `#9D8CFF` |
| Background (app) | `--c-bg` | `#F8F6FF` |
| Surface (card) | `--c-surface` | `#FFFFFF` |
| Surface Sunken (wells, table head) | `--c-surface-sunken` | `#F4F1FD` |
| Border | `--c-border` | `#ECE9F8` |
| Border Strong (inputs, dividers) | `--c-border-strong` | `#DCD8F0` |
| Text Primary | `--c-text` | `#2B2B42` |
| Text Secondary | `--c-text-secondary` | `#6B6B85` |
| Text Muted | `--c-text-muted` | `#9B9BB4` |

### 2.2 Semantic — Light (each with a `-light` tint for status backgrounds)

| Role | Solid | Tint (`-light`) | On-tint text |
|---|---|---|---|
| Success | `--c-success #84D27C` | `--c-success-light #EAF7E8` | `#2E6B2A` |
| Warning | `--c-warning #FFC857` | `--c-warning-light #FFF6E2` | `#8A5A00` |
| Danger  | `--c-danger #FF7AA2`  | `--c-danger-light #FFEBF1`  | `#A61E4D` |
| Info    | `--c-info #67B7FF`    | `--c-info-light #E6F3FF`    | `#0B5A9E` |

> Semantic solids are used for **icons, dots, and borders**; tints for **badge/alert
> backgrounds**. Text on a tint uses the "On-tint" column to keep AA contrast — never place
> `--c-text-muted` on a colored tint.

### 2.3 Dark — dedicated palette (warm deep-indigo, not black)

| Role | Token | Hex | Note |
|---|---|---|---|
| Background | `--c-bg` | `#131019` | Warm near-black indigo, not `#000`. |
| Surface | `--c-surface` | `#1B1826` | Cards sit above bg. |
| Surface Elevated | `--c-surface-elevated` | `#232030` | Popovers, modals, dropdowns. |
| Surface Sunken | `--c-surface-sunken` | `#17141F` | Table head, wells. |
| Border | `--c-border` | `#2C2838` | Hairline. |
| Border Strong | `--c-border-strong` | `#3A3550` | Inputs, focus tracks. |
| Primary | `--c-primary` | `#8E7FF7` | Lightened for contrast on dark. |
| Primary Hover | `--c-primary-hover` | `#A395FF` | |
| Primary Light (tint) | `--c-primary-light` | `#2A2440` | Selected-row / active-nav bg. |
| Secondary | `--c-secondary` | `#A99BFF` | |
| Text Primary | `--c-text` | `#ECEAF6` | Not pure white (`#FFF` glares on dark). |
| Text Secondary | `--c-text-secondary` | `#ABA8BF` | |
| Text Muted | `--c-text-muted` | `#736F86` | |
| Success | `--c-success` | `#7FD182` | + `-light #1E2A1E` |
| Warning | `--c-warning` | `#F5C462` | + `-light #2E2612` |
| Danger  | `--c-danger`  | `#FF89AC` | + `-light #2E1720` |
| Info    | `--c-info`    | `#74BDFF` | + `-light #142430` |

**Contrast is verified, not assumed** (§16). Do not add a color outside this table without
re-running the contrast check.

### 2.4 Data-viz categorical palette (§11 Charts)

Ordered, brand-anchored, colorblind-considerate. Same 6 hues in both themes, lightness
tuned per theme:

`viz-1` primary `#7C6CF6` · `viz-2` teal `#4FC5C0` · `viz-3` amber `#FFC857` ·
`viz-4` pink `#FF7AA2` · `viz-5` blue `#67B7FF` · `viz-6` violet `#B98CFF`.

Sequential (heatmaps/intensity): tint→primary ramp of `--c-primary`. Never use the
semantic Success/Danger hues as generic series colors — reserve them for meaning.

---

## 3. Typography

**Typeface:** **Be Vietnam Pro** — designed for Vietnamese, so full diacritics support with
no fallback jank. Loaded via `next/font/google`, subsets `latin` + `vietnamese`, exposed as
`--font-admin`. Weights: **400 / 500 / 600 / 700**. Numeric UI (tables, stats) uses
`font-variant-numeric: tabular-nums` so digits align in columns.

### Type scale

| Token | px / line-height | Weight | Use |
|---|---|---|---|
| `--t-display` | 40 / 1.15 | 700 | Page hero number, empty-state headline (rare). |
| `--t-h1` | 32 / 1.2 | 700 | Page title. |
| `--t-h2` | 28 / 1.25 | 700 | Section header. |
| `--t-h3` | 24 / 1.3 | 600 | Card/panel title. |
| `--t-h4` | 20 / 1.35 | 600 | Sub-section, modal title. |
| `--t-h5` | 18 / 1.4 | 600 | List group label. |
| `--t-body-lg` | 16 / 1.6 | 400/500 | Default body, form values. |
| `--t-body` | 14 / 1.55 | 400/500 | Dense UI, table cells, secondary text. |
| `--t-caption` | 13 / 1.5 | 500 | Metadata, table headers (also uppercase-tracked). |
| `--t-micro` | 12 / 1.45 | 500/600 | Badges, timestamps, chart axis. |

**Rules:** headings `--c-text`; secondary/help `--c-text-secondary`; disabled/meta
`--c-text-muted`. Max line length for prose ~72ch. Uppercase only for `--t-caption`
eyebrow/table-header labels with `letter-spacing: 0.04em`. Line-height "always feels
breathable" — never below 1.4 for anything a person reads in sentences.

---

## 4. Spacing — 8pt system

One scale. **Only** these step values (px). No arbitrary spacing.

| Token | px | Typical use |
|---|---|---|
| `--sp-1` | 4 | Icon-to-label gap, tight inline. |
| `--sp-2` | 8 | Chip padding, badge, compact stacks. |
| `--sp-3` | 12 | Input inner padding, list-row gap. |
| `--sp-4` | 16 | Default element gap, button padding-x. |
| `--sp-5` | 24 | Card padding, gap between cards. |
| `--sp-6` | 32 | Section spacing, card padding (large). |
| `--sp-7` | 40 | Page gutters (tablet). |
| `--sp-8` | 48 | Major section separation. |
| `--sp-9` | 64 | Page top padding (desktop). |
| `--sp-10` | 80 | Hero/empty-state vertical rhythm. |
| `--sp-11` | 96 | Marketing-density spacing (rare in admin). |

**Layout constants:** content max-width `1280px` (centered), sidebar `264px` expanded /
`72px` collapsed, page gutter `--sp-6` desktop → `--sp-4` mobile. Grid = 8pt everywhere;
if a value isn't on the scale, it's a bug.

---

## 5. Elevation (shadows)

Soft, indigo-tinted, layered — echoing the kids site's purple shadow but calmer. Dark mode
leans on **surface lightness + borders** rather than shadow (shadows are near-invisible on
dark, so we raise the surface color instead).

| Token | Light value | Role |
|---|---|---|
| `--e-0` | `none` (rely on border) | Flat / inline. |
| `--e-1` (card) | `0 1px 2px rgba(44,40,80,.04), 0 4px 16px -8px rgba(80,70,160,.14)` | Resting cards. |
| `--e-2` (hover) | `0 2px 4px rgba(44,40,80,.05), 0 12px 28px -10px rgba(80,70,160,.20)` | Card hover / raised. |
| `--e-3` (dropdown) | `0 8px 24px -6px rgba(44,40,80,.16)` | Menus, popovers, tooltips. |
| `--e-4` (modal) | `0 24px 64px -16px rgba(44,40,80,.28)` | Dialogs, sheets. |

**Dark:** `--e-1`→ surface `#1B1826` + `1px` border `#2C2838`; `--e-3/--e-4` use
`--c-surface-elevated` `#232030` + a faint `0 8px 24px rgba(0,0,0,.5)`. **Never** a hard
black shadow in either theme.

---

## 6. Radius

| Token | px | Applies to |
|---|---|---|
| `--r-xs` | 8 | Tiny chips, tags, checkbox. |
| `--r-sm` | 12 | Badges, small controls, table cell focus. |
| `--r-md` | 16 | **Buttons**, dropdown items, segmented controls. |
| `--r-lg` | 18 | **Inputs**, selects, textareas. |
| `--r-xl` | 24 | **Cards**, panels, list containers. |
| `--r-2xl` | 32 | **Modals**, sheets, hero surfaces. |
| `--r-full` | 9999 | **Avatars**, pills, toggles, icon buttons. |

Consistency rule: a control and its focus ring/hover surface share the same radius; nested
elements step **down** one level (a `--r-xl` card holds `--r-lg` inputs).

---

## 7. Icons

**Lucide only** — never mix packs. React via `lucide-react` (tree-shaken imports).

- Stroke width **1.75** (default) / **2** for small 16px sizes to stay crisp.
- Sizes: **16** (inline w/ 14px text), **20** (buttons, nav, default), **24** (headers,
  empty states). Larger illustrative moments use clay illustrations, not big icons.
- Color inherits `currentColor`; icons default to `--c-text-secondary`, brighten to
  `--c-text` / `--c-primary` on active/hover.
- **Minimal iconography** (principle #6): use an icon only when it speeds recognition —
  nav items, actions, status. No decorative icon soup. Every functional icon needs a text
  label or `aria-label`.

---

## 8. Buttons

Radius `--r-md` (16). Height by size. Font 500–600, `--font-admin`. Motion §13.

**Variants**
- **Primary** — solid `--c-primary`, white text; hover `--c-primary-hover` + lift + `--e-2`;
  active `--c-primary-active`. One per view, for the main action.
- **Secondary** — `--c-surface` fill, `1.5px --c-border-strong` border, `--c-text`; hover
  border→`--c-primary`, bg→`--c-primary-light`.
- **Ghost** — transparent, `--c-text-secondary`; hover bg `--c-surface-sunken`. Toolbar/tertiary.
- **Subtle/Tonal** — `--c-primary-light` bg, `--c-primary` text. Secondary emphasis without a border.
- **Danger** — solid `--c-danger` (destructive confirm) or ghost-danger (text `--c-danger`,
  hover bg `--c-danger-light`) for inline delete.
- **Icon button** — square, `--r-full`, 40×40 (md), ghost by default; always `aria-label`.

**Sizes**

| Size | Height | Padding-x | Text | Use |
|---|---|---|---|---|
| sm | 32 | 12 | 13 | Table row actions, dense toolbars. |
| md | 40 | 16 | 14 | Default. |
| lg | 48 | 24 | 16 | Primary page CTA, empty states, forms. |

**States:** default / hover (lift −1px, scale 1.02, `--e-2`) / active (scale .99, no lift) /
focus-visible (2px `--c-primary` ring, 2px offset) / disabled (opacity .5, no motion,
`cursor: not-allowed`) / loading (spinner replaces label, width locked, `aria-busy`).
Min hit target **44px** even when visual height is 32/40 (pad the tap area).

---

## 9. Forms

Large, friendly, calm. Inputs radius `--r-lg` (18), height **44** (md) / 52 (lg), padding
`--sp-3`/`--sp-4`, `1.5px --c-border-strong` border, `--c-surface` fill.

- **Label** above field, `--t-body` weight 600, `--c-text`. Optional hint right-aligned muted.
- **Focus:** border → `--c-primary`, 3px `--c-primary-light` glow ring (not the harsh
  browser outline), 150ms.
- **Help text** `--t-caption` `--c-text-secondary` below; **error** replaces it in `--c-danger`
  + field border `--c-danger` + `aria-invalid` + `aria-describedby`.
- **Placeholder** `--c-text-muted` (never as a substitute for a label).
- **Controls:** Checkbox `--r-xs` 20px, checked = `--c-primary` + white Lucide `check`.
  Radio `--r-full`. **Switch/Toggle** `--r-full`, track 44×26, thumb slides 150ms
  ease-out, on = `--c-primary`. Select = custom (Lucide `chevron-down`), dropdown uses `--e-3`.
- **Textarea** min-height 96, resize-y. **Search** = input with leading `search` icon +
  clearable. **Field groups** stack with `--sp-4`; sections split by `--sp-6`.
- **Validation timing:** validate on blur + on submit, never on every keystroke (calm).
  Disabled fields: `--c-surface-sunken` fill, muted text.

---

## 10. Cards

The core surface. `--c-surface`, `--r-xl` (24), `1px --c-border`, `--e-1`, padding `--sp-5`/
`--sp-6`. Float above `--c-bg`; hover (when interactive) → `--e-2` + −2px lift (§13).

**Patterns**
- **Stat / Metric card** — eyebrow label (`--t-caption` uppercase muted), big value
  (`--t-display`/`--t-h1`, tabular-nums), delta chip (▲ success / ▼ danger + %), optional
  sparkline. The dashboard's atomic unit.
- **Panel** — titled container (`--t-h3` header + optional action button top-right, hairline
  divider, body). Holds tables, charts, forms.
- **List card** — rows separated by `--c-border` hairlines, `--sp-3` vertical padding, hover
  `--c-surface-sunken`.
- **Empty state** — centered clay illustration (§branding) + `--t-h4` headline + muted line +
  one primary CTA. Warm, never a dead grey box.
- **Skeleton** — `--c-surface-sunken` blocks, subtle shimmer (respects reduced-motion).

Cards never nest more than one level. Padding is uniform; content, not chrome, creates rhythm.

---

## 11. Charts

Library: **Recharts** (React-19 compatible, composable, easy to restyle) — confirm in Open
Decisions. Style = *soft, rounded, calm*:

- Palette from §2.4 (`viz-1…6`). Never rely on color alone — pair with direct labels/legend
  and distinct markers.
- **Bars:** rounded top corners `--r-sm`, no borders, generous category gap, single accent
  hue unless comparing series.
- **Lines:** 2.5px stroke, smooth (monotone), soft area fill = hue at ~10% alpha, dots only
  on hover/active.
- **Grid:** horizontal hairlines only (`--c-border`), no vertical grid, no chart border.
- **Axes:** `--t-micro` `--c-text-muted`, minimal ticks, abbreviated numbers (1.2k).
- **Tooltip:** floating card `--e-3`, `--r-md`, `--c-surface-elevated`, tabular-nums, shows
  series color dot + label + value.
- **Donut/progress:** rounded line caps, `--c-surface-sunken` track, `--c-primary` value.
- **No** 3D, no heavy gradients, no drop shadows on data marks, no pie with >5 slices.
- Follow the `dataviz` skill's color-formula + contrast rules before finalizing any palette.

---

## 12. Tables

Minimal, airy, scannable — the opposite of a spreadsheet.

- **Header:** `--c-surface-sunken` bg (or plain with bottom hairline), `--t-caption`
  uppercase-tracked `--c-text-secondary`, sticky on scroll. Sortable cols show a Lucide
  chevron on hover/active.
- **Rows:** height 56 (comfortable) / 44 (compact toggle), cell padding `--sp-4`, **no zebra
  stripes** — separate with `--c-border` hairlines only. Hover = `--c-surface-sunken`.
- **Cells:** left-align text, **right-align numbers** (tabular-nums), vertically centered.
  First cell can carry avatar + primary/secondary two-line identity.
- **Row actions:** appear on hover as ghost icon buttons at row-end (kebab `more-horizontal`
  for overflow); always keyboard-reachable, never hover-only for a11y (also in the kebab menu).
- **Selection:** leading checkbox column; bulk-action bar slides in above table when ≥1 selected.
- **States:** loading = skeleton rows; empty = inline empty state (§10); error = retry inline.
- **Pagination:** footer, page size select + range text ("1–20 of 240") + prev/next; or
  cursor "Load more". No dense numbered pagers.
- **Responsive:** below `768px`, table → **stacked cards** (each row a mini card, label:value
  pairs) rather than horizontal scroll for primary tables; wide data tables get an
  `overflow-x:auto` scroll container with a fade edge.

---

## 13. Animation

"Alive, never busy." Durations **150–250ms**, curve **ease-out** (`cubic-bezier(.16,1,.3,1)`
for entrances; a gentle overshoot `cubic-bezier(.34,1.4,.64,1)` reserved for button/toggle
press — softer than the kids site's bounce).

| Interaction | Motion |
|---|---|
| Button hover | lift −1px + scale 1.02 + `--e-1`→`--e-2`, 150ms |
| Button press | scale .98, 100ms |
| Card hover | float −2px + `--e-2`, 200ms |
| Toggle/switch | thumb slide 150ms |
| Dropdown/popover | fade + 4px rise + scale .98→1, 160ms |
| Modal | overlay fade 150ms + dialog scale .96→1 rise 220ms |
| Toast | slide-in from bottom-right + fade, auto-dismiss, 200ms |
| Route/tab change | 120ms cross-fade of content region only |
| Skeleton shimmer | 1.2s loop |

**Mandatory:** wrap every non-essential animation in
`@media (prefers-reduced-motion: reduce)` → collapse to opacity-only or none. Motion never
blocks input and never runs longer than 250ms for interactive feedback.

---

## 14. Responsive rules

Breakpoints: **Desktop 1440+ · Laptop 1280 · Tablet 768 · Mobile 390** (design-verify also
at 360). Mobile-first tokens; layout adapts at these max-widths.

- **≥1280:** sidebar expanded (264px) + content (max 1280, centered), multi-column dashboards
  (stat grid 4-up), tables full.
- **1024–1279:** sidebar auto-**collapses to icon rail (72px)**, expandable on hover/click;
  stat grid 3-up.
- **768–1023 (tablet):** sidebar becomes an **overlay drawer** (hamburger); content full-width
  with `--sp-6` gutters; stat grid 2-up; charts stack.
- **≤767 (mobile):** top app bar + hamburger drawer; single column; stat grid 1-up (or 2-up
  compact); **tables → stacked cards** (§12); bottom-safe-area padding on any sticky bar;
  touch targets ≥44px.
- Never horizontal-scroll the page body; only opt-in scroll containers (wide tables, code).
  `overflow-x: clip` on root (matches kids site). Images/svg/canvas `max-width:100%`.
- Test with **device emulation (CDP `setDeviceMetricsOverride`)**, not headless
  `--window-size` (per project rule in DESIGN.md §9).

---

## 15. Dark mode rules

**Dedicated palette (§2.3), not an inversion.** Rules:

1. Backgrounds are **warm deep-indigo**, surfaces get *lighter* with elevation (bg → surface →
   elevated), the reverse of light mode where elevation adds shadow.
2. Text never pure white; primary `#ECEAF6`. Reduce large fills of saturated color —
   `--c-primary` is lightened to `#8E7FF7` for contrast; tints (`-light`) become dark, low-sat.
3. Borders do more work than shadows (shadows barely read on dark).
4. **Toggle mechanism:** `data-admin-theme="light|dark"` on the admin root, defaulting to
   `prefers-color-scheme`, with a user override persisted (localStorage + Supabase profile).
   No flash: resolve theme before paint (inline script / cookie-driven SSR class).
5. Every semantic color re-verified for AA on dark (§16). Illustrations get dark-safe variants
   or a subtle scrim.
6. Charts: switch to dark-tuned `viz-*` lightness; gridlines `--c-border` (dark); tooltip on
   `--c-surface-elevated`.

---

## 16. Accessibility rules

Target **WCAG 2.2 AA**, both themes.

- **Contrast:** text ≥ 4.5:1 (≥3:1 for ≥24px/bold ≥18.66px); UI/graphic boundaries ≥3:1.
  The "On-tint" text colors (§2.2) exist to guarantee this — verify every new pairing.
- **Keyboard:** every interactive element reachable and operable; logical tab order; visible
  **focus ring** (2px `--c-primary`, 2px offset) never removed — only restyled. Skip-to-content
  link. Modals trap focus + restore on close + `Esc` closes. Menus are arrow-key navigable.
- **ARIA & semantics:** semantic HTML first (`<nav> <main> <table> <button>`); ARIA only to
  fill gaps. Every icon-only control has `aria-label`. Live regions for toasts
  (`aria-live="polite"`) and async status. Form errors linked via `aria-describedby` +
  `aria-invalid`.
- **Targets:** ≥44×44px touch. **Motion:** honor `prefers-reduced-motion`. **Zoom:** usable
  at 200%. **Color independence:** status conveyed by icon/label + color, never color alone.
- **Testing gate:** axe-clean + keyboard-only pass + screen-reader smoke test per module
  before merge.

---

## 17. Naming conventions

**Design tokens** — kebab CSS custom properties, category-prefixed, admin-scoped so they never
collide with the kids `--brand/--ink` tokens:

```
--c-*     color        (--c-primary, --c-surface, --c-danger-light)
--t-*     typography    (--t-h1, --t-body)
--sp-*    spacing       (--sp-4)
--r-*     radius        (--r-xl)
--e-*     elevation     (--e-2)
--z-*     z-index scale (--z-nav, --z-dropdown, --z-modal, --z-toast)
--font-admin  typeface
```

Defined under `:root[data-admin-theme]` scopes in `app/admin/admin.css` (imported by the
admin route-group layout only). Kids `globals.css` is untouched.

**Components** — PascalCase files/exports (`StatCard.tsx`). CSS Modules co-located
(`StatCard.module.css`) with **camelCase** class names (`.root`, `.value`, `.deltaUp`).
**Variants** expressed as `data-*` attributes styled in the module (`[data-variant="primary"]`,
`[data-size="lg"]`) — no class-string concatenation, no runtime CSS-in-JS. Booleans as
`data-loading`, `data-disabled`.

**Props:** `variant`, `size`, `tone`, `leadingIcon`/`trailingIcon`, `isLoading`, `fullWidth`.
Event handlers `onX`. Consistent across all primitives.

---

## 18. Folder architecture

Route group + component library, inside the existing App Router:

```
app/
  admin/
    layout.tsx              # AdminShell: sidebar + topbar + <main>, theme scope, RBAC guard
    admin.css               # token :root scopes (light/dark) + resets, admin-only
    page.tsx                # Dashboard (overview)
    students/               # feature routes …
      page.tsx
    content/  reports/  settings/
    shadowing/              # EXISTING — migrates into the new shell (currently kids-styled)
components/
  admin/
    primitives/             # Button, Input, Select, Switch, Checkbox, Badge, Avatar, Tooltip …
    layout/                 # Sidebar, Topbar, PageHeader, NavItem, ThemeToggle, MobileDrawer
    data/                   # Table, DataGrid, StatCard, Chart wrappers, EmptyState, Skeleton
    feedback/               # Modal, Drawer/Sheet, Toast, ConfirmDialog, Banner
    <Component>/            # <Component>.tsx + <Component>.module.css (+ index.ts)
  admin/tokens.ts           # optional TS mirror of tokens for JS consumers (charts)
lib/
  admin/
    rbac.ts                 # role→capability map + route guards
    supabase-admin.ts       # server data helpers
```

Server Components by default; `"use client"` only for interactive primitives. Each primitive
ships with: component, module CSS, TS types, and an entry in the component index. Barrel
`components/admin/index.ts` for ergonomic imports.

---

## 19. Reusable component strategy

**Three tiers:**
1. **Tokens** (§17) — the single source of truth. Nothing hardcodes a hex/px.
2. **Primitives** — unstyled-logic + token-styled, fully controlled, a11y built in
   (Button, Input, Select, Switch, Checkbox, Badge, Avatar, Tooltip, Modal, Toast, Table).
   Each is theme-agnostic (reads tokens), variant-driven via `data-*`.
3. **Composed** — domain views assembled from primitives (StudentTable, ClassCard,
   ProgressChart, DashboardStatRow). No new styling primitives here — only composition.

**Principles:** controlled components with sensible uncontrolled fallbacks; `forwardRef` +
native prop passthrough on every primitive; slot/`children` composition over config-object
props; one component = one responsibility. **Consistency is enforced by the token layer** —
a new module can't drift because it has no raw values to drift with. Document each primitive's
variants in a living `/admin/_kitchen-sink` internal page (states + themes side by side).

---

## 20. Future scalability

- **Theming:** token scopes make additional themes (high-contrast, per-school white-label
  accent) a matter of adding a `[data-admin-theme]` block — components need zero changes.
- **RBAC:** navigation and actions render from a capability map (`lib/admin/rbac.ts`) keyed to
  Supabase roles (parent / teacher / school-admin / super-admin). New roles = new map entries.
- **Modules:** each admin feature is a self-contained route folder + composed components; the
  shell, primitives, and tokens are shared. Adding "Billing" or "Assignments" doesn't touch
  the foundation.
- **i18n:** copy centralized (Vietnamese default) behind a dictionary so English/other locales
  drop in later; Be Vietnam Pro already covers VI + Latin.
- **Design-token pipeline:** if the system grows, tokens can graduate to Style Dictionary /
  a JSON source generating both `admin.css` and `tokens.ts` — the naming (§17) is already
  pipeline-shaped.
- **Component library extraction:** the `components/admin/*` tier is structured to lift into a
  standalone package if a second surface (e.g. a native app webview) ever needs it.
- **Data volume:** tables built for virtualization/pagination from day one; charts wrap a
  single adapter so the viz lib can be swapped without touching feature code.

---

## Open decisions (need your ✅ before Phase 2)

1. **Styling mechanism** — Recommended: **CSS Modules + CSS-variable tokens** (matches repo's
   no-Tailwind convention, zero runtime, SSR-safe with React 19). Alternative: introduce
   Tailwind (faster velocity, but new dependency + convention split from kids site).
2. **Chart library** — Recommended: **Recharts**. Alt: visx (more control, more code) or
   lightweight custom SVG for simple metrics.
3. **UI copy language** — Recommended: **Vietnamese** (matches product audience + kids-site
   voice, but professional register — no "bé"). Confirm, or bilingual from day one.
4. **First build target** — Recommended: **App shell (Sidebar + Topbar + Dashboard) + core
   primitives + `/admin/_kitchen-sink`**, then migrate the existing `admin/shadowing` into it.
5. **Illustration needs** — Empty states/onboarding want a few clay-style admin illustrations
   (calmer palette than kids). OK to spec prompts in Phase 2?

---

**Awaiting approval.** On ✅ I'll proceed to Phase 2: implement the token layer + app shell +
primitive library, no feature code until the foundation is reviewed.
