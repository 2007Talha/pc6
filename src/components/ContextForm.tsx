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
} from '../constants/index.ts';
import {
  sanitizeTextInput,
  validateUserContext,
  hasValidationErrors,
} from '../utils/validation.ts';

interface ContextFormProps {
  readonly onSubmit: (ctx: UserContext) => void;
  readonly onReset: () => void;
  readonly generationStatus: GenerationStatus;
}

export function ContextForm({ onSubmit, onReset, generationStatus }: ContextFormProps) {
  const [formData, setFormData] = useState<UserContext>(DEFAULT_USER_CONTEXT);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

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
    onReset();
  }, [onReset]);

  const isLoading = generationStatus === 'loading';

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className="context-form" noValidate>
      <h2>Your Air Quality Context</h2>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="location">Location / City *</label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={e => updateField('location', e.target.value)}
            placeholder="e.g., New Delhi, Lahore, Beijing"
            maxLength={100}
            required
            aria-required="true"
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? 'location-error' : undefined}
            disabled={isLoading}
          />
          {errors.location && (
            <p className="form-error" id="location-error" role="alert">{errors.location}</p>
          )}
        </div>

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

      <div className="form-group form-group-full">
        <label htmlFor="customScenario">
          Custom Scenario / Question (optional)
        </label>
        <textarea
          id="customScenario"
          value={formData.customScenario}
          onChange={e => updateField('customScenario', e.target.value)}
          placeholder="e.g., My child has asthma — what extra precautions during morning school commute?"
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
