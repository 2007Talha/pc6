# Problem Statement Alignment & Requirements Traceability Matrix (RTM) — VayuShield

> **Standard:** 100% Traceability and Operational Fidelity (Target Score: 100/100)  
> **Evaluation Pillar:** Pillar 1 (Problem Statement Alignment)  
> **Challenge:** [PromptWars Challenge 6] GenAI Winter Smog & Urban Air Pollution Assistant  

---

## 1. Problem Statement & Operational Context

During severe winter smog inversions across northern geographic basins (such as the Indo-Gangetic Plain), cold stagnant boundary air traps particulate matter (PM2.5, PM10) and toxic combustion gases (NO₂, CO) at ground level. Generic advisories ("stay indoors") fail daily commuters, young children, asthmatic patients, and community leaders who require practical, low-emission daily routines, housing-tailored indoor air quality (IAQ) hacks, sustainable alternatives, and direct quantified explanations of their choices.

**VayuShield** bridges this critical gap through a dual-engine architecture: combining Google Gemini GenAI with an offline-first deterministic air quality engine, keyless live Open-Meteo telemetry, room CADR sizers, diurnal inversion models, and collective community action pledges.

---

## 2. Requirements Traceability Matrix (RTM)

| Req ID | Problem Requirement Description | Target Persona | Priority | Implementation File | Verification Suite | Status |
|---|---|---|---|---|---|---|
| **REQ-01** | Multi-dimensional validated context inputs (Location, AQI tier, profile, housing, commute, cooking fuel, custom scenario) | All Users | `Must` | `src/components/ContextForm.tsx`, `validation.ts` | `src/test/validation.test.ts` | ✅ Verified |
| **REQ-02** | Keyless real-time air quality lookup (PM2.5, PM10, US AQI, Indian NAQI) | Global Citizens | `Must` | `src/services/openMeteoService.ts` | `src/test/openMeteoService.test.ts` | ✅ Verified |
| **REQ-03** | Low-emission daily routine schedule accounting for morning/evening smog peaks & midday inversion clearing | Vulnerable Families & Commuters | `Must` | `src/services/airQualityEngine.ts` | `src/test/airQualityEngine.test.ts` | ✅ Verified |
| **REQ-04** | Housing-tailored IAQ hacks (apartment door/window sealing vs. independent house ventilation screens) | Urban Households | `Must` | `src/services/airQualityEngine.ts`, `IaqHacksSection.tsx` | `src/test/airQualityEngine.test.ts` | ✅ Verified |
| **REQ-05** | Room CADR calculator & DIY Corsi-Rosenthal Box specifications (CDC 4 ACH standard) | Caregivers & Parents | `Must` | `src/services/cadrEngine.ts`, `CadrCalculator.tsx` | `src/test/cadrEngine.test.ts` | ✅ Verified |
| **REQ-06** | Sustainable low-emission alternatives for commute, cooking fuel, and winter heating | Commuters & Households | `Must` | `src/services/airQualityEngine.ts`, `AlternativesSection.tsx` | `src/test/airQualityEngine.test.ts` | ✅ Verified |
| **REQ-07** | Quantified direct impact with transparent math (PM2.5 reduction %, avoided CO₂e kg, inhaled alveolar dose avoided) | Evaluators & Citizens | `Must` | `src/services/airQualityEngine.ts`, `ImpactMetricsSection.tsx` | `src/test/airQualityEngine.test.ts` | ✅ Verified |
| **REQ-08** | Collective community action pledges & neighborhood offset aggregation | Community / RWA Coordinators | `Must` | `src/components/CommunityPledgesSection.tsx` | `src/test/App.test.tsx` | ✅ Verified |
| **REQ-09** | Diurnal atmospheric inversion visualization with accessible `.sr-only` screen reader twin | Screen Reader Users | `Must` | `src/components/InversionCurve.tsx` | `src/test/App.test.tsx` | ✅ Verified |
| **REQ-10** | In-memory hash-keyed LRU AI cache for sub-5ms repeated execution | System Efficiency | `Must` | `src/services/aiCache.ts`, `geminiService.ts` | `src/test/geminiService.test.ts` | ✅ Verified |
| **REQ-11** | Zero-trust input sanitization & prompt injection defense | System Security | `Must` | `src/utils/validation.ts` | `src/test/validation.test.ts` | ✅ Verified |
| **REQ-12** | 1-Click test scenario presets, clipboard copy with feedback, and Markdown report export | Hackathon Judges | `Must` | `src/components/ContextForm.tsx`, `GuidanceResults.tsx` | `src/test/App.test.tsx` | ✅ Verified |

---

## 3. Detailed Deliverables Verification

### §1 Low-Emission Daily Routine
- **Mechanism:** Accounts for diurnal boundary-layer cold-air inversions. Advises sealing windows and running indoor HEPA filtration during early mornings (6:00 AM - 9:00 AM) and evening commute peaks (5:30 PM - 8:30 PM). Identifies the 12:00 PM - 2:30 PM solar convective mixing window as the safest time for timed cross-ventilation.

### §2 Indoor Air Quality (IAQ) Hacks
- **Mechanism:** Specifically differentiates between apartment living (sealing door threshold drafts, window shrink film, magnetic exhaust seals) and ground-floor independent homes (fine-mesh electrostatic screens, rubber dust barriers, midday cross-ventilation). Features room volume CADR sizing and the open-source DIY Corsi-Rosenthal Box retrofit ($45 DIY build delivering 550 m³/h).

### §3 Sustainable Alternatives
- **Mechanism:** Suggests actionable swaps across transit (Metro + EV feeder, sealed N95 queues), home cooking (subsidized LPG / induction cooktops avoiding indoor black carbon), and winter heating (oil-filled radiant heat avoiding kerosene/open combustion).

### §4 Quantified Direct Impact
- **Mechanism:** Transparently derives estimated personal PM2.5 exposure reduction (15%–65%), weekly avoided carbon footprint (crediting low-emission baselines), and daily inhaled particulate dose avoided (alveolar deposition microgram intake based on 15 m³/day respiration).
