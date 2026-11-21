import type {
  UserContext,
  GuidanceResult,
  TimeBlock,
  IaqHack,
  SustainableAlternative,
  ImpactMetrics,
  HousingType,
  CookingFuel,
  CommuteMode,
  HouseholdProfile,
} from '../types/index.ts';

function getMorningCommuteBlock(mode: CommuteMode): TimeBlock {
  if (mode === 'work-from-home') {
    return {
      time: '7:30 AM - 8:30 AM',
      activity: 'Morning productivity block (home office)',
      reason: 'Zero commute exposure; avoid opening exterior doors during peak morning rush hour.',
      icon: '💻',
    };
  }
  if (mode === 'public-transit') {
    return {
      time: '7:30 AM - 8:30 AM',
      activity: 'Transit commute — Wear N95/KN95 mask at stops & sit away from open windows',
      reason: 'Bus stands and platforms are localized PM2.5 hotspots; keep respirator sealed and sit away from drafty windows.',
      icon: '🚌',
    };
  }
  if (mode === 'two-wheeler') {
    return {
      time: '7:30 AM - 8:30 AM',
      activity: 'Two-wheeler commute — Sealed N95 respirator + helmet visor down',
      reason: 'Riders directly inhale ambient road-level exhaust; a sealed N95 filters 95% of inhaled fine particulates.',
      icon: '🛵',
    };
  }
  return {
    time: '7:30 AM - 8:30 AM',
    activity: 'Car commute — Keep windows up & cabin on internal air recirculation',
    reason: 'Recirculation prevents road-level diesel exhaust and PM2.5 ingress during heavy morning congestion.',
    icon: '🚗',
  };
}

function getEveningCommuteBlock(mode: CommuteMode): TimeBlock | null {
  if (mode === 'work-from-home') return null;
  if (mode === 'public-transit') {
    return {
      time: '5:30 PM - 6:30 PM',
      activity: 'Return transit commute — Put on N95 before boarding queues; avoid vehicle exhaust pipes',
      reason: 'Evening smog re-concentrates as temperatures dip; keep respirator firmly sealed in crowded transit queues.',
      icon: '🚌',
    };
  }
  if (mode === 'two-wheeler') {
    return {
      time: '5:30 PM - 6:30 PM',
      activity: 'Return commute — N95 sealed, maintain distance from diesel trucks',
      reason: 'Falling temperatures trap rush-hour emissions at street level; maintain safety buffer from heavy emitters.',
      icon: '🛵',
    };
  }
  return {
    time: '5:30 PM - 6:30 PM',
    activity: 'Return commute — Maintain sealed cabin on internal recirculation mode',
    reason: 'Evening gridlock causes severe spikes in road-level pollution; prevent outside air intake.',
    icon: '🚗',
  };
}

function getDemographicRoutineBlock(profile: HouseholdProfile): TimeBlock | null {
  if (profile === 'family-young-children') {
    return {
      time: '9:00 AM',
      activity: "Children's indoor learning & play",
      reason: 'Children breathe 50% faster than adults; keep them indoors until midday sun breaks the inversion layer.',
      icon: '📚',
    };
  }
  if (profile === 'elderly-respiratory') {
    return {
      time: '9:00 AM',
      activity: 'Medication check & pursed-lip breathing',
      reason: 'Elevated AQI triggers COPD/asthma spasms; ensure rescue inhalers are near and practice diaphragmatic breathing.',
      icon: '💊',
    };
  }
  return null;
}

function generateDailyRoutine(ctx: UserContext): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const isSevere = ctx.aqiTier === 'severe' || ctx.aqiTier === 'very-poor';

  blocks.push({
    time: '6:00 AM - 7:00 AM',
    activity: 'Indoor exercise & stretching (windows sealed)',
    reason: 'Outdoor air quality is worst during early-morning cold-air inversion; avoid any outdoor exercise.',
    icon: '🏋️',
  });

  blocks.push(getMorningCommuteBlock(ctx.commuteMode));

  const demoBlock = getDemographicRoutineBlock(ctx.householdProfile);
  if (demoBlock) blocks.push(demoBlock);

  blocks.push({
    time: '12:00 PM - 2:30 PM',
    activity: isSevere ? 'Brief outdoor window & timed ventilation (10 min)' : 'Midday cross-ventilation window (20–30 min)',
    reason: 'Solar radiation and thermals temporarily break the inversion layer; AQI reaches its daily minimum. Safest window to air out the home.',
    icon: '☀️',
  });

  const eveningCommute = getEveningCommuteBlock(ctx.commuteMode);
  if (eveningCommute) blocks.push(eveningCommute);

  blocks.push({
    time: '7:00 PM',
    activity: ctx.cookingFuel === 'solid-fuel'
      ? 'Cook with exhaust on & cracked window; avoid biomass if possible'
      : 'Evening cooking with kitchen exhaust fan running',
    reason: ctx.cookingFuel === 'solid-fuel'
      ? 'Solid-fuel combustion generates extreme indoor PM2.5 and CO; use an exhaust fan and crack a kitchen window.'
      : 'LPG combustion produces nitrogen dioxide (NO₂); running the exhaust fan prevents indoor buildup.',
    icon: '🍳',
  });

  blocks.push({
    time: '9:00 PM - 6:00 AM',
    activity: 'Sleep with HEPA purifier on & bedroom doors/windows sealed',
    reason: 'Nighttime inversions trap pollutants at ground level; sealed bedroom + continuous HEPA filtration ensures safe sleep.',
    icon: '😴',
  });

  return blocks;
}

