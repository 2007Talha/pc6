import type { SustainableAlternative } from '../types/index.ts';

interface AlternativesSectionProps {
  readonly alternatives: readonly SustainableAlternative[];
}

export function AlternativesSection({ alternatives }: AlternativesSectionProps) {
  if (alternatives.length === 0) return null;

  return (
    <section className="result-section" aria-labelledby="alternatives-heading">
      <h3 id="alternatives-heading">🌱 Sustainable Alternatives</h3>
      <p className="section-description">
        Concrete low-emission swaps for your commuting, heating, and household routines.
      </p>
      <div className="alternative-cards">
        {alternatives.map((alt, i) => (
          <article key={i} className="alternative-card">
            <span className="alt-icon" aria-hidden="true">{alt.icon}</span>
            <div className="alt-content">
              <span className="alt-category">{alt.category}</span>
              <div className="alt-comparison">
                <span className="current">{alt.current}</span>
                <span className="arrow" aria-hidden="true">→</span>
                <span className="suggested">{alt.alternative}</span>
              </div>
              <span className="alt-benefit">{alt.benefit}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
