import type { UserContext, GenerationStatus } from '../types/index.ts';
import { CUSTOM_SCENARIO_MAX_LENGTH, QUICK_PRESETS } from '../constants/index.ts';
import { PresetsBar } from './PresetsBar.tsx';
import { LiveAqiCard } from './LiveAqiCard.tsx';
import { ContextFormFields } from './ContextFormFields.tsx';
import { useContextForm } from '../hooks/useContextForm.ts';

interface ContextFormProps {
  readonly onSubmit: (ctx: UserContext) => void;
  readonly onReset: () => void;
  readonly generationStatus: GenerationStatus;
}

export function ContextForm({ onSubmit, onReset, generationStatus }: ContextFormProps) {
  const {
    formData,
    errors,
    liveAqi,
    isFetchingAqi,
    aqiFetchMsg,
    updateField,
    handleApplyPreset,
    handleFetchLiveAqi,
    handleSubmit,
    handleReset,
  } = useContextForm();

  const isLoading = generationStatus === 'loading';

  return (
    <form onSubmit={e => handleSubmit(e, onSubmit)} onReset={() => handleReset(onReset)} className="context-form" noValidate>
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
