export function InversionCurve() {
  // 24-hour diurnal profile data points (Hour, Normalized Pollution Index 0-100, Label)
  const diurnalPoints = [
    { hour: '00:00', val: 78, note: 'Trapped nocturnal surface layer' },
    { hour: '04:00', val: 86, note: 'Pre-dawn thermal stagnation' },
    { hour: '07:30', val: 98, note: 'Peak cold-air morning inversion + rush traffic' },
    { hour: '10:30', val: 70, note: 'Early solar heating begins mixing layer' },
    { hour: '13:30', val: 32, note: 'Solar UV thermals break inversion (SAFEST VENTILATION)' },
    { hour: '16:00', val: 45, note: 'Afternoon solar radiation wanes' },
    { hour: '18:30', val: 92, note: 'Evening boundary cap re-descends + commute' },
    { hour: '22:00', val: 84, note: 'Cold surface air seals ground emissions' },
  ];

  return (
    <div className="inversion-curve-card" aria-labelledby="inversion-heading">
      <div className="inversion-header">
        <h4 id="inversion-heading">📈 Diurnal Smog Inversion Profile & Ventilation Windows</h4>
        <span className="inversion-badge">Boundary Layer Physics</span>
      </div>
      <p className="inversion-desc">
        Ground-level particulate spikes during cold dawn and dusk inversions, then drops to daily minimums when solar thermals mix the lower atmosphere.
      </p>

      {/* Native SVG Visualization (Zero Charting Library Bloat) */}
      <div className="svg-chart-container" aria-hidden="true">
        <svg viewBox="0 0 640 180" className="inversion-svg" role="img">
          <defs>
            <linearGradient id="smogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#dc2626" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Safe Ventilation Window Shading (12:00 PM - 2:30 PM) */}
          <rect x="290" y="20" width="110" height="135" fill="rgba(16, 185, 129, 0.12)" rx="6" />
          <text x="345" y="38" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="600">
            ☀️ Safest Window
          </text>

          {/* Smog Curve Path */}
          <path
            d="M 40 60 C 90 40, 140 25, 200 24 C 250 24, 280 85, 345 130 C 400 135, 430 70, 480 32 C 530 24, 570 45, 600 55 L 600 155 L 40 155 Z"
            fill="url(#smogGrad)"
          />
          <path
            d="M 40 60 C 90 40, 140 25, 200 24 C 250 24, 280 85, 345 130 C 400 135, 430 70, 480 32 C 530 24, 570 45, 600 55"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Time & Key Indicators */}
          <circle cx="200" cy="24" r="5" fill="#dc2626" />
          <text x="200" y="15" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="600">Morning Peak</text>

          <circle cx="345" cy="130" r="5" fill="#10b981" />
          <text x="345" y="148" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="600">Daily Low</text>

          <circle cx="480" cy="32" r="5" fill="#ea580c" />
          <text x="480" y="22" textAnchor="middle" fill="#ea580c" fontSize="10" fontWeight="600">Evening Re-inversion</text>

          {/* X Axis Time Labels */}
          <line x1="40" y1="155" x2="600" y2="155" stroke="currentColor" strokeOpacity="0.2" />
          <text x="40" y="172" fontSize="10" fill="currentColor" opacity="0.7">00:00</text>
          <text x="200" y="172" fontSize="10" fill="currentColor" opacity="0.7">07:30 AM</text>
          <text x="345" y="172" fontSize="10" fill="currentColor" opacity="0.7">1:00 PM</text>
          <text x="480" y="172" fontSize="10" fill="currentColor" opacity="0.7">6:30 PM</text>
          <text x="600" y="172" fontSize="10" fill="currentColor" opacity="0.7">23:59</text>
        </svg>
      </div>

      {/* Screen Reader Twin Table (WCAG SC 1.1.1 Non-Text Content) */}
      <table className="sr-only">
        <caption>Diurnal atmospheric boundary layer particulate concentration by hour</caption>
        <thead>
          <tr>
            <th scope="col">Time of Day</th>
            <th scope="col">Relative Hazard Level</th>
            <th scope="col">Atmospheric Mechanism</th>
          </tr>
        </thead>
        <tbody>
          {diurnalPoints.map(p => (
            <tr key={p.hour}>
              <td>{p.hour}</td>
              <td>{p.val}% of daily maximum</td>
              <td>{p.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
