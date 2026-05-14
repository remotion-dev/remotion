import {starburst} from './starburst-effect';

export {Starburst} from './Starburst';
export type {StarburstProps} from './Starburst';
export {
	starburstEffectSchema,
	type StarburstEffectParams,
} from './starburst-effect';

export const StarburstInternals = {
	starburst,
} as const;