function getHousingIaqHack(housingType: HousingType): IaqHack {
  if (housingType === 'apartment') {
    return {
      title: 'Seal Door Gaps & Window Frames',
      steps: [
        'Apply self-adhesive foam weather-stripping around entrance doors and balcony sliders.',
        'Use transparent shrink-film insulation kits on single-pane window panes.',
        'Place a heavy fabric draft stopper at the base of the front door.',
        'Seal kitchen exhaust vents with magnetic covers when cooking is finished.',
      ],
      applicableTo: ['apartment'],
      priority: 'high',
    };
  }
  return {
    title: 'Timed Cross-Ventilation Strategy',
    steps: [
      'Open opposite-facing windows strictly between 12:00 PM - 2:30 PM when solar thermals disperse ground-level smog to daily lows.',
      'Install fine mesh screens with PM2.5-rated electrostatic filters on ground-floor windows.',
      'Seal ground-floor door gaps with rubber gaskets to block road dust ingress.',
      'Run ceiling fans on low during ventilation to circulate fresh air evenly.',
    ],
    applicableTo: ['independent-house'],
    priority: 'high',
  };
}

function getPurifierIaqHack(isSevere: boolean): IaqHack {
  return {
    title: isSevere ? 'Run HEPA Purifier 24/7' : 'Strategic Air Purifier Usage',
    steps: isSevere
      ? [
          'Run certified H13 HEPA purifier continuously in bedrooms and main living spaces.',
          'Replace HEPA filters every 6–8 weeks during heavy winter smog season (Nov–Feb).',
          'DIY alternative: Box fan + MERV-13 furnace filter sealed to intake with duct tape.',
          'Keep indoor PM2.5 below 35 µg/m³; check purifier digital sensor readout regularly.',
        ]
      : [
          'Run HEPA purifier in bedrooms 1 hour before sleep and throughout the night.',
          'Operate purifier in living room during cooking and evening commute rush hours.',
          'Vacuum or rinse pre-filters weekly; replace HEPA filter every 3–6 months.',
          'DIY option: Standard box fan with a MERV-13 filter taped securely to intake.',
        ],
    applicableTo: ['apartment', 'independent-house'],
    priority: 'high',
  };
}

function getCookingIaqHack(fuel: CookingFuel): IaqHack {
  if (fuel === 'solid-fuel') {
    return {
      title: 'Eliminate Indoor Combustion Sources',
      steps: [
        'Switch immediately to portable induction or subsidized LPG (Ujjwala scheme).',
        'If biomass is unavoidable, cook in an exterior well-ventilated enclosure.',
        'Always run the kitchen exhaust fan and crack an external window while cooking.',
        'Never burn solid fuel or coal for bedroom warmth — use an electric oil-radiator.',
      ],
      applicableTo: ['apartment', 'independent-house'],
      priority: 'high',
    };
  }
  if (fuel === 'lpg') {
    return {
      title: 'Minimize LPG Combustion Byproducts',
      steps: [
        'Run the kitchen exhaust fan throughout cooking and for 15 minutes post-cooking.',
        'Maintain a steady blue flame; yellow flames signify incomplete combustion and higher PM.',
        'Keep a kitchen window cracked for cross-draft while burners are active.',
        'Consider an induction hotplate for primary boiling and frying needs.',
      ],
      applicableTo: ['apartment', 'independent-house'],
      priority: 'medium',
    };
  }
  return {
    title: 'Optimize Electric Kitchen Ventilation',
    steps: [
      'Electric cooking produces zero combustion gases, but hot oil still releases particulate fumes.',
      'Use range hood or kitchen exhaust fan during stir-frying and deep-frying.',
      'Wipe induction stove surfaces promptly to prevent residue baking onto elements.',
    ],
    applicableTo: ['apartment', 'independent-house'],
    priority: 'low',
  };
}

