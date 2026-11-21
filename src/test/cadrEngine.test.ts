import { describe, it, expect } from 'vitest';
import {
  calculateRoomVolumeM3,
  calculateTargetCadr,
  estimateClearanceMinutes,
  evaluateRoomCadr,
  getCorsiRosenthalBlueprint,
} from '../services/cadrEngine.ts';

describe('cadrEngine', () => {
  it('calculates room volume in cubic meters correctly', () => {
    // 200 sq ft with 9 ft ceiling = 1800 cu ft ~ 51.0 m³
    const volume = calculateRoomVolumeM3(200, 9);
    expect(volume).toBe(51.0);

    // Handles zero or negative dimensions safely
    expect(calculateRoomVolumeM3(0, 9)).toBe(0);
    expect(calculateRoomVolumeM3(200, -5)).toBe(0);
  });

  it('computes target CADR based on recommended ACH', () => {
    // 50 m³ room with 4 ACH = 200 m³/h
    const { cadrM3h, cadrCfm } = calculateTargetCadr(50, 4);
    expect(cadrM3h).toBe(200);
    expect(cadrCfm).toBe(Math.round(200 * 0.588578));

    // Zero volume edge case
    expect(calculateTargetCadr(0, 4)).toEqual({ cadrM3h: 0, cadrCfm: 0 });
  });

  it('estimates 95% particulate clearance duration using mass-balance decay', () => {
    // 50 m³ room with 200 m³/h CADR: (3.0 * 50 / 200) * 60 = 45 min
    const minutes = estimateClearanceMinutes(50, 200);
    expect(minutes).toBe(45);

    expect(estimateClearanceMinutes(0, 200)).toBe(0);
  });

  it('evaluates comprehensive room CADR metrics', () => {
    const metrics = evaluateRoomCadr(180, 9, 4);
    expect(metrics.roomVolumeM3).toBeGreaterThan(40);
    expect(metrics.targetCadrM3h).toBeGreaterThan(150);
    expect(metrics.clearanceTimeMinutes).toBeGreaterThan(0);
    expect(metrics.diyCorsiRosenthalFit).toBe(true);
  });

  it('returns valid Corsi-Rosenthal DIY blueprint specifications', () => {
    const blueprint = getCorsiRosenthalBlueprint();
    expect(blueprint.name).toContain('Corsi-Rosenthal');
    expect(blueprint.costUsd).toBeLessThan(100);
    expect(blueprint.deliveryRateM3h).toBeGreaterThanOrEqual(500);
    expect(blueprint.assemblyInstructions.length).toBe(4);
  });
});
