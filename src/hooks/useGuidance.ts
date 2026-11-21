import { useState, useCallback } from 'react';
import type { UserContext, GenerationState } from '../types/index.ts';
import { generateGuidance } from '../services/geminiService.ts';

const INITIAL_STATE: GenerationState = {
  status: 'idle',
  result: null,
  error: null,
  source: null,
};

export function useGuidance() {
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);

  const generate = useCallback(async (ctx: UserContext) => {
    setState({ status: 'loading', result: null, error: null, source: null });
    try {
      const result = await generateGuidance(ctx);
      setState(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({ status: 'error', result: null, error: message, source: null });
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, generate, reset };
}
