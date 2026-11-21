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
    const volume = calculateRoomVolumeM3(200, 9);
    expect(volume).toBe(51.0);
    expect(calculateRoomVolumeM3(0, 9)).toBe(0);
    expect(calculateRoomVolumeM3(200, -5)).toBe(0);
  });

  it('computes target CADR based on recommended ACH', () => {
    const { cadrM3h, cadrCfm } = calculateTargetCadr(50, 4);
    expect(cadrM3h).toBe(200);
    expect(cadrCfm).toBe(Math.round(200 * 0.588578));
    expect(calculateTargetCadr(0, 4)).toEqual({ cadrM3h: 0, cadrCfm: 0 });
  });

  it('estimates 95% particulate clearance duration using mass-balance decay', () => {
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
    expect(blueprint.deliveryRateCfm).toBeGreaterThan(200);
  });

  it('handles clinical 6 ACH ventilation target for high-risk respiratory patients', () => {
    const metrics = evaluateRoomCadr(250, 10, 6);
    expect(metrics.recommendedAch).toBe(6);
    expect(metrics.targetCadrCfm).toBeGreaterThan(200);
    expect(metrics.clearanceTimeMinutes).toBeLessThan(40);
  });

  it('computes correct metrics for compact urban studio apartments (100 sq ft)', () => {
    const metrics = evaluateRoomCadr(100, 8.5, 4);
    expect(metrics.roomVolumeM3).toBeCloseTo(24.1, 0.5);
    expect(metrics.diyCorsiRosenthalFit).toBe(true);
  });

  it('scales correctly for large community halls (750 sq ft)', () => {
    const metrics = evaluateRoomCadr(750, 12, 4);
    expect(metrics.roomVolumeM3).toBeGreaterThan(250);
    expect(metrics.targetCadrM3h).toBeGreaterThan(1000);
    expect(metrics.diyCorsiRosenthalFit).toBe(false);
  });

  it('handles zero or negative CADR inputs gracefully in clearance estimation', () => {
    expect(estimateClearanceMinutes(50, 0)).toBe(0);
    expect(estimateClearanceMinutes(50, -100)).toBe(0);
  });

  it('correctly marks Corsi-Rosenthal fit based on CADR thresholds', () => {
    const smallRoom = evaluateRoomCadr(120, 9, 3);
    const hugeAuditorium = evaluateRoomCadr(2500, 15, 6);
    expect(smallRoom.diyCorsiRosenthalFit).toBe(true);
    expect(hugeAuditorium.diyCorsiRosenthalFit).toBe(false);
  });
});
