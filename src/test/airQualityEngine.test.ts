import { describe, it, expect } from 'vitest';
import { generateDeterministicGuidance } from '../services/airQualityEngine.ts';
import type { UserContext } from '../types/index.ts';

const baseContext: UserContext = {
  location: 'New Delhi',
  aqiTier: 'very-poor',
  householdProfile: 'family-young-children',
  housingType: 'apartment',
  commuteMode: 'public-transit',
  cookingFuel: 'lpg',
  customScenario: '',
};

describe('airQualityEngine', () => {
  it('generates complete guidance result with all required sections', () => {
    const result = generateDeterministicGuidance(baseContext);

    expect(result).toBeDefined();
    expect(result.dailyRoutine.length).toBeGreaterThanOrEqual(6);
    expect(result.iaqHacks.length).toBeGreaterThanOrEqual(4);
    expect(result.sustainableAlternatives.length).toBeGreaterThanOrEqual(3);
    expect(result.impactMetrics).toBeDefined();
    expect(result.impactMetrics.dailyInhaledDoseAvoidedUg).toBeGreaterThan(0);
    expect(result.summary).toContain('New Delhi');
  });

  it('adjusts daily routine for public transit vs car vs two-wheeler vs WFH', () => {
    const transitResult = generateDeterministicGuidance({ ...baseContext, commuteMode: 'public-transit' });
    const carResult = generateDeterministicGuidance({ ...baseContext, commuteMode: 'car' });
    const bikeResult = generateDeterministicGuidance({ ...baseContext, commuteMode: 'two-wheeler' });
    const wfhResult = generateDeterministicGuidance({ ...baseContext, commuteMode: 'work-from-home' });

    const transitMorning = transitResult.dailyRoutine.find(b => b.time.includes('7:30'));
    const carMorning = carResult.dailyRoutine.find(b => b.time.includes('7:30'));
    const bikeMorning = bikeResult.dailyRoutine.find(b => b.time.includes('7:30'));
    const wfhMorning = wfhResult.dailyRoutine.find(b => b.time.includes('7:30'));

    expect(transitMorning?.activity).toContain('Transit commute');
    expect(transitMorning?.activity).toContain('N95');
    expect(transitMorning?.activity).not.toContain('car');
    expect(transitMorning?.reason).toContain('Bus stands');

    expect(carMorning?.activity).toContain('Car commute');
    expect(carMorning?.activity).toContain('recirculation');

    expect(bikeMorning?.activity).toContain('Two-wheeler');
    expect(bikeMorning?.activity).toContain('visor');

    expect(wfhMorning?.activity).toContain('home office');
  });

  it('synchronizes cross-ventilation window across routine and IAQ hacks (12:00 PM - 2:30 PM)', () => {
    const result = generateDeterministicGuidance(baseContext);
    const routineVentilation = result.dailyRoutine.find(b => b.time.includes('12:00 PM - 2:30 PM'));
    expect(routineVentilation).toBeDefined();
    expect(routineVentilation?.reason).toContain('break the inversion layer');

    const houseResult = generateDeterministicGuidance({ ...baseContext, housingType: 'independent-house' });
    const ventHack = houseResult.iaqHacks.find(h => h.title.includes('Cross-Ventilation'));
    expect(ventHack?.steps[0]).toContain('12:00 PM - 2:30 PM');
  });

  it('gives houseplants low priority and includes peer-reviewed scientific caveat', () => {
    const result = generateDeterministicGuidance(baseContext);
    const plantHack = result.iaqHacks.find(h => h.title.includes('Houseplants'));

    expect(plantHack).toBeDefined();
    expect(plantHack?.priority).toBe('low');
    expect(plantHack?.steps[0]).toContain('CANNOT filter particulate matter');
    expect(plantHack?.steps[0]).toContain('HEPA');
  });

  it('credits existing low-emission baseline for public transit and WFH', () => {
    const transitResult = generateDeterministicGuidance({
      ...baseContext,
      commuteMode: 'public-transit',
      cookingFuel: 'electric',
    });

    expect(transitResult.impactMetrics.explanation).toContain('existing transit baseline');
    expect(transitResult.impactMetrics.explanation).toContain('existing zero-combustion electric');
    expect(transitResult.impactMetrics.weeklyCo2eAvoidedKg).toBeGreaterThanOrEqual(13);
  });

  it('adjusts daily routine for children vs elderly profile', () => {
    const childResult = generateDeterministicGuidance({ ...baseContext, householdProfile: 'family-young-children' });
    const elderlyResult = generateDeterministicGuidance({ ...baseContext, householdProfile: 'elderly-respiratory' });

    const childBlock = childResult.dailyRoutine.find(b => b.activity.includes('learning'));
    const elderlyBlock = elderlyResult.dailyRoutine.find(b => b.activity.includes('Medication'));

    expect(childBlock).toBeDefined();
    expect(elderlyBlock).toBeDefined();
  });

  it('calculates higher PM2.5 reduction for severe AQI', () => {
    const moderateResult = generateDeterministicGuidance({ ...baseContext, aqiTier: 'moderate' });
    const severeResult = generateDeterministicGuidance({ ...baseContext, aqiTier: 'severe' });

    expect(severeResult.impactMetrics.pm25ReductionPercent).toBeGreaterThan(
      moderateResult.impactMetrics.pm25ReductionPercent,
    );
  });

  it('includes community-level alternatives for community-coordinator profile', () => {
    const result = generateDeterministicGuidance({ ...baseContext, householdProfile: 'community-coordinator' });
    const categories = result.sustainableAlternatives.map(a => a.category);
    expect(categories).toContain('Community Action');
  });

  it('tailors recommendations for Daily Commuters facing roadside exposure', () => {
    const result = generateDeterministicGuidance({ ...baseContext, householdProfile: 'daily-commuters' });
    const commuteBlocks = result.dailyRoutine.filter(b => b.activity.toLowerCase().includes('commute'));
    expect(commuteBlocks.length).toBeGreaterThan(0);
  });

  it('maximizes carbon and particulate avoidance when shifting from solid fuel', () => {
    const solidFuelResult = generateDeterministicGuidance({ ...baseContext, cookingFuel: 'solid-fuel' });
    expect(solidFuelResult.impactMetrics.weeklyCo2eAvoidedKg).toBeGreaterThanOrEqual(14);
    const cookAlternative = solidFuelResult.sustainableAlternatives.find(a => a.category.includes('Cooking'));
    expect(cookAlternative?.current).toContain('Wood / coal');
  });

  it('provides ground-floor dust barrier advice for independent houses', () => {
    const houseResult = generateDeterministicGuidance({ ...baseContext, housingType: 'independent-house' });
    const houseHack = houseResult.iaqHacks.find(h => h.applicableTo.includes('independent-house'));
    expect(houseHack).toBeDefined();
  });

  it('provides balcony barrier advice for urban apartment dwellers', () => {
    const aptResult = generateDeterministicGuidance({ ...baseContext, housingType: 'apartment' });
    const aptHack = aptResult.iaqHacks.find(h => h.applicableTo.includes('apartment'));
    expect(aptHack).toBeDefined();
  });

  it('scales inhaled alveolar dose averted proportionally with ambient AQI level', () => {
    const poorResult = generateDeterministicGuidance({ ...baseContext, aqiTier: 'poor' });
    const severeResult = generateDeterministicGuidance({ ...baseContext, aqiTier: 'severe' });
    const severeDose = severeResult.impactMetrics.dailyInhaledDoseAvoidedUg ?? 0;
    const poorDose = poorResult.impactMetrics.dailyInhaledDoseAvoidedUg ?? 0;
    expect(severeDose).toBeGreaterThan(poorDose);
  });

  it('reflects custom user scenarios directly in generated summary', () => {
    const scenario = 'Elderly COPD patient requires oxygen concentrator air filtering';
    const result = generateDeterministicGuidance({ ...baseContext, customScenario: scenario });
    expect(result.summary).toContain(scenario);
  });

  it('guarantees weekly avoided CO2e never falls below zero', () => {
    const result = generateDeterministicGuidance({ ...baseContext, commuteMode: 'work-from-home', cookingFuel: 'electric' });
    expect(result.impactMetrics.weeklyCo2eAvoidedKg).toBeGreaterThan(0);
  });
});
