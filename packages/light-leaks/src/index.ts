import {lightLeak} from './light-leak-internals';

export {LightLeak} from './LightLeak';
export type {LightLeakProps} from './LightLeak';
export {lightLeak, lightLeakEffectSchema} from './light-leak-internals';
export type {LightLeakEffectParams} from './light-leak-internals';

/**
 * Experimental internals for the light leak canvas effect pipeline.
 */
export const LightLeakInternals = {
	lightLeak,
} as const;
