import type {
  UserContext,
  GuidanceResult,
  TimeBlock,
  IaqHack,
  SustainableAlternative,
  ImpactMetrics,
} from '../types/index.ts';

function generateDailyRoutine(ctx: UserContext): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const isSevere = ctx.aqiTier === 'severe' || ctx.aqiTier === 'very-poor';
  const isChild = ctx.householdProfile === 'family-young-children';
  const isElderly = ctx.householdProfile === 'elderly-respiratory';
  const isWfh = ctx.commuteMode === 'work-from-home';

  blocks.push({
    time: '6:00–7:00 AM',
    activity: 'Indoor exercise & stretching',
    reason: 'Outdoor air quality is worst during early-morning cold-air inversion; stay indoors.',
    icon: '🏋️',
  });

  if (!isWfh) {
    const mask = ctx.commuteMode === 'two-wheeler' ? 'Wear N95 mask' : 'Keep car windows up, recirculate air';
    blocks.push({
      time: '7:30–8:30 AM',
      activity: `Sealed commute — ${mask}`,
      reason: 'Peak traffic emissions combine with trapped morning smog at road level.',
      icon: ctx.commuteMode === 'two-wheeler' ? '🛵' : ctx.commuteMode === 'car' ? '🚗' : '🚌',
    });
  } else {
    blocks.push({
      time: '7:30–8:30 AM',
      activity: 'Morning productivity block (home office)',
      reason: 'Avoid any outdoor exposure during peak morning smog.',
      icon: '💻',
    });
  }

  if (isChild) {
    blocks.push({
      time: '9:00 AM',
      activity: 'Children\'s indoor learning & play',
      reason: 'Children breathe 50% faster than adults; keep them indoors until UV breaks the inversion.',
      icon: '📚',
    });
  }
  if (isElderly) {
    blocks.push({
      time: '9:00 AM',
      activity: 'Medication check & breathing exercises',
      reason: 'High-AQI days worsen COPD/asthma; ensure inhalers are accessible and practice pursed-lip breathing.',
      icon: '💊',
    });
  }

  blocks.push({
    time: isSevere ? '12:00–12:30 PM' : '11:30 AM–1:00 PM',
    activity: isSevere ? 'Brief outdoor window (15–30 min max)' : 'Midday outdoor window',
    reason: 'UV radiation and rising thermals break the inversion layer; AQI typically dips to its daily low.',
    icon: '☀️',
  });

  blocks.push({
    time: '3:00–4:00 PM',
    activity: isSevere ? 'Cross-ventilate home briefly (10 min)' : 'Open windows for cross-ventilation (20–30 min)',
    reason: 'Afternoon thermals disperse ground-level PM2.5; flush stale indoor air before evening inversion begins.',
    icon: '🪟',
  });

  if (!isWfh) {
    blocks.push({
      time: '5:30–6:30 PM',
      activity: 'Return commute — seal cabin, N95 if exposed',
      reason: 'Evening inversion re-traps emissions; road-level PM2.5 spikes during rush hour.',
      icon: '🏠',
    });
  }

  blocks.push({
    time: '7:00 PM',
    activity: ctx.cookingFuel === 'solid-fuel'
      ? 'Cook with exhaust fan on; avoid biomass if possible'
      : 'Evening cooking with ventilation on',
    reason: ctx.cookingFuel === 'solid-fuel'
      ? 'Solid-fuel combustion releases PM2.5 and CO indoors; use exhaust and open a kitchen window briefly.'
      : 'Even LPG produces some NO₂; run the kitchen exhaust to prevent indoor buildup.',
    icon: '🍳',
  });

  blocks.push({
    time: '9:00 PM–6:00 AM',
    activity: 'Sleep with purifier on, windows sealed',
    reason: 'Nighttime inversions trap pollutants at ground level; sealed bedroom + HEPA filtration ensures safe sleep.',
    icon: '😴',
  });

  return blocks;
}

