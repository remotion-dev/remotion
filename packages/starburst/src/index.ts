import {starburst} from './starburst-effect';

export {Starburst} from './Starburst';
export type {StarburstProps} from './Starburst';
export {
	starburst,
	starburstEffectSchema,
	type StarburstEffectParams,
	type StarburstOrigin,
} from './starburst-effect';

export const StarburstInternals = {
	starburst,
} as const;
