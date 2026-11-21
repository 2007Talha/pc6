import { useState, useCallback } from 'react';
import type { UserContext, ValidationErrors } from '../types/index.ts';
import { DEFAULT_USER_CONTEXT, type QuickPreset, CUSTOM_SCENARIO_MAX_LENGTH } from '../constants/index.ts';
import { sanitizeTextInput, validateUserContext, hasValidationErrors } from '../utils/validation.ts';
import { fetchLiveAqi, type LiveAirQualityData } from '../services/openMeteoService.ts';

export interface UseContextFormReturn {
  readonly formData: UserContext;
  readonly errors: ValidationErrors;
  readonly liveAqi: LiveAirQualityData | null;
  readonly isFetchingAqi: boolean;
  readonly aqiFetchMsg: { text: string; isError: boolean } | null;
  readonly updateField: <K extends keyof UserContext>(field: K, value: UserContext[K]) => void;
  readonly handleApplyPreset: (preset: QuickPreset) => void;
  readonly handleFetchLiveAqi: () => Promise<void>;
  readonly handleSubmit: (e: React.FormEvent, onSubmit: (ctx: UserContext) => void) => void;
  readonly handleReset: (onReset: () => void) => void;
}

export function useContextForm(): UseContextFormReturn {
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

  const handleSubmit = useCallback((e: React.FormEvent, onSubmit: (ctx: UserContext) => void) => {
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
  }, [formData]);

  const handleReset = useCallback((onReset: () => void) => {
    setFormData(DEFAULT_USER_CONTEXT);
    setErrors({});
    setSubmitted(false);
    setLiveAqi(null);
    setAqiFetchMsg(null);
    onReset();
  }, []);

  return {
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
  };
}
