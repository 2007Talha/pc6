import type { UserContext } from '../types/index.ts';
import {
  AQI_TIERS,
  HOUSEHOLD_PROFILES,
  HOUSING_OPTIONS,
  COMMUTE_OPTIONS,
  COOKING_FUEL_OPTIONS,
} from '../constants/index.ts';

interface ContextFormFieldsProps {
  readonly formData: UserContext;
  readonly errors: { readonly aqiTier?: string };
  readonly disabled: boolean;
  readonly onUpdateField: <K extends keyof UserContext>(field: K, value: UserContext[K]) => void;
}

export function ContextFormFields({
  formData,
  errors,
  disabled,
  onUpdateField,
}: ContextFormFieldsProps) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="aqiTier">AQI Severity Tier *</label>
        <select
          id="aqiTier"
          value={formData.aqiTier}
          onChange={e => onUpdateField('aqiTier', e.target.value as UserContext['aqiTier'])}
          aria-required="true"
          disabled={disabled}
        >
          {AQI_TIERS.map(tier => (
            <option key={tier.id} value={tier.id}>
              {tier.label} ({tier.range})
            </option>
          ))}
        </select>
        {errors.aqiTier && <p className="form-error" role="alert">{errors.aqiTier}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="householdProfile">Household / Community Profile *</label>
        <select
          id="householdProfile"
          value={formData.householdProfile}
          onChange={e => onUpdateField('householdProfile', e.target.value as UserContext['householdProfile'])}
          aria-required="true"
          disabled={disabled}
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
          onChange={e => onUpdateField('housingType', e.target.value as UserContext['housingType'])}
          aria-required="true"
          disabled={disabled}
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
          onChange={e => onUpdateField('commuteMode', e.target.value as UserContext['commuteMode'])}
          aria-required="true"
          disabled={disabled}
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
          onChange={e => onUpdateField('cookingFuel', e.target.value as UserContext['cookingFuel'])}
          aria-required="true"
          disabled={disabled}
        >
          {COOKING_FUEL_OPTIONS.map(f => (
            <option key={f.id} value={f.id}>
              {f.icon} {f.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
