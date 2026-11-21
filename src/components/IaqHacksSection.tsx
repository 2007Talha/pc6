import type { IaqHack } from '../types/index.ts';

interface IaqHacksSectionProps {
  readonly hacks: readonly IaqHack[];
}

export function IaqHacksSection({ hacks }: IaqHacksSectionProps) {
  if (hacks.length === 0) return null;

  return (
    <section className="result-section" aria-labelledby="iaq-heading">
      <h3 id="iaq-heading">🏠 Indoor Air Quality Hacks</h3>
      <p className="section-description">
        Practical steps tailored to your housing type to reduce indoor PM2.5 exposure.
      </p>
      <div className="hack-cards">
        {hacks.map((hack, i) => (
          <article key={i} className={`hack-card priority-${hack.priority}`}>
            <div className="hack-header">
              <h4>{hack.title}</h4>
              <span className="priority-badge">{hack.priority}</span>
            </div>
            <ul>
              {hack.steps.map((step, j) => (
                <li key={j}>{step}</li>
              ))}
            </ul>
            <span className="hack-applicable">
              For: {hack.applicableTo.join(', ')}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
