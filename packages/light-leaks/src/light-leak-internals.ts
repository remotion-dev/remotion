import {
	lightLeak,
	lightLeakEffectSchema,
	type LightLeakEffectParams,
} from '@remotion/effects/light-leak';

export {lightLeakEffectSchema, type LightLeakEffectParams};

/**
 * Experimental internals for the light leak canvas effect pipeline.
 *
 * Prefer importing `lightLeak()` from `@remotion/effects/light-leak`.
 */
export const LightLeakInternals = {
	lightLeak,
} as const;
