import { useState, useCallback } from 'react';
import type { UserContext, ValidationErrors, GenerationStatus } from '../types/index.ts';
import { CUSTOM_SCENARIO_MAX_LENGTH, DEFAULT_USER_CONTEXT, QUICK_PRESETS, type QuickPreset } from '../constants/index.ts';
import { sanitizeTextInput, validateUserContext, hasValidationErrors } from '../utils/validation.ts';
import { fetchLiveAqi, type LiveAirQualityData } from '../services/openMeteoService.ts';
import { PresetsBar } from './PresetsBar.tsx';
import { LiveAqiCard } from './LiveAqiCard.tsx';
import { ContextFormFields } from './ContextFormFields.tsx';

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

      <PresetsBar presets={QUICK_PRESETS} onSelectPreset={handleApplyPreset} disabled={isLoading || isFetchingAqi} />

      <div className="form-grid">
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
          {errors.location && <p className="form-error" id="location-error" role="alert">{errors.location}</p>}
          <LiveAqiCard liveAqi={liveAqi} fetchMsg={aqiFetchMsg} />
        </div>

        <ContextFormFields
          formData={formData}
          errors={errors}
          disabled={isLoading}
          onUpdateField={updateField}
        />
      </div>

      <div className="form-group form-group-full">
        <label htmlFor="customScenario">Custom Scenario / Question (optional)</label>
        <textarea
          id="customScenario"
          value={formData.customScenario}
          onChange={e => updateField('customScenario', e.target.value)}
          placeholder="e.g., My child has asthma — what extra precautions should I take during morning school commute?"
          maxLength={CUSTOM_SCENARIO_MAX_LENGTH}
          rows={3}
          disabled={isLoading}
          aria-invalid={!!errors.customScenario}
          aria-describedby={errors.customScenario ? 'scenario-counter scenario-error' : 'scenario-counter'}
        />
        <span className="char-counter" id="scenario-counter">
          {formData.customScenario.length}/{CUSTOM_SCENARIO_MAX_LENGTH}
        </span>
        {errors.customScenario && (
          <p className="form-error" id="scenario-error" role="alert">{errors.customScenario}</p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? '⏳ Analyzing & Generating…' : '🚀 Generate VayuShield Guidance'}
        </button>
        <button type="reset" className="btn-secondary" disabled={isLoading}>
          ↺ Reset Parameters
        </button>
      </div>
    </form>
  );
}