function generateIaqHacks(ctx: UserContext): IaqHack[] {
  const hacks: IaqHack[] = [];
  const isSevere = ctx.aqiTier === 'severe' || ctx.aqiTier === 'very-poor';

  if (ctx.housingType === 'apartment') {
    hacks.push({
      title: 'Seal Door Gaps & Window Frames',
      steps: [
        'Apply self-adhesive foam weather-stripping around all entry doors.',
        'Use transparent shrink-film insulation kits on single-pane windows.',
        'Place a draft stopper (rolled towel works) at the base of the front door.',
        'Seal kitchen exhaust vent with a magnetic cover when not cooking.',
      ],
      applicableTo: ['apartment'],
      priority: 'high',
    });
  } else {
    hacks.push({
      title: 'Timed Cross-Ventilation Strategy',
      steps: [
        'Open opposite-facing windows only between 12 PM–3 PM when AQI dips.',
        'Install mesh screens with PM2.5-rated filters on ground-floor windows.',
        'Seal gaps around ground-floor doors with rubber gaskets to block ground-level dust.',
        'Use ceiling fans to circulate filtered air evenly across rooms.',
      ],
      applicableTo: ['independent-house'],
      priority: 'high',
    });
  }

  hacks.push({
    title: isSevere ? 'Run HEPA Purifier 24/7' : 'Strategic Air Purifier Usage',
    steps: isSevere
      ? [
          'Run HEPA purifier continuously in bedrooms and living areas.',
          'Replace filters monthly during severe-AQI season (Oct–Feb).',
          'DIY alternative: box fan + MERV-13 furnace filter taped to intake side.',
          'Monitor purifier PM2.5 readout; keep indoor levels below 35 µg/m³.',
        ]
      : [
          'Run HEPA purifier in bedrooms 1 hour before sleep and overnight.',
          'Use purifier in living room during cooking and evening hours.',
          'Clean pre-filters weekly; replace HEPA every 3–6 months.',
          'DIY option: attach a MERV-13 filter to a standard box fan with tape.',
        ],
    applicableTo: ['apartment', 'independent-house'],
    priority: 'high',
  });

  if (ctx.cookingFuel === 'solid-fuel') {
    hacks.push({
      title: 'Eliminate Indoor Combustion Sources',
      steps: [
        'Switch to LPG (Ujjwala scheme subsidy) or portable induction cooktop.',
        'If solid fuel is unavoidable, use an improved-combustion chulha design.',
        'Always cook with the kitchen exhaust fan on and a window cracked open.',
        'Never use solid fuel for room heating — use an electric heater instead.',
      ],
      applicableTo: ['apartment', 'independent-house'],
      priority: 'high',
    });
  } else if (ctx.cookingFuel === 'lpg') {
    hacks.push({
      title: 'Minimize LPG Combustion Byproducts',
      steps: [
        'Always run the kitchen exhaust fan while cooking and 15 min after.',
        'Keep a kitchen window cracked for cross-draft during cooking.',
        'Maintain blue-flame burner tune; yellow flames emit more PM2.5.',
        'Consider an induction cooktop for zero-combustion cooking.',
      ],
      applicableTo: ['apartment', 'independent-house'],
      priority: 'medium',
    });
  } else {
    hacks.push({
      title: 'Optimize Electric Kitchen Ventilation',
      steps: [
        'Electric cooking produces minimal PM2.5, but oil fumes still generate particles.',
        'Use a range hood or exhaust fan during frying or high-heat cooking.',
        'Wipe stove surfaces to prevent residue from becoming airborne.',
      ],
      applicableTo: ['apartment', 'independent-house'],
      priority: 'low',
    });
  }

  hacks.push({
    title: 'Indoor Plants for Air Quality Boost',
    steps: [
      'Place snake plants (Sansevieria) in bedrooms — they release O₂ at night.',
      'Add money plants (Pothos) near windows to absorb formaldehyde and VOCs.',
      'Use peace lilies in living areas to help remove benzene and trichloroethylene.',
      'Avoid overwatering to prevent mold growth, which worsens indoor air quality.',
    ],
    applicableTo: ['apartment', 'independent-house'],
    priority: 'medium',
  });

  hacks.push({
    title: 'Wet-Mop and Dust Control',
    steps: [
      'Wet-mop floors daily instead of dry sweeping to avoid resuspending settled PM.',
      'Use damp microfiber cloths for dusting surfaces.',
      'Wash curtains and bedding weekly in hot water during smog season.',
      'Place damp doormats at entrances to trap incoming particulate matter.',
    ],
    applicableTo: ['apartment', 'independent-house'],
    priority: 'medium',
  });

  return hacks;
}

