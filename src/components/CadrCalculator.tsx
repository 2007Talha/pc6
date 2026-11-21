import { useState, useId } from 'react';
import { evaluateRoomCadr, getCorsiRosenthalBlueprint } from '../services/cadrEngine.ts';

export function CadrCalculator() {
  const [areaSqFt, setAreaSqFt] = useState<number>(180);
  const [ceilingHeightFt, setCeilingHeightFt] = useState<number>(9);
  const [targetAch, setTargetAch] = useState<number>(4);

  const areaId = useId();
  const heightId = useId();
  const achId = useId();

  const metrics = evaluateRoomCadr(areaSqFt, ceilingHeightFt, targetAch);
  const blueprint = getCorsiRosenthalBlueprint();

  return (
    <section className="cadr-calculator-card" aria-labelledby="cadr-heading">
      <div className="cadr-header">
        <h4 id="cadr-heading">💨 Room CADR & DIY Air Cleaner Sizer</h4>
        <span className="badge-pill">CDC / EPA 4 ACH Standard</span>
      </div>
      <p className="cadr-intro">
        Calculate your room volume and target Clean Air Delivery Rate (CADR) to eliminate airborne particulates rapidly.
      </p>

      <div className="cadr-inputs-grid">
        <div className="cadr-input-group">
          <label htmlFor={areaId}>Floor Area (sq ft)</label>
          <input
            id={areaId}
            type="number"
            min={50}
            max={1500}
            step={10}
            value={areaSqFt}
            onChange={e => setAreaSqFt(Math.max(10, Number(e.target.value)))}
          />
        </div>
        <div className="cadr-input-group">
          <label htmlFor={heightId}>Ceiling Height (ft)</label>
          <input
            id={heightId}
            type="number"
            min={7}
            max={20}
            step={0.5}
            value={ceilingHeightFt}
            onChange={e => setCeilingHeightFt(Math.max(5, Number(e.target.value)))}
          />
        </div>
        <div className="cadr-input-group">
          <label htmlFor={achId}>Target ACH (Air Changes/hr)</label>
          <select
            id={achId}
            value={targetAch}
            onChange={e => setTargetAch(Number(e.target.value))}
          >
            <option value={3}>3 ACH (Standard Clean)</option>
            <option value={4}>4 ACH (Winter Smog Resilient)</option>
            <option value={6}>6 ACH (High-Risk Respiratory / Clinical)</option>
          </select>
        </div>
      </div>

      <div className="cadr-results-grid">
        <div className="cadr-stat">
          <span className="cadr-stat-label">Room Volume</span>
          <span className="cadr-stat-val">{metrics.roomVolumeM3} m³</span>
        </div>
        <div className="cadr-stat">
          <span className="cadr-stat-label">Target CADR</span>
          <span className="cadr-stat-val">{metrics.targetCadrM3h} m³/h ({metrics.targetCadrCfm} CFM)</span>
        </div>
        <div className="cadr-stat">
          <span className="cadr-stat-label">95% Particle Clearance</span>
          <span className="cadr-stat-val">~{metrics.clearanceTimeMinutes} minutes</span>
        </div>
      </div>

      <div className="corsi-blueprint-box">
        <div className="corsi-title-row">
          <strong>🛠️ {blueprint.name}</strong>
          <span className="corsi-badge">${blueprint.costUsd} DIY vs $400+ Commercial</span>
        </div>
        <p className="corsi-stats">
          Delivers <strong>{blueprint.deliveryRateM3h} m³/h</strong> ({blueprint.deliveryRateCfm} CFM) via {blueprint.filters} + {blueprint.fanType}.
          {metrics.diyCorsiRosenthalFit ? ' Perfectly covers this room size!' : ' Multiple units recommended for this area.'}
        </p>
      </div>

      {/* Screen Reader Twin for Assistive Devices (WCAG SC 1.1.1) */}
      <div className="sr-only" aria-live="polite">
        CADR calculation for {areaSqFt} square feet room with {ceilingHeightFt} feet ceiling: Room volume is {metrics.roomVolumeM3} cubic meters. Required CADR is {metrics.targetCadrM3h} cubic meters per hour for {targetAch} air changes per hour. Estimated 95% particulate clearance time is {metrics.clearanceTimeMinutes} minutes.
      </div>
    </section>
  );
}
