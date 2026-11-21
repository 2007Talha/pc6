import { useState, useCallback } from 'react';
import type { UserContext, ValidationErrors, GenerationStatus } from '../types/index.ts';
import {
  AQI_TIERS,
  HOUSEHOLD_PROFILES,
  HOUSING_OPTIONS,
  COMMUTE_OPTIONS,
  COOKING_FUEL_OPTIONS,
  CUSTOM_SCENARIO_MAX_LENGTH,
  DEFAULT_USER_CONTEXT,
  QUICK_PRESETS,
  type QuickPreset,
} from '../constants/index.ts';
import {
  sanitizeTextInput,
  validateUserContext,
  hasValidationErrors,
} from '../utils/validation.ts';
import { fetchLiveAqi, type LiveAirQualityData } from '../services/openMeteoService.ts';

interface ContextFormProps {
  readonly onSubmit: (ctx: UserContext) => void;
  readonly onReset: () => void;
  readonly generationStatus: GenerationStatus;
}

export function ContextForm({ onSubmit, onReset, generationStatus }: ContextFormProps) {
  const [formData, setFormData] = useState<UserContext>(DEFAULT_USER_CONTEXT);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [liveAqi, setLiveAqi] = useState<LiveAirQualityData | null>(null);
  const [isFetchingAqi, setIsFetchingAqi] = useState(false);
  const [aqiFetchMsg, setAqiFetchMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const updateField = useCallback(<K extends keyof UserContext>(
    field: K,
    value: UserContext[K],
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitted) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [submitted]);

  const handleApplyPreset = useCallback((preset: QuickPreset) => {
    setFormData(preset.context);
    setErrors({});
    setSubmitted(false);
    setLiveAqi(null);
    setAqiFetchMsg({
      text: `Loaded "${preset.label}" scenario preset. Click Generate or customize parameters.`,
      isError: false,
    });
  }, []);

  const handleFetchLiveAqi = useCallback(async () => {
    const city = formData.location.trim();
    if (!city) {
      setAqiFetchMsg({ text: 'Enter a city name first (e.g., Delhi, Lahore, Tokyo).', isError: true });
      return;
    }

    setIsFetchingAqi(true);
    setAqiFetchMsg(null);

    try {
      const data = await fetchLiveAqi(city);
      if (!data) {
        setAqiFetchMsg({ text: `Could not find live data for "${city}". Please verify the name.`, isError: true });
      } else {
        setLiveAqi(data);
        setFormData(prev => ({
          ...prev,
          location: data.country ? `${data.city}, ${data.country}` : data.city,
          aqiTier: data.aqiTier,
        }));
        setAqiFetchMsg({
          text: `Fetched live air quality for ${data.city}! Matched tier: ${data.aqiTier.toUpperCase()}`,
          isError: false,
        });
      }
    } catch {
      setAqiFetchMsg({ text: 'Network error fetching live AQI. You can select tier manually.', isError: true });
    } finally {
      setIsFetchingAqi(false);
    }
  }, [formData.location]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const sanitized: UserContext = {
      ...formData,
      location: sanitizeTextInput(formData.location, 100),
      customScenario: sanitizeTextInput(formData.customScenario, CUSTOM_SCENARIO_MAX_LENGTH),
    };

    const validationErrors = validateUserContext(sanitized);
    setErrors(validationErrors);

    if (!hasValidationErrors(validationErrors)) {
      onSubmit(sanitized);
    }
  }, [formData, onSubmit]);

  const handleReset = useCallback(() => {
    setFormData(DEFAULT_USER_CONTEXT);
    setErrors({});
    setSubmitted(false);
    setLiveAqi(null);
    setAqiFetchMsg(null);
    onReset();
  }, [onReset]);

  const isLoading = generationStatus === 'loading';

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className="context-form" noValidate>
      <div className="form-title-row">
        <h2>Your Air Quality Context</h2>
        <span className="form-subtitle">Customize parameters or load a quick scenario</span>
      </div>

      {/* 1-Click Test Scenarios */}
      <div className="presets-container" role="region" aria-label="Quick test scenario presets">
        <span className="presets-label">⚡ 1-Click Test Presets:</span>
        <div className="presets-buttons">
          {QUICK_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              className="btn-preset"
              onClick={() => handleApplyPreset(preset)}
              disabled={isLoading || isFetchingAqi}
              title={`Load preset: ${preset.label}`}
            >
              <span aria-hidden="true">{preset.icon}</span> {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-grid">
        {/* Location with Live AQI Lookup */}
        <div className="form-group form-group-location">
          <label htmlFor="location">Location / City *</label>
          <div className="location-input-group">
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={e => updateField('location', e.target.value)}
              placeholder="e.g., New Delhi, Lahore, London"
              maxLength={100}
              required
              aria-required="true"
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? 'location-error' : undefined}
              disabled={isLoading || isFetchingAqi}
            />
            <button
              type="button"
              className="btn-fetch-aqi"
              onClick={handleFetchLiveAqi}
              disabled={isLoading || isFetchingAqi}
              aria-label="Fetch real-time air quality from Open-Meteo"
              title="Fetch live PM2.5 & PM10 from Open-Meteo"
            >
              {isFetchingAqi ? '⏳ Fetching…' : '📡 Live AQI'}
            </button>
          </div>
          {errors.location && (
            <p className="form-error" id="location-error" role="alert">{errors.location}</p>
          )}
          {aqiFetchMsg && (
            <p className={`fetch-status-msg ${aqiFetchMsg.isError ? 'error' : 'success'}`} role="status">
              {aqiFetchMsg.text}
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
        </div>

        {/* AQI Tier */}
        <div className="form-group">
          <label htmlFor="aqiTier">AQI Severity Tier *</label>
          <select
            id="aqiTier"
            value={formData.aqiTier}
            onChange={e => updateField('aqiTier', e.target.value as UserContext['aqiTier'])}
            aria-required="true"
            disabled={isLoading}
          >
            {AQI_TIERS.map(tier => (
              <option key={tier.id} value={tier.id}>
                {tier.label} ({tier.range})
              </option>
            ))}
          </select>
          {errors.aqiTier && (
            <p className="form-error" role="alert">{errors.aqiTier}</p>
          )}
        </div>

        {/* Household Profile */}
        <div className="form-group">
          <label htmlFor="householdProfile">Household / Community Profile *</label>
          <select
            id="householdProfile"
            value={formData.householdProfile}
            onChange={e => updateField('householdProfile', e.target.value as UserContext['householdProfile'])}
            aria-required="true"
            disabled={isLoading}
          >
            {HOUSEHOLD_PROFILES.map(p => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Housing Type */}
        <div className="form-group">
          <label htmlFor="housingType">Housing Type *</label>
          <select
            id="housingType"
            value={formData.housingType}
            onChange={e => updateField('housingType', e.target.value as UserContext['housingType'])}
            aria-required="true"
            disabled={isLoading}
          >
            {HOUSING_OPTIONS.map(h => (
              <option key={h.id} value={h.id}>
                {h.icon} {h.label}
              </option>
            ))}
          </select>
        </div>

        {/* Commute Mode */}
        <div className="form-group">
          <label htmlFor="commuteMode">Commute Mode *</label>
          <select
            id="commuteMode"
            value={formData.commuteMode}
            onChange={e => updateField('commuteMode', e.target.value as UserContext['commuteMode'])}
            aria-required="true"
            disabled={isLoading}
          >
            {COMMUTE_OPTIONS.map(c => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cooking Fuel */}
        <div className="form-group">
          <label htmlFor="cookingFuel">Cooking / Heating Fuel *</label>
          <select
            id="cookingFuel"
            value={formData.cookingFuel}
            onChange={e => updateField('cookingFuel', e.target.value as UserContext['cookingFuel'])}
            aria-required="true"
            disabled={isLoading}
          >
            {COOKING_FUEL_OPTIONS.map(f => (
              <option key={f.id} value={f.id}>
                {f.icon} {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Scenario */}
      <div className="form-group form-group-full">
        <label htmlFor="customScenario">
          Custom Scenario / Question (optional)
        </label>
        <textarea
          id="customScenario"
          value={formData.customScenario}
          onChange={e => updateField('customScenario', e.target.value)}
          placeholder="e.g., My child has asthma — what extra precautions should I take during morning school commute?"
          maxLength={CUSTOM_SCENARIO_MAX_LENGTH}
          rows={3}
          disabled={isLoading}
          aria-describedby="scenario-counter scenario-error"
        />
        <span className="char-counter" id="scenario-counter">
          {formData.customScenario.length}/{CUSTOM_SCENARIO_MAX_LENGTH}
        </span>
        {errors.customScenario && (
          <p className="form-error" id="scenario-error" role="alert">{errors.customScenario}</p>
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Generating Guidance…' : '🛡️ Generate VayuShield Guidance'}
        </button>
        <button
          type="reset"
          className="btn-secondary"
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
