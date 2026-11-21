import type {
  UserContext,
  SustainableAlternative,
  CommuteMode,
  CookingFuel,
} from '../types/index.ts';

function getCommuteAlternative(mode: CommuteMode): SustainableAlternative {
  const commuteMap: Record<CommuteMode, SustainableAlternative> = {
    'two-wheeler': {
      category: 'Commute',
      current: 'Daily two-wheeler commute',
      alternative: 'Metro trunk route + last-mile EV shuttle or carpool on severe days',
      benefit: 'Cuts personal road-level PM2.5 exposure by ~60% and personal emissions by ~40%',
      icon: '🚲',
    },
    car: {
      category: 'Commute',
      current: 'Single-occupancy car driving',
      alternative: 'Carpool with 2+ colleagues, or switch to metro / CNG mass transit',
      benefit: 'Reduces tailpipe emissions by up to 70% and cuts traffic congestion at road level',
      icon: '🔌',
    },
    'public-transit': {
      category: 'Commute',
      current: 'Public transit commute (Already low-emission!)',
      alternative: 'Optimize departure timing & wait inside sheltered transit hubs with N95 mask',
      benefit: 'You already avoid ~8.5 kg CO₂e/week vs solo driving; timing cuts direct roadside exposure',
      icon: '🚇',
    },
    'work-from-home': {
      category: 'Commute',
      current: 'Work from home (Already zero commute!)',
      alternative: 'Consolidate deliveries into a single weekly batch to reduce courier van trips',
      benefit: 'You already avoid ~14 kg CO₂e/week; delivery batching cuts localized neighborhood emissions',
      icon: '📦',
    },
  };
  return commuteMap[mode];
}

function getFuelAlternative(fuel: CookingFuel): SustainableAlternative {
  const fuelMap: Record<CookingFuel, SustainableAlternative> = {
    'solid-fuel': {
      category: 'Cooking Fuel',
      current: 'Wood / coal / biomass combustion',
      alternative: 'Subsidized LPG (Ujjwala scheme) or electric induction cooktop',
      benefit: 'Eliminates ~90% of indoor PM2.5 and dangerous black carbon particulate',
      icon: '⚡',
    },
    lpg: {
      category: 'Cooking Fuel',
      current: 'LPG gas burners',
      alternative: 'Induction cooktop for primary cooking; LPG as backup',
      benefit: 'Zero indoor combustion byproducts; 50% higher thermodynamic energy efficiency',
      icon: '🔋',
    },
    electric: {
      category: 'Cooking Fuel',
      current: 'Electric / induction cooking (Already zero combustion!)',
      alternative: 'Opt for renewable electricity tariff or rooftop solar credits',
      benefit: 'Already zero indoor smoke; clean grid tariff offsets upstream power emissions',
      icon: '🌱',
    },
  };
  return fuelMap[fuel];
}

/** Generates actionable low-emission alternatives for transit, cooking, and winter heating */
export function generateAlternatives(ctx: UserContext): SustainableAlternative[] {
  const alts: SustainableAlternative[] = [
    getCommuteAlternative(ctx.commuteMode),
    getFuelAlternative(ctx.cookingFuel),
    {
      category: 'Winter Heating',
      current: 'Kerosene heater / resistive blower / open fire',
      alternative: 'Oil-filled radiator (zero combustion) + heavy insulated thermal curtains',
      benefit: 'Oil radiators release zero indoor emissions; thermal curtains retain heat by 30%',
      icon: '🌡️',
    },
  ];

  if (ctx.householdProfile === 'community-coordinator') {
    alts.push(
      {
        category: 'Community Action',
        current: 'Isolated household efforts',
        alternative: 'Organize bulk HEPA purchase, shared community AQI nodes, and RWA green belts',
        benefit: 'Bulk purchases lower purifier costs by 20–30%; shared sensors detect local emission peaks',
        icon: '🌳',
      },
      {
        category: 'Waste Management',
        current: 'Open leaves & trash burning in locality',
        alternative: 'Enforce leaf composting pits and report illegal open burning via local municipal apps',
        benefit: 'Halts a primary source of ground-level toxic dioxins and heavy PM2.5 smoke',
        icon: '🍂',
      },
    );
  }

  return alts;
}
