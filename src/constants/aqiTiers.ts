import type { AqiTier, AqiTierInfo } from '../types/index.ts';

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

export const VALID_AQI_TIERS: readonly AqiTier[] = ['moderate', 'poor', 'very-poor', 'severe'];
