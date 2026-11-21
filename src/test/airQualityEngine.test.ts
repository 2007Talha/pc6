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
    expect(result.summary).toContain('New Delhi');
  });

  it('adjusts daily routine for work-from-home vs commuter', () => {
    const commuterResult = generateDeterministicGuidance({
      ...baseContext,
      commuteMode: 'two-wheeler',
    });
    const wfhResult = generateDeterministicGuidance({
      ...baseContext,
      commuteMode: 'work-from-home',
    });

    const commuterCommute = commuterResult.dailyRoutine.find(b => b.time.includes('7:30'));
    const wfhCommute = wfhResult.dailyRoutine.find(b => b.time.includes('7:30'));

    expect(commuterCommute?.activity).toContain('Sealed commute');
    expect(commuterCommute?.activity).toContain('N95');
    expect(wfhCommute?.activity).toContain('home office');
  });

  it('adjusts daily routine for children vs elderly profile', () => {
    const childResult = generateDeterministicGuidance({
      ...baseContext,
      householdProfile: 'family-young-children',
    });
    const elderlyResult = generateDeterministicGuidance({
      ...baseContext,
      householdProfile: 'elderly-respiratory',
    });

    const childBlock = childResult.dailyRoutine.find(b => b.activity.includes('learning'));
    const elderlyBlock = elderlyResult.dailyRoutine.find(b => b.activity.includes('Medication'));

    expect(childBlock).toBeDefined();
    expect(elderlyBlock).toBeDefined();
  });

  it('tailors IAQ hacks to housing type', () => {
    const apartmentResult = generateDeterministicGuidance({
      ...baseContext,
      housingType: 'apartment',
    });
    const houseResult = generateDeterministicGuidance({
      ...baseContext,
      housingType: 'independent-house',
    });

    const aptTitles = apartmentResult.iaqHacks.map(h => h.title);
    const houseTitles = houseResult.iaqHacks.map(h => h.title);

    expect(aptTitles).toContain('Seal Door Gaps & Window Frames');
    expect(houseTitles).toContain('Timed Cross-Ventilation Strategy');
  });

  it('tailors IAQ hacks to cooking fuel', () => {
    const solidFuelResult = generateDeterministicGuidance({
      ...baseContext,
      cookingFuel: 'solid-fuel',
    });
    const electricResult = generateDeterministicGuidance({
      ...baseContext,
      cookingFuel: 'electric',
    });

    const solidTitles = solidFuelResult.iaqHacks.map(h => h.title);
    const electricTitles = electricResult.iaqHacks.map(h => h.title);

    expect(solidTitles).toContain('Eliminate Indoor Combustion Sources');
    expect(electricTitles).toContain('Optimize Electric Kitchen Ventilation');
  });

  it('calculates higher PM2.5 reduction for severe AQI', () => {
    const moderateResult = generateDeterministicGuidance({
      ...baseContext,
      aqiTier: 'moderate',
    });
    const severeResult = generateDeterministicGuidance({
      ...baseContext,
      aqiTier: 'severe',
    });

    expect(severeResult.impactMetrics.pm25ReductionPercent).toBeGreaterThan(
      moderateResult.impactMetrics.pm25ReductionPercent,
    );
  });

  it('calculates avoided CO2e based on commute and fuel choices', () => {
    const carSolidResult = generateDeterministicGuidance({
      ...baseContext,
      commuteMode: 'car',
      cookingFuel: 'solid-fuel',
    });
    const transitLpgResult = generateDeterministicGuidance({
      ...baseContext,
      commuteMode: 'public-transit',
      cookingFuel: 'lpg',
    });

    expect(carSolidResult.impactMetrics.weeklyCo2eAvoidedKg).toBeGreaterThan(
      transitLpgResult.impactMetrics.weeklyCo2eAvoidedKg,
    );
    expect(carSolidResult.impactMetrics.explanation).toContain('CO₂e');
  });

  it('includes community-level alternatives for community-coordinator profile', () => {
    const result = generateDeterministicGuidance({
      ...baseContext,
      householdProfile: 'community-coordinator',
    });

    const categories = result.sustainableAlternatives.map(a => a.category);
    expect(categories).toContain('Community Action');
  });
});
