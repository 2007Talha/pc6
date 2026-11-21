import type {
  HouseholdProfile,
  HouseholdProfileInfo,
  HousingType,
  CommuteMode,
  CookingFuel,
} from '../types/index.ts';

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

export const VALID_HOUSEHOLD_PROFILES: readonly HouseholdProfile[] = [
  'family-young-children',
  'elderly-respiratory',
  'daily-commuters',
  'community-coordinator',
];
export const VALID_HOUSING_TYPES: readonly HousingType[] = ['apartment', 'independent-house'];
export const VALID_COMMUTE_MODES: readonly CommuteMode[] = ['two-wheeler', 'car', 'public-transit', 'work-from-home'];
export const VALID_COOKING_FUELS: readonly CookingFuel[] = ['lpg', 'electric', 'solid-fuel'];