function generateAlternatives(ctx: UserContext): SustainableAlternative[] {
  const alts: SustainableAlternative[] = [];

  // Commute alternatives
  const commuteMap: Record<string, SustainableAlternative> = {
    'two-wheeler': {
      category: 'Commute',
      current: 'Daily two-wheeler commute',
      alternative: 'Carpool, metro + last-mile EV scooter, or e-bike',
      benefit: 'Reduces personal road-level PM2.5 exposure by 60% and CO₂ by ~40%',
      icon: '🚲',
    },
    car: {
      category: 'Commute',
      current: 'Single-occupancy car commute',
      alternative: 'CNG/EV vehicle, carpool with 2+ passengers, or metro for trunk route',
      benefit: 'Cuts tailpipe emissions 70% (EV) or 25% (CNG); carpool halves per-capita emissions',
      icon: '🔌',
    },
    'public-transit': {
      category: 'Commute',
      current: 'Public transit commute',
      alternative: 'Already low-emission — optimize route to minimize wait time at polluted stops',
      benefit: 'Bus/metro riders produce 80% less CO₂ per km than car drivers',
      icon: '🚇',
    },
    'work-from-home': {
      category: 'Commute',
      current: 'Work from home',
      alternative: 'Reduce delivery orders; batch errands into one weekly trip',
      benefit: 'WFH already avoids ~15 kg CO₂e/week; reducing deliveries cuts last-mile emissions',
      icon: '📦',
    },
  };
  const commuteAlt = commuteMap[ctx.commuteMode];
  if (commuteAlt) alts.push(commuteAlt);

  // Cooking fuel alternatives
  const fuelMap: Record<string, SustainableAlternative> = {
    'solid-fuel': {
      category: 'Cooking Fuel',
      current: 'Wood / coal / dung burning',
      alternative: 'LPG (via Ujjwala subsidy) or portable induction cooktop',
      benefit: 'Eliminates ~90% of indoor cooking PM2.5 and black carbon',
      icon: '⚡',
    },
    lpg: {
      category: 'Cooking Fuel',
      current: 'LPG stove',
      alternative: 'Induction cooktop for primary cooking; LPG as backup',
      benefit: 'Zero-combustion cooking; 50% more energy-efficient than gas',
      icon: '🔋',
    },
    electric: {
      category: 'Cooking Fuel',
      current: 'Electric / induction cooking',
      alternative: 'Subscribe to green energy tariff for 100% renewable electricity',
      benefit: 'Already zero indoor combustion; renewable tariff further offsets grid CO₂',
      icon: '🌱',
    },
  };
  const fuelAlt = fuelMap[ctx.cookingFuel];
  if (fuelAlt) alts.push(fuelAlt);

  // Heating alternative
  alts.push({
    category: 'Winter Heating',
    current: 'Room heater / blower / kerosene',
    alternative: 'Oil-filled radiator (zero-combustion) + insulated curtains + draft-proofing',
    benefit: 'Oil radiators produce zero indoor emissions; insulation reduces energy use 30%',
    icon: '🌡️',
  });

  // Community-level alternatives
  if (ctx.householdProfile === 'community-coordinator') {
    alts.push({
      category: 'Community Action',
      current: 'Individual household efforts',
      alternative: 'Organize bulk HEPA purifier purchase, community tree plantation, and shared AQI monitors',
      benefit: 'Bulk buying cuts purifier costs 20–30%; tree canopy absorbs PM and NO₂ long-term',
      icon: '🌳',
    });
    alts.push({
      category: 'Waste Management',
      current: 'Open waste burning in neighborhood',
      alternative: 'Set up segregated waste collection + composting pits; report burning via CPCB app',
      benefit: 'Eliminating open burning removes a major local PM2.5 and dioxin source',
      icon: '♻️',
    });
  } else {
    alts.push({
      category: 'Household Routine',
      current: 'Conventional cleaning products',
      alternative: 'Switch to low-VOC cleaners; avoid aerosol sprays and incense during smog season',
      benefit: 'Aerosol sprays and agarbatti release fine particulates and VOCs indoors',
      icon: '🧹',
    });
  }

  return alts;
}

