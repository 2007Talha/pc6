import type { ImpactMetrics } from '../types/index.ts';

interface ImpactMetricsSectionProps {
  readonly metrics: ImpactMetrics;
}

export function ImpactMetricsSection({ metrics }: ImpactMetricsSectionProps) {
  return (
    <section className="result-section" aria-labelledby="impact-heading">
      <h3 id="impact-heading">📊 Quantified Direct Impact</h3>
      <p className="section-description">
        Transparent calculations showing the estimated environmental and health benefits of your selected choices.
      </p>
      <div className="impact-metrics">
        <div className="metric-card metric-pm25">
          <span className="metric-value">~{metrics.pm25ReductionPercent}%</span>
          <span className="metric-label">PM2.5 Exposure Reduction</span>
        </div>
        <div className="metric-card metric-co2">
          <span className="metric-value">~{metrics.weeklyCo2eAvoidedKg} kg</span>
          <span className="metric-label">Weekly CO₂e Avoided</span>
        </div>
        {metrics.dailyInhaledDoseAvoidedUg !== undefined && (
          <div className="metric-card metric-dose">
            <span className="metric-value">~{metrics.dailyInhaledDoseAvoidedUg} µg</span>
            <span className="metric-label">Inhaled Dose Avoided / Day</span>
          </div>
        )}
        <div className="metric-card metric-health">
          <span className="metric-icon" aria-hidden="true">❤️</span>
          <span className="metric-label">Health Benefit</span>
          <span className="metric-detail">{metrics.healthBenefit}</span>
        </div>
        <div className="metric-card metric-community">
          <span className="metric-icon" aria-hidden="true">🏘️</span>
          <span className="metric-label">Community Benefit</span>
          <span className="metric-detail">{metrics.communityBenefit}</span>
        </div>
      </div>
      <div className="impact-explanation">
        <h4>How we calculated this</h4>
        <p>{metrics.explanation}</p>
      </div>
    </section>
  );
}
