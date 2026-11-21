import type { TimeBlock } from '../types/index.ts';

interface DailyRoutineSectionProps {
  readonly blocks: readonly TimeBlock[];
}

export function DailyRoutineSection({ blocks }: DailyRoutineSectionProps) {
  if (blocks.length === 0) return null;

  return (
    <section className="result-section" aria-labelledby="routine-heading">
      <h3 id="routine-heading">🕐 Low-Emission Daily Routine</h3>
      <p className="section-description">
        Time-blocked winter schedule accounting for cold-air inversions, morning/evening smog peaks, and safe ventilation windows.
      </p>
      <div className="time-blocks">
        {blocks.map((block, i) => (
          <article key={i} className="time-block">
            <span className="time-icon" aria-hidden="true">{block.icon}</span>
            <div className="time-content">
              <span className="time">{block.time}</span>
              <strong className="activity">{block.activity}</strong>
              <span className="reason">{block.reason}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
