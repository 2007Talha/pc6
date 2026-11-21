import type { UserContext, ValidationErrors } from '../types/index.ts';
import {
  CUSTOM_SCENARIO_MAX_LENGTH,
  VALID_AQI_TIERS,
  VALID_HOUSEHOLD_PROFILES,
  VALID_HOUSING_TYPES,
  VALID_COMMUTE_MODES,
  VALID_COOKING_FUELS,
} from '../constants/index.ts';

/** Strip HTML tags, null bytes, control chars, and trim to maxLength */
export function sanitizeTextInput(raw: string, maxLength: number): string {
  return raw
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/** Detect common prompt-injection patterns (case-insensitive) */
export function detectPromptInjection(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    'ignore previous',
    'ignore above',
    'ignore all',
    'disregard',
    'system prompt',
    'you are now',
    'act as',
    'pretend to be',
    'do not follow',
    'override instructions',
  ];
  if (input.includes('```')) return true;
  return patterns.some(p => lower.includes(p));
}

/** Validate the location field; returns error string or null */
export function validateLocation(location: string): string | null {
  if (!location.trim()) return 'Location is required.';
  if (location.length < 2) return 'Location must be at least 2 characters.';
  if (location.length > 100) return 'Location must be under 100 characters.';
  if (!/^[\p{L}\p{M}\s\-,.']+$/u.test(location)) {
    return 'Location may only contain letters, spaces, hyphens, commas, and periods.';
  }
  return null;
}

/** Validate the custom scenario field; returns error string or null */
export function validateCustomScenario(scenario: string): string | null {
  if (!scenario) return null;
  if (scenario.length > CUSTOM_SCENARIO_MAX_LENGTH) {
    return `Scenario must be under ${CUSTOM_SCENARIO_MAX_LENGTH} characters.`;
  }
  if (detectPromptInjection(scenario)) {
    return 'Input contains disallowed patterns. Please rephrase your question.';
  }
  return null;
}

/** Validate all fields of a UserContext; returns map of field → error */
export function validateUserContext(ctx: UserContext): ValidationErrors {
  const errors: ValidationErrors = {};

  const locationErr = validateLocation(ctx.location);
  if (locationErr) errors.location = locationErr;

  if (!VALID_AQI_TIERS.includes(ctx.aqiTier)) {
    errors.aqiTier = 'Invalid AQI tier selected.';
  }
  if (!VALID_HOUSEHOLD_PROFILES.includes(ctx.householdProfile)) {
    errors.householdProfile = 'Invalid household profile selected.';
  }
  if (!VALID_HOUSING_TYPES.includes(ctx.housingType)) {
    errors.housingType = 'Invalid housing type selected.';
  }
  if (!VALID_COMMUTE_MODES.includes(ctx.commuteMode)) {
    errors.commuteMode = 'Invalid commute mode selected.';
  }
  if (!VALID_COOKING_FUELS.includes(ctx.cookingFuel)) {
    errors.cookingFuel = 'Invalid cooking fuel selected.';
  }

  if (ctx.customScenario) {
    const scenarioErr = validateCustomScenario(ctx.customScenario);
    if (scenarioErr) errors.customScenario = scenarioErr;
  }

  return errors;
}

/** Check whether validation errors object has any entries */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
