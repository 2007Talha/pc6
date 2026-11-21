import type { LiveAirQualityData } from '../services/openMeteoService.ts';

interface LiveAqiCardProps {
  readonly liveAqi: LiveAirQualityData | null;
  readonly fetchMsg: { text: string; isError: boolean } | null;
}

export function LiveAqiCard({ liveAqi, fetchMsg }: LiveAqiCardProps) {
  return (
    <>
      {fetchMsg && (
        <p className={`fetch-status-msg ${fetchMsg.isError ? 'error' : 'success'}`} role="status">
          {fetchMsg.text}
        </p>
      )}
      {liveAqi && (
        <aside className="live-aqi-card" aria-label="Live Open-Meteo Air Quality">
          <span className="live-badge-pill">● LIVE OPEN-METEO MONITORING</span>
          <div className="live-data-row">
            <span><strong>US AQI:</strong> {liveAqi.usAqi} ({liveAqi.aqiCategory})</span>
            <span><strong>PM2.5:</strong> {liveAqi.pm25} µg/m³ ({liveAqi.indianNaqiCategory} NAQI)</span>
            <span><strong>PM10:</strong> {liveAqi.pm10} µg/m³</span>
          </div>
        </aside>
      )}
    </>
  );
}
