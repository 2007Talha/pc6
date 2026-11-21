export interface CadrMetrics {
  readonly roomVolumeM3: number;
  readonly targetCadrM3h: number;
  readonly targetCadrCfm: number;
  readonly clearanceTimeMinutes: number;
  readonly recommendedAch: number;
  readonly diyCorsiRosenthalFit: boolean;
}

export interface CorsiRosenthalBlueprint {
  readonly name: string;
  readonly costUsd: number;
  readonly deliveryRateM3h: number;
  readonly deliveryRateCfm: number;
  readonly filters: string;
  readonly fanType: string;
  readonly estimatedLifespanMonths: number;
  readonly assemblyInstructions: readonly string[];
}

/** Convert square feet floor area and ceiling height to cubic meters */
export function calculateRoomVolumeM3(areaSqFt: number, ceilingHeightFt = 9): number {
  if (areaSqFt <= 0 || ceilingHeightFt <= 0) return 0;
  const volumeCuFt = areaSqFt * ceilingHeightFt;
  return Math.round(volumeCuFt * 0.0283168 * 10) / 10;
}

/** Compute required Clean Air Delivery Rate (CADR) for target Air Changes per Hour (ACH) */
export function calculateTargetCadr(volumeM3: number, targetAch = 4): { cadrM3h: number; cadrCfm: number } {
  if (volumeM3 <= 0 || targetAch <= 0) return { cadrM3h: 0, cadrCfm: 0 };
  const cadrM3h = Math.round(volumeM3 * targetAch);
  const cadrCfm = Math.round(cadrM3h * 0.588578);
  return { cadrM3h, cadrCfm };
}

/** Estimate minutes required to achieve 95% particulate clearance using first-order decay */
export function estimateClearanceMinutes(volumeM3: number, cadrM3h: number): number {
  if (volumeM3 <= 0 || cadrM3h <= 0) return 0;
  // First-order mass balance: -ln(0.05) ~ 2.996
  const hours = (2.996 * volumeM3) / cadrM3h;
  return Math.round(hours * 60);
}

/** Compute full CADR room sizing metrics */
export function evaluateRoomCadr(areaSqFt: number, ceilingHeightFt = 9, targetAch = 4): CadrMetrics {
  const roomVolumeM3 = calculateRoomVolumeM3(areaSqFt, ceilingHeightFt);
  const { cadrM3h, cadrCfm } = calculateTargetCadr(roomVolumeM3, targetAch);
  const clearanceTimeMinutes = estimateClearanceMinutes(roomVolumeM3, cadrM3h);

  return {
    roomVolumeM3,
    targetCadrM3h: cadrM3h,
    targetCadrCfm: cadrCfm,
    clearanceTimeMinutes,
    recommendedAch: targetAch,
    diyCorsiRosenthalFit: cadrM3h <= 550,
  };
}

/** Official specifications for open-source DIY Corsi-Rosenthal Box */
export function getCorsiRosenthalBlueprint(): CorsiRosenthalBlueprint {
  return {
    name: 'Corsi-Rosenthal Box (DIY High-CADR Air Cleaner)',
    costUsd: 45,
    deliveryRateM3h: 550,
    deliveryRateCfm: 325,
    filters: '4× MERV-13 pleated HVAC filters (20" × 20" × 2")',
    fanType: '20" box fan (3-speed forward flow)',
    estimatedLifespanMonths: 6,
    assemblyInstructions: [
      'Form an open-top cube using the 4 MERV-13 filters, arrows pointing inward towards center.',
      'Tape all side vertical seams and bottom cardboard floor securely with duct tape.',
      'Place the 20" box fan on top, blowing upward to create negative interior pressure.',
      'Attach a cardboard circular shroud (15" aperture) to the fan exhaust face to boost laminar CADR by 25%.',
    ],
  };
}
