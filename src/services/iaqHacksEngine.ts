import type { UserContext, IaqHack, HousingType, CookingFuel } from '../types/index.ts';

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
          'Replace HEPA filters every 6-8 weeks during heavy winter smog season (Nov-Feb).',
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

/** Generates prioritized, housing-tailored indoor air quality hacks */
export function generateIaqHacks(ctx: UserContext): IaqHack[] {
  const isSevere = ctx.aqiTier === 'severe' || ctx.aqiTier === 'very-poor';
  return [
    getHousingIaqHack(ctx.housingType),
    getPurifierIaqHack(isSevere),
    getCookingIaqHack(ctx.cookingFuel),
    ...getPlantAndDustIaqHacks(),
  ];
}
