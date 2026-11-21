import type { AqiTier } from '../types/index.ts';

export interface LiveAirQualityData {
  readonly city: string;
  readonly country?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly pm25: number;
  readonly pm10: number;
  readonly usAqi: number;
  readonly aqiTier: AqiTier;
  readonly timestamp: string;
}

interface GeocodingResult {
  readonly id?: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country?: string;
}

interface GeocodingResponse {
  readonly results?: readonly GeocodingResult[];
}

interface OpenMeteoAqiResponse {
  readonly current?: {
    readonly pm2_5?: number;
    readonly pm10?: number;
    readonly us_aqi?: number;
  };
}

/** Map US AQI reading to VayuShield AqiTier */
export function mapUsAqiToTier(aqi: number): AqiTier {
  if (aqi > 400) return 'severe';
  if (aqi > 300) return 'very-poor';
  if (aqi > 200) return 'poor';
  return 'moderate';
}

/** Fetch geocoding coordinates for a city using Open-Meteo (Keyless & Free) */
export async function geocodeCity(city: string): Promise<GeocodingResult | null> {
  const cleanCity = city.trim();
  if (!cleanCity) return null;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cleanCity,
  )}&count=1&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed with status: ${res.status}`);

  const data: GeocodingResponse = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const first = data.results[0];
  if (!first) return null;
  return first;
}

/** Fetch live PM2.5, PM10, and US AQI from Open-Meteo Air Quality API */
export async function fetchLiveAqi(
  city: string,
): Promise<LiveAirQualityData | null> {
  const geo = await geocodeCity(city);
  if (!geo) return null;

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${geo.latitude}&longitude=${geo.longitude}&current=pm10,pm2_5,us_aqi`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Air quality lookup failed: ${res.status}`);

  const data: OpenMeteoAqiResponse = await res.json();
  const current = data.current;
  if (!current) throw new Error('No current air quality data returned');

  const pm25 = Math.round(current.pm2_5 ?? 0);
  const pm10 = Math.round(current.pm10 ?? 0);
  const usAqi = Math.round(current.us_aqi ?? 0);
  const aqiTier = mapUsAqiToTier(usAqi);

  return {
    city: geo.name,
    country: geo.country,
    latitude: geo.latitude,
    longitude: geo.longitude,
    pm25,
    pm10,
    usAqi,
    aqiTier,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
