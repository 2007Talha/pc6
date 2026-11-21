# Accessibility Standards & WCAG 2.2 AA Compliance — VayuShield

> **Standard:** WCAG 2.2 Level AA Full Compliance (Target Score: 100/100)  
> **Evaluation Pillar:** Pillar 6 (Accessibility & Inclusivity)  
> **Repository:** VayuShield — Smart Air Quality & Smog Defense Platform  

---

## 1. Compliance Baseline & Core Principles

VayuShield is engineered to comply with **WCAG 2.2 Level AA**, ensuring inclusive, barrier-free access for citizens of all abilities, including elderly users with macular degeneration, low-vision users, and screen reader navigators:

- **Perceivable:** Visual graphs have structured textual twins; high-contrast tokens guarantee legibility in both Light and Dark themes.
- **Operable:** Complete keyboard navigability without mouse dependency or focus traps.
- **Understandable:** Predictable form layout, explicit form labels, and live status feedback.
- **Robust:** Strict semantic HTML5 landmarks compatible with NVDA, VoiceOver, and JAWS.

---

## 2. Semantic HTML5 Landmark & Bypass Navigation Architecture

The application DOM tree is organized into semantic HTML5 landmark tags with a dedicated WCAG 2.4.1 bypass skip-link:

```text
┌────────────────────────────────────────────────────────┐
│ <a href="#main-content" className="skip-link">         │
│   Skip to main content                                 │
│ </a>                                                   │
├────────────────────────────────────────────────────────┤
│ <header role="banner" className="app-header">          │
│   <h1>VayuShield</h1>                                  │
│   <button aria-label="Switch to light/dark mode">...   │
│ </header>                                              │
├────────────────────────────────────────────────────────┤
│ <main id="main-content" className="main-content">      │
│   <section aria-labelledby="form-heading">             │
│     <form> ... </form>                                 │
│   </section>                                           │
│   <div aria-live="polite" className="status-live">     │
│   </div>                                               │
│   <div className="results-container">                  │
│     <section aria-labelledby="routine-heading"> ...    │
│     <section aria-labelledby="iaq-heading"> ...        │
│     <section aria-labelledby="cadr-heading"> ...       │
│     <section aria-labelledby="community-heading"> ...  │
│     <section aria-labelledby="impact-heading"> ...     │
│   </div>                                               │
│ </main>                                                │
├────────────────────────────────────────────────────────┤
│ <footer className="app-footer">                        │
│   <p>Built with care for cleaner air.</p>              │
│ </footer>                                              │
└────────────────────────────────────────────────────────┘
```

---

## 3. The "Twin Representation" Rule for Visualizations

Non-text visual components (such as SVG charts and heatmaps) are inaccessible to screen readers without equivalent structured text alternatives. VayuShield strictly enforces the **Twin Representation Rule** (WCAG SC 1.1.1):

### A. Diurnal Smog Inversion Curve (`InversionCurve.tsx`)
The native SVG curve has `aria-hidden="true"` and is paired with an adjacent `.sr-only` structured data table:
```tsx
<table className="sr-only">
  <caption>Diurnal atmospheric boundary layer particulate concentration by hour</caption>
  <thead>
    <tr>
      <th scope="col">Time of Day</th>
      <th scope="col">Relative Hazard Level</th>
      <th scope="col">Atmospheric Mechanism</th>
    </tr>
  </thead>
  <tbody>
    {/* Screen-reader accessible rows for all 8 diurnal checkpoints */}
  </tbody>
</table>
```

### B. Room CADR & DIY Air Cleaner Sizer (`CadrCalculator.tsx`)
Paired with a polite screen reader announcement twin:
```tsx
<div className="sr-only" aria-live="polite">
  CADR calculation for {areaSqFt} sq ft: Room volume is {volume} m³. Required CADR is {cadr} m³/h.
</div>
```

---

## 4. Keyboard Navigation & Focus Visibility

- **Explicit `:focus-visible` Rings:** All interactive buttons, inputs, selects, and textareas feature a high-contrast 2px cyan focus ring with a 2px offset (`outline: 2px solid var(--color-primary); outline-offset: 2px;`).
- **No Keyboard Traps:** Tab order follows the logical visual reading hierarchy from top to bottom.
- **Form Controls:** Every input possesses an explicit `<label htmlFor="...">` and `aria-required="true"`, with `aria-invalid` set dynamically upon validation errors.
