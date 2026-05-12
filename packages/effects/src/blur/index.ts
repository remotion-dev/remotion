import type {EffectDescriptor} from 'remotion';
import {blurHorizontal} from './blur-horizontal.js';
import {blurVertical} from './blur-vertical.js';

export type BlurParams = {
	readonly radius: number;
};

// Separable Gaussian blur. Returns a tuple of horizontal + vertical passes.
// Both passes share the same WebGL2 program structure but bake the sampling
// direction into the fragment shader at compile time. Callers spread the
// result into the `effects` prop or pass the whole tuple thanks to the
// runtime's automatic flattening.
export const blur = (
	params: BlurParams,
): readonly [EffectDescriptor<unknown>, EffectDescriptor<unknown>] =>
	[
		blurHorizontal({radius: params.radius}),
		blurVertical({radius: params.radius}),
	] as const;

export {blurHorizontal} from './blur-horizontal.js';
export type {BlurHorizontalParams} from './blur-horizontal.js';
export {blurVertical} from './blur-vertical.js';
export type {BlurVerticalParams} from './blur-vertical.js';
