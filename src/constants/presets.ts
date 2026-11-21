import type { UserContext } from '../types/index.ts';

export const CUSTOM_SCENARIO_MAX_LENGTH = 500;

export const DEFAULT_USER_CONTEXT: UserContext = {
  location: '',
  aqiTier: 'poor',
  householdProfile: 'family-young-children',
  housingType: 'apartment',
  commuteMode: 'public-transit',
  cookingFuel: 'lpg',
  customScenario: '',
};

export interface QuickPreset {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly context: UserContext;
}

export const QUICK_PRESETS: readonly QuickPreset[] = [
  {
    id: 'delhi-severe',
    label: 'Delhi Smog Emergency',
    icon: '🚨',
    context: {
      location: 'New Delhi, India',
      aqiTier: 'severe',
      householdProfile: 'family-young-children',
      housingType: 'apartment',
      commuteMode: 'public-transit',
      cookingFuel: 'lpg',
      customScenario: 'Toddler has mild morning cough; need safe ventilation window & school commute respirator tips.',
    },
  },
  {
    id: 'elderly-care',
    label: 'Elderly Respiratory Care',
    icon: '🫁',
    context: {
      location: 'Lahore, Pakistan',
      aqiTier: 'very-poor',
      householdProfile: 'elderly-respiratory',
      housingType: 'independent-house',
      commuteMode: 'work-from-home',
      cookingFuel: 'electric',
      customScenario: 'Senior citizen with chronic asthma; need air purifier schedule & breathing exercise intervals.',
    },
  },
  {
    id: 'community-action',
    label: 'RWA Community Action',
    icon: '🏘️',
    context: {
      location: 'Lucknow, India',
      aqiTier: 'poor',
      householdProfile: 'community-coordinator',
      housingType: 'independent-house',
      commuteMode: 'two-wheeler',
      cookingFuel: 'solid-fuel',
      customScenario: 'Community leader organizing leaf composting to eliminate neighborhood trash burning & negotiating bulk purifier discounts.',
    },
  },
] as const;
