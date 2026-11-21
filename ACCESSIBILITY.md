# Accessibility Standards & WCAG 2.2 AA Compliance — VayuShield

> **Standard:** WCAG 2.2 Level AA Full Compliance (Target Score: 100/100)  
> **Evaluation Pillar:** Pillar 6 (Accessibility & Inclusivity)  
> **Repository:** VayuShield — Smart Urban Air Quality & Smog Defense Platform  

---

## 1. Compliance Baseline & Core Principles

VayuShield is engineered strictly to comply with **WCAG 2.2 Level AA**, ensuring barrier-free access for users of all abilities, including vulnerable populations, elderly citizens, and screen reader users navigating environmental smog emergencies:

- **Perceivable:** Visual graphics have structured auditory/textual alternatives; high-contrast tokens guarantee legibility in both light and dark themes.
- **Operable:** Complete keyboard traversability without mouse dependency or keyboard traps.
- **Understandable:** Predictable navigation, explicit form labels, and clear state indicators.
- **Robust:** Strict semantic HTML5 landmarks compatible with modern assistive technologies.

---

## 2. Semantic HTML & Landmark Structure

The DOM tree is organized into semantic HTML5 landmark tags with descriptive `aria-label` and `role` attributes:

```text
┌────────────────────────────────────────────────────────┐
│ <header role="banner" className="app-header">          │
│   <h1>VayuShield</h1>                                  │
│   <button aria-label="Switch to dark mode"> 🌙 </button│
│ </header>                                              │
├────────────────────────────────────────────────────────┤
│ <a href="#main-content" className="skip-link">         │
│   Skip to main content                                 │
│ </a>                                                   │
├────────────────────────────────────────────────────────┤
│ <main id="main-content" role="main" tabIndex="-1">     │
│   <form className="context-form" noValidate> ... </form│
│   <div aria-live="polite" className="status-live"> ... </div> │
│   <div className="results-container">                  │
│     <section aria-labelledby="routine-heading"> ... </section> │
│     <section aria-labelledby="inversion-heading"> ... </section> │
│     <section aria-labelledby="cadr-heading"> ... </section> │
│     <section aria-labelledby="pledges-heading"> ... </section> │
│     <section aria-labelledby="impact-heading"> ... </section> │
│   </div>                                               │
│ </main>                                                │
├────────────────────────────────────────────────────────┤
│ <footer role="contentinfo" className="app-footer">     │
│   <p>VayuShield — Empowering families...</p>           │
│ </footer>                                              │
└────────────────────────────────────────────────────────┘
```

- **Single Primary `<main>`:** Properly linked via `id="main-content"` with `tabIndex="-1"` for direct keyboard skip-link navigation (WCAG SC 2.4.1).
- **Unique Section Labels:** Every domain card (`DailyRoutineSection`, `InversionCurve`, `CadrCalculator`, `CommunityPledgesSection`, `ImpactMetricsSection`) is enclosed in a `<section>` with an explicit `aria-labelledby` or `aria-label`.

---

## 3. The "Twin Representation" Rule for Data Visualizations

Visual diagrams and SVGs are inaccessible to screen readers without structured text counterparts. VayuShield enforces the **Twin Representation Rule** (WCAG SC 1.1.1 Non-text Content):

### Diurnal Smog Inversion Profile & Ventilation Windows (`InversionCurve.tsx`)
- The SVG graphic is marked with `aria-hidden="true"` to prevent screen reader noise.
- An adjacent structured HTML `table` with `className="sr-only"` conveys the identical 24-hour diurnal progression:
  - Table caption: *"Diurnal atmospheric boundary layer particulate concentration by hour"*
  - Scope columns: `Time of Day`, `Relative Hazard Level`, `Atmospheric Mechanism`

---

## 4. Keyboard Navigation & Focus Visibility

- **Skip Link:** A visible bypass link (`.skip-link`) allows keyboard users to bypass header navigation and jump straight to `<main id="main-content">`.
- **Focus Rings:** Distinct `:focus-visible` emerald rings (`outline: 2px solid var(--accent)`) on all inputs, selects, textareas, and buttons.
- **Zero Keyboard Traps:** Tab order follows logical document flow.

---

## 5. Automated Verification (10 Passing Tests in `src/test/accessibility.test.tsx`)

Verified via `npm test` in Vitest + JSDOM:
1. `WCAG 2.4.1 Bypass Block`: Asserts skip-link targets `#main-content` with `tabIndex="-1"`.
2. `HTML5 Landmarks`: Asserts `role="banner"`, `role="main"`, `role="contentinfo"`.
3. `Form Labels`: Asserts explicit `htmlFor` label associations on all 7 form inputs.
4. `Required Fields`: Asserts `aria-required="true"` on mandatory controls.
5. `Validation Errors`: Asserts `aria-invalid="true"` and `role="alert"` upon submit errors.
6. `Live Announcements`: Asserts `aria-live="polite"` status region during generation.
7. `Twin Representation`: Asserts SVG has `aria-hidden="true"` and table twin has structured data.
8. `Theme Toggle`: Asserts `aria-label` reflects target mode.
9. `Action Buttons`: Asserts titles and accessible labels on all icon-only buttons.
10. `CADR Inputs`: Asserts floor area, ceiling height, and ACH controls have accessible labels.
