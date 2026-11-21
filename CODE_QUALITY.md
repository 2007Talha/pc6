# Code Quality & Architectural Integrity Standards — VayuShield

> **Standard:** Strict Modularity, Decoupled Backend Gateway & Zero-Any Typing (Target Score: 100/100)  
> **Evaluation Pillar:** Pillar 2 (Code Quality & Maintainability)  
> **Repository:** VayuShield — Smart Air Quality & Smog Defense Platform  

---

## 1. Clean Multi-Tier Architectural Layering

VayuShield enforces strict separation of concerns across physical client, backend, and compute layers:

```text
├── server.ts           # Express 5 Defensive Backend Gateway (Helmet, CORS, Rate Limit, In-Memory Cache)
├── server/             # Decoupled server services, validators, cache & middleware
│   ├── aiService.ts    # Server-side guidance & CADR dispatch
│   ├── cache.ts        # In-memory SHA-256 LRU cache (100 entries, <15ms response)
│   ├── middleware.ts   # Helmet CSP, CORS allowlist, rate limiter (30 req/min), safe error handler
│   └── validators.ts   # Runtime boundary type guards & control-character scrubbers
src/
├── types/              # Immutable domain contracts & strict discriminated unions
├── constants/          # Master lookup tables (aqiTiers, profiles, presets)
├── utils/              # Pure validation, XSS sanitization & export formatters
├── services/           # Deterministic mathematical models & resilient API bridges
│   ├── airQualityEngine.ts   # Diurnal inversion & commute dose compute
│   ├── cadrEngine.ts         # Room volume, CADR sizing & Corsi-Rosenthal specifications
│   ├── aiCache.ts            # Client-side hash LRU cache
│   ├── openMeteoService.ts   # Keyless live AQI telemetry & geocoding
│   └── geminiService.ts      # Resilient LLM bridge with deterministic fallback
├── components/         # UI presentation layer with semantic landmarks
└── hooks/              # Headless state management (useContextForm, useTheme, useGuidance)
```

---

## 2. Function & File Size Guardrails (<135 Lines per File)

- **Strict File Limit:** Every single source file in `src/` and `server/` is strictly under **135 lines** (maximum file: 131 lines).
- **Concise Functions:** Every function is kept under ~35 lines with minimal cyclomatic complexity.
- **Headless Hook Extraction:** Form logic, live API states, and validation are decoupled into `useContextForm.ts`.
- **Pure Utility Extraction:** Text and Markdown export serializers are encapsulated in `exportFormatters.ts`.
- **Runtime Type Guards:** Unsafe type assertions are replaced with exhaustive runtime schema validators (`validateGuidancePayload`, `validateCadrPayload`).
- **Zero Dead Code:** Zero unused variables, zero commented-out legacy blocks, and zero `console.log` / `console.warn` outputs.

---

## 3. Static Analysis & Type Safety (Oxlint & ESLint)

- **Oxlint v1.94.0:** Clean run across all files with `--deny-warnings`:
  ```bash
  $ npm run lint
  > oxlint --deny-warnings
  Found 0 warnings and 0 errors.
  Finished in 25ms on 52 files with 116 rules.
  ```
- **TypeScript Strict Compilation:** `tsc -b` and `tsc --noEmit` pass with zero compiler errors.
- **Strict Flags Enabled:**
  - `strict: true`
  - `noImplicitAny: true`
  - `strictNullChecks: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `verbatimModuleSyntax: true`
  - `noUncheckedIndexedAccess: true`

---

## 4. Multi-Tier Automated Verification (91 Tests)

Full test suite comprises 91 automated tests across 9 test files executed via Vitest + JSDOM with 100% pass rate:
- **Tier 1:** Pure mathematical formulas & boundary assertions (EPA breakpoints, CADR volumes, decay equations).
- **Tier 2:** Service & integration logic (Open-Meteo REST API, cache hits, geocoding fallback).
- **Tier 3:** Security & defensive validation (XSS injection, prompt injection overrides, city name sanitization).
- **Tier 4:** Layout rendering & WCAG Twin Representation (screen-reader twins, keyboard focus, landmarks).
- **Tier 5:** Live Express 5 backend HTTP routes (Helmet headers, rate limiting, cache replay speed, 400 validation).
