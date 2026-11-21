import type { AqiTier, HouseholdProfile, HousingType, CommuteMode, CookingFuel } from '../src/types';

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function sanitizeText(text: unknown, maxLen = 2000): string {
  if (typeof text !== 'string') return '';
  const controlCharPattern = new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + ']', 'g');
  return text.replace(controlCharPattern, '').trim().slice(0, maxLen);
}

export interface ValidatedGuidancePayload {
  location: string;
  aqiTier: AqiTier;
  householdProfile: HouseholdProfile;
  housingType: HousingType;
  commuteMode: CommuteMode;
  cookingFuel: CookingFuel;
  customScenario?: string;
}

const VALID_TIERS: readonly AqiTier[] = ['moderate', 'poor', 'very-poor', 'severe'];
const VALID_PROFILES: readonly HouseholdProfile[] = [
  'family-young-children',
  'elderly-respiratory',
  'daily-commuters',
  'community-coordinator',
];

export function validateGuidancePayload(payload: unknown): payload is ValidatedGuidancePayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const obj = payload as Record<string, unknown>;

  if (typeof obj.location !== 'string' || obj.location.trim().length === 0 || obj.location.length > 80) return false;
  if (typeof obj.aqiTier !== 'string' || !VALID_TIERS.includes(obj.aqiTier as AqiTier)) return false;
  if (typeof obj.householdProfile !== 'string' || !VALID_PROFILES.includes(obj.householdProfile as HouseholdProfile)) return false;

  return true;
}

export interface ValidatedCadrPayload {
  roomAreaSqFt: number;
  ceilingHeightFt?: number;
  targetAch?: number;
}

export function validateCadrPayload(payload: unknown): payload is ValidatedCadrPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const obj = payload as Record<string, unknown>;

  if (!isFiniteNumber(obj.roomAreaSqFt) || obj.roomAreaSqFt <= 0 || obj.roomAreaSqFt > 10000) return false;
  if (obj.ceilingHeightFt !== undefined && (!isFiniteNumber(obj.ceilingHeightFt) || obj.ceilingHeightFt <= 0 || obj.ceilingHeightFt > 30)) return false;

  return true;
}
