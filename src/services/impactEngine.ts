import type {
  UserContext,
  ImpactMetrics,
  CommuteMode,
  CookingFuel,
  HouseholdProfile,
} from '../types/index.ts';

function calculateCommuteImpact(mode: CommuteMode): { kg: number; desc: string } {
  const map: Record<CommuteMode, { kg: number; desc: string }> = {
    car: {
      kg: 12.5,
      desc: '12.5 kg/week (switching from solo driving to carpooling/mass transit)',
    },
    'two-wheeler': {
      kg: 4.2,
      desc: '4.2 kg/week (switching from two-wheeler to electric transit / shared EV)',
    },
    'public-transit': {
      kg: 8.5,
      desc: '8.5 kg/week (existing transit baseline avoided vs solo car driving)',
    },
    'work-from-home': {
      kg: 14.0,
      desc: '14 kg/week (existing zero-commute baseline avoided)',
    },
  };
  return map[mode];
}

function calculateFuelImpact(fuel: CookingFuel): { kg: number; desc: string } {
  if (fuel === 'electric') {
    return {
      kg: 5.0,
      desc: '5 kg/week (existing zero-combustion electric baseline)',
    };
  }
  if (fuel === 'lpg') {
    return {
      kg: 3.0,
      desc: '2 kg/week (clean LPG baseline vs biomass) + 1 kg (transitioning to induction)',
    };
  }
  return {
    kg: 6.0,
    desc: '6 kg/week (transitioning from solid biomass to clean induction/LPG)',
  };
}

/** Formulate demographic health and community network explanations */
function getImpactNarrative(profile: HouseholdProfile): { health: string; community: string } {
  const healthMap: Record<HouseholdProfile, string> = {
    'family-young-children': '30–40% reduction in childhood respiratory infections; guards developing lung alveoli from toxic particulate.',
    'elderly-respiratory': 'Significant reduction in COPD/asthma exacerbations; lower risk of pollution-triggered cardiovascular distress.',
    'daily-commuters': 'Sharp reduction in transit-phase particulate intake; prevents cumulative vascular inflammation from road exhaust.',
    'community-coordinator': 'Protects 50+ families from localized hotspots; collective awareness lowers neighborhood pediatric sick days.',
  };

  const communityMap: Record<HouseholdProfile, string> = {
    'family-young-children': 'Healthier neighborhood play environments; reduced school absences due to winter respiratory illness.',
    'elderly-respiratory': 'Community peer-check network ensures rapid assistance during severe winter smog episodes.',
    'daily-commuters': 'Mass transit and carpooling lower street-level traffic congestion and collective fleet exhaust.',
    'community-coordinator': 'RWA coordination eliminates leaf burning and establishes collective clean-air shelters.',
  };

  return {
    health: healthMap[profile] ?? 'Improvement in respiratory stamina and cardiovascular comfort.',
    community: communityMap[profile] ?? 'Lower collective emissions create a healthier neighborhood.',
  };
}

/** Computes quantified direct impact: PM2.5 reduction %, weekly CO2e avoided, and daily inhaled dose avoided */
export function calculateImpactMetrics(ctx: UserContext): ImpactMetrics {
  const pm25Base: Record<string, number> = {
    moderate: 15, poor: 25, 'very-poor': 35, severe: 45,
  };
  let pm25 = pm25Base[ctx.aqiTier] ?? 20;

  if (ctx.housingType === 'apartment') pm25 += 5;
  if (ctx.cookingFuel === 'solid-fuel') pm25 += 8;
  if (ctx.cookingFuel === 'electric') pm25 += 2;
  pm25 = Math.min(pm25, 65);

  const commute = calculateCommuteImpact(ctx.commuteMode);
  const fuel = calculateFuelImpact(ctx.cookingFuel);
  const totalCo2e = Math.round((commute.kg + fuel.kg) * 10) / 10;

  const baselinePm25Concentration: Record<string, number> = {
    moderate: 60, poor: 150, 'very-poor': 260, severe: 420,
  };
  const ambientUg = baselinePm25Concentration[ctx.aqiTier] ?? 150;
  const dailyInhaledDoseAvoidedUg = Math.round(ambientUg * 15 * (pm25 / 100));

  const narrative = getImpactNarrative(ctx.householdProfile);

  const explanation = `PM2.5 reduction: ~${pm25}% (Base ${pm25Base[ctx.aqiTier] ?? 20}% for ${ctx.aqiTier} AQI`
    + ` + ${ctx.housingType === 'apartment' ? '5% apartment seal advantage' : '0%'} `
    + `+ ${ctx.cookingFuel === 'solid-fuel' ? '8% solid-fuel cleanup' : ctx.cookingFuel === 'electric' ? '2% electric advantage' : '0%'}). `
    + `Avoided CO₂e: ~${totalCo2e} kg/week [Commute: ${commute.desc} | Fuel: ${fuel.desc}]. `
    + `Avoided Inhaled Alveolar PM2.5 Dose: ~${dailyInhaledDoseAvoidedUg} µg/day.`;

  return {
    pm25ReductionPercent: pm25,
    weeklyCo2eAvoidedKg: totalCo2e,
    dailyInhaledDoseAvoidedUg,
    healthBenefit: narrative.health,
    communityBenefit: narrative.community,
    explanation,
  };
}
