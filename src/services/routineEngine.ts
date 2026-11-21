import type {
  UserContext,
  TimeBlock,
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

/** Generates a time-blocked daily routine based on diurnal smog inversion physics */
export function generateDailyRoutine(ctx: UserContext): TimeBlock[] {
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