function getPlantAndDustIaqHacks(): IaqHack[] {
  return [
    {
      title: 'Houseplants (Minor Supplementary Wellness Tip)',
      steps: [
        'Scientific caveat: While plants (snake plants, pothos) offer psychological wellbeing, peer-reviewed IAQ studies confirm they CANNOT filter particulate matter (PM2.5) or replace a HEPA air purifier.',
        'Keep 1–2 plants per room for indoor biophilic wellness, but rely on certified HEPA filtration for all PM2.5 protection.',
        'Avoid overwatering soil, as damp indoor potting soil breeds mold spores that severely exacerbate asthma and COPD.',
      ],
      applicableTo: ['apartment', 'independent-house'],
      priority: 'low',
    },
    {
      title: 'Wet-Mop and Dust Ingress Control',
      steps: [
        'Wet-mop hard floors daily; never dry-sweep, which resuspends settled toxic particulates.',
        'Wipe furniture and surfaces with damp microfiber cloths.',
        'Launder curtains and bed linens weekly in hot water during smog season.',
        'Place damp, high-density doormats at entrance thresholds to trap footwear pollutants.',
      ],
      applicableTo: ['apartment', 'independent-house'],
      priority: 'medium',
    },
  ];
}

function generateIaqHacks(ctx: UserContext): IaqHack[] {
  const isSevere = ctx.aqiTier === 'severe' || ctx.aqiTier === 'very-poor';
  return [
    getHousingIaqHack(ctx.housingType),
    getPurifierIaqHack(isSevere),
    getCookingIaqHack(ctx.cookingFuel),
    ...getPlantAndDustIaqHacks(),
  ];
}

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

function generateAlternatives(ctx: UserContext): SustainableAlternative[] {
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
        icon: '♻️',
      },
    );
  } else {
    alts.push({
      category: 'Household Routine',
      current: 'Aerosol fresheners & incense (agarbatti)',
      alternative: 'Use essential oil reed diffusers and HEPA filtration; avoid indoor burning entirely',
      benefit: 'Incense burning releases heavy VOCs and fine particulate smoke equivalent to cigarettes',
      icon: '🧹',
    });
  }

  return alts;
}

function calculateCommuteImpact(mode: CommuteMode): { kg: number; desc: string } {
  if (mode === 'work-from-home') {
    return {
      kg: 15.0,
      desc: '14 kg/week (existing WFH baseline) + 1 kg (delivery batching)',
    };
  }
  if (mode === 'public-transit') {
    return {
      kg: 10.0,
      desc: '8.5 kg/week (existing transit baseline vs solo car) + 1.5 kg (route optimization)',
    };
  }
  if (mode === 'two-wheeler') {
    return {
      kg: 3.5,
      desc: '3.5 kg/week (shifting high-smog days to shared transit)',
    };
  }
  return {
    kg: 11.5,
    desc: '11.5 kg/week (carpooling or shifting solo driving to mass transit)',
  };
}

function calculateFuelImpact(fuel: CookingFuel): { kg: number; desc: string } {
  if (fuel === 'electric') {
    return {
      kg: 3.5,
      desc: '3.5 kg/week (existing zero-combustion electric cooking)',
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

function calculateImpactMetrics(ctx: UserContext): ImpactMetrics {
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

  const baselinePm25Concentration: Record<string, number> = {
    moderate: 60, poor: 150, 'very-poor': 260, severe: 420,
  };
  const ambientUg = baselinePm25Concentration[ctx.aqiTier] ?? 150;
  const dailyInhaledDoseAvoidedUg = Math.round(ambientUg * 15 * (pm25 / 100));

  const explanation = `PM2.5 reduction: ~${pm25}% (Base ${pm25Base[ctx.aqiTier] ?? 20}% for ${ctx.aqiTier} AQI`
    + ` + ${ctx.housingType === 'apartment' ? '5% apartment seal advantage' : '0%'} `
    + `+ ${ctx.cookingFuel === 'solid-fuel' ? '8% solid-fuel cleanup' : ctx.cookingFuel === 'electric' ? '2% electric advantage' : '0%'}). `
    + `Avoided CO₂e: ~${totalCo2e} kg/week [Commute: ${commute.desc} | Fuel: ${fuel.desc}]. `
    + `Avoided Inhaled Alveolar PM2.5 Dose: ~${dailyInhaledDoseAvoidedUg} µg/day.`;

  return {
    pm25ReductionPercent: pm25,
    weeklyCo2eAvoidedKg: totalCo2e,
    dailyInhaledDoseAvoidedUg,
    healthBenefit: healthMap[ctx.householdProfile] ?? 'Improvement in respiratory stamina and cardiovascular comfort.',
    communityBenefit: communityMap[ctx.householdProfile] ?? 'Lower collective emissions create a healthier neighborhood.',
    explanation,
  };
}

function generateSummary(ctx: UserContext, metrics: ImpactMetrics): string {
  const tierLabel = ctx.aqiTier.replace('-', ' ');
  return `Based on ${tierLabel} AQI conditions in ${ctx.location || 'your area'}, `
    + `VayuShield has tailored a low-emission winter protocol for your ${ctx.housingType.replace('-', ' ')} household. `
    + `By adhering to these steps, you can cut personal PM2.5 exposure by ~${metrics.pm25ReductionPercent}% `
    + `and sustain an avoided carbon footprint of ~${metrics.weeklyCo2eAvoidedKg} kg CO₂e weekly.`;
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
