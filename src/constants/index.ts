import type {
  AqiTier,
  AqiTierInfo,
  HouseholdProfile,
  HouseholdProfileInfo,
  HousingType,
  CommuteMode,
  CookingFuel,
  UserContext,
} from '../types/index.ts';

export const AQI_TIERS: readonly AqiTierInfo[] = [
  {
    id: 'moderate',
    label: 'Moderate / Sensitive Risk',
    range: '101–150 (USG)',
    minAqi: 101,
    maxAqi: 150,
    color: '#f59e0b',
    description: 'Unhealthy for sensitive groups: elderly, children, and respiratory patients',
  },
  {
    id: 'poor',
    label: 'Unhealthy / Poor',
    range: '151–300',
    minAqi: 151,
    maxAqi: 300,
    color: '#f97316',
    description: 'Unhealthy for all: elevated respiratory symptoms and airway irritation',
  },
  {
    id: 'very-poor',
    label: 'Very Unhealthy / Very Poor',
    range: '301–400',
    minAqi: 301,
    maxAqi: 400,
    color: '#ef4444',
    description: 'Health alert: serious risk of respiratory and cardiovascular events',
  },
  {
    id: 'severe',
    label: 'Severe / Hazardous',
    range: '400+',
    minAqi: 401,
    maxAqi: 999,
    color: '#7f1d1d',
    description: 'Emergency conditions: entire population affected; avoid outdoor exposure',
  },
] as const;

export const HOUSEHOLD_PROFILES: readonly HouseholdProfileInfo[] = [
  {
    id: 'family-young-children',
    label: 'Family with Young Children',
    icon: '👨‍👩‍👧‍👦',
    description: 'Children under 12 have developing lungs and breathe faster, increasing pollutant intake per kg of body weight.',
  },
  {
    id: 'elderly-respiratory',
    label: 'Elderly / Respiratory Sensitivity',
    icon: '🫁',
    description: 'Elderly adults and those with asthma, COPD, or cardiovascular conditions face elevated risk during high-AQI episodes.',
  },
  {
    id: 'daily-commuters',
    label: 'Daily Commuters',
    icon: '🚗',
    description: 'Workers exposed to road-level pollutants during peak traffic hours need transit-specific protection strategies.',
  },
  {
    id: 'community-coordinator',
    label: 'Community / Neighborhood Coordinator',
    icon: '🏘️',
    description: 'Neighborhood or RWA leaders coordinating collective action for cleaner air across a residential community.',
  },
] as const;

export const HOUSING_OPTIONS: readonly { id: HousingType; label: string; icon: string }[] = [
  { id: 'apartment', label: 'Apartment / Flat', icon: '🏢' },
  { id: 'independent-house', label: 'Independent / Ground-Floor House', icon: '🏠' },
] as const;

export const COMMUTE_OPTIONS: readonly { id: CommuteMode; label: string; icon: string }[] = [
  { id: 'two-wheeler', label: 'Two-Wheeler', icon: '🛵' },
  { id: 'car', label: 'Car', icon: '🚗' },
  { id: 'public-transit', label: 'Public Transit', icon: '🚌' },
  { id: 'work-from-home', label: 'Work from Home', icon: '🏠' },
] as const;

export const COOKING_FUEL_OPTIONS: readonly { id: CookingFuel; label: string; icon: string }[] = [
  { id: 'lpg', label: 'LPG', icon: '🔵' },
  { id: 'electric', label: 'Electric / Induction', icon: '⚡' },
  { id: 'solid-fuel', label: 'Solid Fuel (Wood / Coal / Dung)', icon: '🪵' },
] as const;

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

export const VALID_AQI_TIERS: readonly AqiTier[] = ['moderate', 'poor', 'very-poor', 'severe'];
export const VALID_HOUSEHOLD_PROFILES: readonly HouseholdProfile[] = ['family-young-children', 'elderly-respiratory', 'daily-commuters', 'community-coordinator'];
export const VALID_HOUSING_TYPES: readonly HousingType[] = ['apartment', 'independent-house'];
export const VALID_COMMUTE_MODES: readonly CommuteMode[] = ['two-wheeler', 'car', 'public-transit', 'work-from-home'];
export const VALID_COOKING_FUELS: readonly CookingFuel[] = ['lpg', 'electric', 'solid-fuel'];
