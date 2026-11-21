# Code Quality & Architectural Integrity Standards — VayuShield

> **Standard:** Strict Modularity & Zero-Any Typing (Target Score: 100/100)  
> **Evaluation Pillar:** Pillar 2 (Code Quality & Maintainability)  
> **Repository:** VayuShield — Smart Air Quality & Smog Defense Platform  

---

## 1. Clean Architectural Layering

VayuShield separates concerns cleanly across four distinct architectural tiers:

```text
src/
├── types/          # Immutable domain types & contract definitions
├── constants/      # Master lookup tables, presets & configuration thresholds
├── utils/          # Pure validation, XSS sanitization & injection detectors
├── services/       # Pure algorithmic compute, live APIs & in-memory caching
│   ├── airQualityEngine.ts   # Deterministic rule engine & physical formulas
│   ├── cadrEngine.ts         # Room CADR & DIY Corsi-Rosenthal sizer
│   ├── aiCache.ts            # Fast bitwise hash & LRU response cache
│   ├── openMeteoService.ts   # Keyless live AQI telemetry & geocoding
│   └── geminiService.ts      # Resilient LLM bridge with graceful fallback
├── components/     # UI presentation layer with semantic landmarks
└── hooks/          # Headless state management (useTheme, useGuidance)
```

---

## 2. Function & File Size Guardrails

- **Concise Functions:** Every function is kept under ~35 lines with minimal cyclomatic branching.
- **Single Responsibility:** UI components strictly render UI; all calculations (carbon offset, inhaled dose, room volume, CADR clearance duration) are delegated to pure, side-effect-free service modules.
- **Zero Dead Code:** No commented-out legacy blocks, no unused imports, and zero `console.log` statements in production components.

---

## 3. Strict TypeScript Discipline

- **Zero `any`:** Strict compiler flags enabled:
  - `verbatimModuleSyntax: true`
  - `noUncheckedIndexedAccess: true`
  - `strict: true`
- **Readonly Immutability:** Domain types leverage `readonly` array properties and immutable record mappings to eliminate unintended mutation bugs.
- **ESLint Compliance:** Full ESLint check exits with **0 errors and 0 warnings**.

---

## 4. Zero-Mock Operational Policy

Every visible action in VayuShield is backed by real, deterministic logic:
- **Preset buttons** populate real form state and generate authentic context.
- **Live AQI button** connects directly to the Open-Meteo REST API without mock stubs.
- **Copy and Export buttons** execute real client-side clipboard copy and `Blob` file generation (`vayushield-guidance.md`).
- **Community Pledges** compute dynamic real-time sums across carbon, particulate, and household metrics.
