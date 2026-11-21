# Engineering Roadmap & Implementation Plan — VayuShield

## Phase 1: Core Domain Engine & Physical Modeling
- Implement domain types in `src/types/index.ts`.
- Formulate deterministic inference engine in `src/services/airQualityEngine.ts`:
  - Diurnal cold-air inversion routine blocks.
  - Housing-specific IAQ hacks.
  - Commute & fuel sustainable alternatives.
  - Quantified impact metrics (PM2.5 reduction, weekly avoided CO₂e, daily inhaled alveolar dose avoided).
- Formulate room CADR & DIY Corsi-Rosenthal sizer in `src/services/cadrEngine.ts`.

## Phase 2: Security, Sanitization & Telemetry
- Implement XSS stripping and control code sanitization in `src/utils/validation.ts`.
- Implement heuristic prompt injection detector.
- Integrate Open-Meteo geocoding and live AQI lookups in `src/services/openMeteoService.ts`.
- Implement in-memory hash-keyed LRU AI response cache in `src/services/aiCache.ts`.

## Phase 3: Accessible Presentation & Responsive UI
- Construct semantic React components with WCAG landmarks (`<header role="banner">`, `<main id="main-content">`, `<footer role="contentinfo">`).
- Build native SVG Diurnal Inversion Curve with paired `.sr-only` table twins.
- Build interactive Room CADR calculator and DIY Corsi-Rosenthal blueprint viewer.
- Build Community Action Pledges module with real-time aggregate offsets.
- Support dual high-contrast Light/Dark themes with localStorage persistence.

## Phase 4: Automated Testing & Verification
- Unit test suite for deterministic engine, CADR formulas, and baseline carbon calculations.
- Validation suite for XSS stripping, prompt injection detection, and length caps.
- Open-Meteo telemetry tests for normal, error, and boundary responses.
- Gemini fallback and in-memory cache hit tests.
- React Testing Library end-to-end user flow tests in JSDOM.
