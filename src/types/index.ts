/** AQI severity tiers with numeric ranges */
export type AqiTier = 'moderate' | 'poor' | 'very-poor' | 'severe';

export interface AqiTierInfo {
  readonly id: AqiTier;
  readonly label: string;
  readonly range: string;
  readonly minAqi: number;
  readonly maxAqi: number;
  readonly color: string;
  readonly description: string;
}

/** Household / community profile presets */
export type HouseholdProfile =
  | 'family-young-children'
  | 'elderly-respiratory'
  | 'daily-commuters'
  | 'community-coordinator';

export interface HouseholdProfileInfo {
  readonly id: HouseholdProfile;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}

/** Housing type */
export type HousingType = 'apartment' | 'independent-house';

/** Commute mode */
export type CommuteMode = 'two-wheeler' | 'car' | 'public-transit' | 'work-from-home';

/** Cooking/heating fuel */
export type CookingFuel = 'lpg' | 'electric' | 'solid-fuel';

/** Complete user context form data */
export interface UserContext {
  readonly location: string;
  readonly aqiTier: AqiTier;
  readonly householdProfile: HouseholdProfile;
  readonly housingType: HousingType;
  readonly commuteMode: CommuteMode;
  readonly cookingFuel: CookingFuel;
  readonly customScenario: string;
}

/** Time block in a daily routine */
export interface TimeBlock {
  readonly time: string;
  readonly activity: string;
  readonly reason: string;
  readonly icon: string;
}

/** Indoor air quality hack */
export interface IaqHack {
  readonly title: string;
  readonly steps: readonly string[];
  readonly applicableTo: readonly HousingType[];
  readonly priority: 'high' | 'medium' | 'low';
}

/** Sustainable alternative recommendation */
export interface SustainableAlternative {
  readonly category: string;
  readonly current: string;
  readonly alternative: string;
  readonly benefit: string;
  readonly icon: string;
}

/** Quantified impact metrics */
export interface ImpactMetrics {
  readonly pm25ReductionPercent: number;
  readonly weeklyCo2eAvoidedKg: number;
  readonly dailyInhaledDoseAvoidedUg?: number;
  readonly healthBenefit: string;
  readonly communityBenefit: string;
  readonly explanation: string;
}

/** Community action pledge item */
export interface CommunityPledge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly co2eSavedKgPerWeek: number;
  readonly pm25AvertedGramsPerWeek: number;
  readonly icon: string;
  readonly active: boolean;
}

/** Collective community impact summary */
export interface CommunityImpactSummary {
  readonly activePledgesCount: number;
  readonly weeklyCo2eAvoidedKg: number;
  readonly weeklyPm25AvertedGrams: number;
  readonly householdsProtected: number;
}

/** Full structured guidance output */
export interface GuidanceResult {
  readonly dailyRoutine: readonly TimeBlock[];
  readonly iaqHacks: readonly IaqHack[];
  readonly sustainableAlternatives: readonly SustainableAlternative[];
  readonly impactMetrics: ImpactMetrics;
  readonly summary: string;
}

/** App state for the guidance generation flow */
export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GenerationState {
  readonly status: GenerationStatus;
  readonly result: GuidanceResult | null;
  readonly error: string | null;
  readonly source: 'gemini' | 'deterministic' | 'cached' | null;
}

/** Form validation error map */
export type ValidationErrors = Partial<Record<keyof UserContext, string>>;
