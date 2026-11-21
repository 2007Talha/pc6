import { useState, useId } from 'react';
import type { CommunityPledge, CommunityImpactSummary } from '../types/index.ts';

const DEFAULT_PLEDGES: readonly CommunityPledge[] = [
  {
    id: 'pledge-leaf-burning',
    title: 'Zero Open Leaf & Waste Burning',
    description: 'Establish shared colony composting pits and enforce municipal reporting for smoldering biomass.',
    co2eSavedKgPerWeek: 45,
    pm25AvertedGramsPerWeek: 180,
    icon: '🍂',
    active: true,
  },
  {
    id: 'pledge-carpool-pods',
    title: 'Neighborhood Transit & Carpool Pods',
    description: 'Coordinate shared EV/CNG carpool rides and consolidated weekly delivery batches.',
    co2eSavedKgPerWeek: 60,
    pm25AvertedGramsPerWeek: 45,
    icon: '🚗',
    active: true,
  },
  {
    id: 'pledge-clean-air-shelter',
    title: 'RWA Clean-Air Respite Room',
    description: 'Equip the community clubhouse with a dual Corsi-Rosenthal unit as an emergency clean-air haven.',
    co2eSavedKgPerWeek: 15,
    pm25AvertedGramsPerWeek: 90,
    icon: '🏢',
    active: false,
  },
  {
    id: 'pledge-senior-checks',
    title: 'Vulnerable Neighbor Smog Network',
    description: 'Door-to-door morning checks for respiratory medication access during AQI 400+ episodes.',
    co2eSavedKgPerWeek: 10,
    pm25AvertedGramsPerWeek: 25,
    icon: '❤️',
    active: true,
  },
];

export function CommunityPledgesSection() {
  const [pledges, setPledges] = useState<readonly CommunityPledge[]>(DEFAULT_PLEDGES);
  const statusId = useId();

  const togglePledge = (id: string) => {
    setPledges(prev => prev.map(p => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const summary: CommunityImpactSummary = pledges.reduce(
    (acc, p) => {
      if (!p.active) return acc;
      return {
        activePledgesCount: acc.activePledgesCount + 1,
        weeklyCo2eAvoidedKg: acc.weeklyCo2eAvoidedKg + p.co2eSavedKgPerWeek,
        weeklyPm25AvertedGrams: acc.weeklyPm25AvertedGrams + p.pm25AvertedGramsPerWeek,
        householdsProtected: acc.householdsProtected + 15,
      };
    },
    { activePledgesCount: 0, weeklyCo2eAvoidedKg: 0, weeklyPm25AvertedGrams: 0, householdsProtected: 0 },
  );

  return (
    <section className="community-pledges-card" aria-labelledby="community-heading">
      <div className="community-header">
        <h3 id="community-heading">🏘️ Collective Community Action & Smog Defense Hub</h3>
        <span className="community-badge">{summary.activePledgesCount} Active Pledges</span>
      </div>
      <p className="community-intro">
        Individual protection shields one home; collective community action clears the neighborhood airshed.
        Toggle community-wide initiatives below to calculate your collective impact.
      </p>

      {/* Dynamic Impact Counters */}
      <div className="pledge-summary-row" role="region" aria-label="Community impact metrics">
        <div className="pledge-summary-stat">
          <span className="stat-num">{summary.weeklyCo2eAvoidedKg} kg</span>
          <span className="stat-sub">Weekly CO₂e Averted</span>
        </div>
        <div className="pledge-summary-stat">
          <span className="stat-num">{summary.weeklyPm25AvertedGrams} g</span>
          <span className="stat-sub">Ground PM2.5 Prevented</span>
        </div>
        <div className="pledge-summary-stat">
          <span className="stat-num">{summary.householdsProtected}+</span>
          <span className="stat-sub">Families Shielded</span>
        </div>
      </div>

      {/* Interactive Pledge List */}
      <div className="pledge-grid" role="list">
        {pledges.map(p => (
          <div
            key={p.id}
            role="listitem"
            className={`pledge-item ${p.active ? 'pledge-active' : ''}`}
          >
            <div className="pledge-top">
              <span className="pledge-icon" aria-hidden="true">{p.icon}</span>
              <strong className="pledge-title">{p.title}</strong>
              <button
                type="button"
                className={`btn-pledge-toggle ${p.active ? 'btn-active' : ''}`}
                onClick={() => togglePledge(p.id)}
                aria-pressed={p.active}
                aria-label={`Toggle pledge: ${p.title}`}
              >
                {p.active ? '✓ Enacted' : '+ Join Pledge'}
              </button>
            </div>
            <p className="pledge-desc">{p.description}</p>
            <div className="pledge-metrics">
              <span>🌱 ~{p.co2eSavedKgPerWeek} kg CO₂e/wk</span>
              <span>💨 ~{p.pm25AvertedGramsPerWeek} g PM2.5/wk</span>
            </div>
          </div>
        ))}
      </div>

      <div id={statusId} className="sr-only" aria-live="polite">
        Current community impact: {summary.activePledgesCount} active initiatives averting {summary.weeklyCo2eAvoidedKg} kg of CO2e and {summary.weeklyPm25AvertedGrams} grams of PM2.5 weekly across {summary.householdsProtected} households.
      </div>
    </section>
  );
}
