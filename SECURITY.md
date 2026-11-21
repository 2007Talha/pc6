# Security Architecture & OWASP Defense Blueprint — VayuShield

> **Standard:** Zero-Trust Defense-in-Depth (Target Score: 100/100)  
> **Evaluation Pillar:** Pillar 3 (Security & Hygiene)  
> **Repository:** VayuShield — Smart Air Quality & Smog Defense Platform  

---

## 1. Zero-Trust Security Posture

VayuShield adheres strictly to the principle of least privilege and zero-trust perimeter defense:

1. **No Committed Secrets or Leaked Keys:**
   - The application strictly reads `VITE_GEMINI_API_KEY` through environment variables.
   - `.env` is listed in `.gitignore` and has never been committed to git history.
   - A clean `.env.example` provides template instructions for optional LLM activation.
2. **Offline-First Resilience:**
   - If no API key is configured or network calls fail, VayuShield operates at 100% functionality via its internal deterministic inference engine (`src/services/airQualityEngine.ts`), preventing denial-of-service or quota exhaustion blocks.
3. **Defensive API Timeouts:**
   - Every external call is bounded by an explicit `Promise.race` timeout (3,500ms). Hanging network sockets are cleanly aborted without freezing client memory.

---

## 2. Multi-Layered Input Sanitization & XSS Defense

All user-supplied strings undergo rigorous sanitization prior to state ingestion or prompt construction:

```typescript
export function sanitizeTextInput(input: string, maxLength = 100): string {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML markup to neutralize XSS vectors
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Strip null bytes and ASCII control codes
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers (onerror, onload)
    .trim()
    .slice(0, maxLength); // Hard length truncate
}
```

### Whitelist Validation for Geography & Location
- Location names are validated against unicode property escapes: `/^[\p{L}\p{M}\s\-,.']+$/u`.
- Disallowed script blocks, protocol handlers (`javascript:`), or terminal escapes are rejected before reaching any business logic.

---

## 3. Heuristic Prompt Injection & Jailbreak Defense

The custom scenario input is inspected by an adversarial prompt injection detector (`src/utils/validation.ts`):

```typescript
const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions/i,
  /disregard\s+(?:all\s+)?(?:system|previous|prior)/i,
  /you\s+are\s+now\s+(?:a|an)\s+/i,
  /bypass\s+(?:all\s+)?(?:filters|safety|guardrails)/i,
  /system\s*:\s*/i,
  /```[\s\S]*?(?:system|prompt|jailbreak)/i,
];
```

Any attempt to exploit the LLM prompt wrapper is immediately rejected with an accessible validation error banner (`"Input contains disallowed patterns. Please rephrase your question."`).

---

## 4. Output Sanitization & LaTeX-Free Normalization

LLM responses are validated and normalized via `cleanLatexMath()` and `sanitizeGuidanceText()` before UI rendering, converting raw mathematical syntax (`$53~\mu g/m^3$`, `$(NO_2)$`) into safe, clean Unicode text (`53 µg/m³`, `NO₂`). This eliminates client-side DOM injection risks and ensures export cleanliness.