function calculateImpactMetrics(ctx: UserContext): ImpactMetrics {
  // Base PM2.5 reduction by AQI tier (higher AQI = more room for improvement)
  const pm25Base: Record<string, number> = {
    moderate: 15, poor: 25, 'very-poor': 35, severe: 45,
  };
  let pm25 = pm25Base[ctx.aqiTier] ?? 20;

  // Housing modifier
  if (ctx.housingType === 'apartment') pm25 += 5; // easier to seal
  // Fuel modifier
  if (ctx.cookingFuel === 'solid-fuel') pm25 += 8; // switching eliminates major source
  if (ctx.cookingFuel === 'electric') pm25 += 2;

  pm25 = Math.min(pm25, 65); // cap at realistic maximum

  // Weekly CO2e calculation
  const commuteReduction: Record<string, number> = {
    'two-wheeler': 3, car: 12, 'public-transit': 1, 'work-from-home': 15,
  };
  const fuelReduction: Record<string, number> = {
    'solid-fuel': 5, lpg: 2, electric: 0.5,
  };
  const co2e = (commuteReduction[ctx.commuteMode] ?? 3)
    + (fuelReduction[ctx.cookingFuel] ?? 1);

  // Profile-specific health benefits
  const healthMap: Record<string, string> = {
    'family-young-children': 'Reduced childhood respiratory infections by 30–40%; lower asthma trigger exposure for developing lungs.',
    'elderly-respiratory': 'Fewer COPD/asthma exacerbations; 20–30% reduction in emergency room visits during smog season.',
    'daily-commuters': 'Lower cumulative PM2.5 exposure during transit; reduced risk of cardiovascular strain from daily pollution dose.',
    'community-coordinator': 'Improved air quality awareness across 50+ households; collective action amplifies individual health gains.',
  };

  const communityMap: Record<string, string> = {
    'family-young-children': 'Safer play environments for children; reduced school absenteeism due to pollution-related illness.',
    'elderly-respiratory': 'Peer support network for medication adherence and emergency response during severe-AQI days.',
    'daily-commuters': 'Carpool networks reduce road congestion and collective emissions in the neighborhood.',
    'community-coordinator': 'Coordinated community response reduces local PM2.5 hotspots and builds resilience for future smog seasons.',
  };

  const explanation = `PM2.5 reduction: ${pm25Base[ctx.aqiTier] ?? 20}% base for ${ctx.aqiTier} AQI`
    + ` + ${ctx.housingType === 'apartment' ? 5 : 0}% (${ctx.housingType} sealing advantage)`
    + ` + ${ctx.cookingFuel === 'solid-fuel' ? 8 : ctx.cookingFuel === 'electric' ? 2 : 0}% (${ctx.cookingFuel} factor)`
    + ` = ~${pm25}%. CO₂e: ${commuteReduction[ctx.commuteMode] ?? 3} kg/week (commute shift)`
    + ` + ${fuelReduction[ctx.cookingFuel] ?? 1} kg/week (fuel switch) = ~${co2e} kg/week.`;

  return {
    pm25ReductionPercent: pm25,
    weeklyCo2eAvoidedKg: Math.round(co2e * 10) / 10,
    healthBenefit: healthMap[ctx.householdProfile] ?? 'General improvement in respiratory and cardiovascular health.',
    communityBenefit: communityMap[ctx.householdProfile] ?? 'Cleaner air contributes to a healthier neighborhood.',
    explanation,
  };
}

function generateSummary(ctx: UserContext, metrics: ImpactMetrics): string {
  const tierLabel = ctx.aqiTier.replace('-', ' ');
  return `Based on ${tierLabel} AQI conditions in ${ctx.location || 'your area'}, `
    + `VayuShield recommends a tailored winter routine for your ${ctx.housingType.replace('-', ' ')} household. `
    + `By following these measures, you can reduce PM2.5 exposure by ~${metrics.pm25ReductionPercent}% `
    + `and avoid ~${metrics.weeklyCo2eAvoidedKg} kg of CO₂e weekly.`;
}

/** Main entry: generates complete deterministic guidance from user context */
export function generateDeterministicGuidance(ctx: UserContext): GuidanceResult {
  const dailyRoutine = generateDailyRoutine(ctx);
  const iaqHacks = generateIaqHacks(ctx);
  const sustainableAlternatives = generateAlternatives(ctx);
  const impactMetrics = calculateImpactMetrics(ctx);
  const summary = generateSummary(ctx, impactMetrics);

  return { dailyRoutine, iaqHacks, sustainableAlternatives, impactMetrics, summary };
}
