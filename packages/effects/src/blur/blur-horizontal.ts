import type {EffectDescriptor} from 'remotion';
import {Internals} from 'remotion';

const {createDescriptor, defineEffect} = Internals;
import {
	applyBlur,
	cleanupBlur,
	setupBlur,
	type BlurState,
} from './blur-runtime.js';
import {BLUR_FS_HORIZONTAL} from './blur-shaders.js';

export type BlurHorizontalParams = {
	readonly radius: number;
};

const blurHorizontalDef = defineEffect<BlurHorizontalParams, BlurState>({
	type: 'remotion/blur-horizontal',
	label: 'Blur (horizontal)',
	backend: 'webgl2',
	setup: (target) => setupBlur(target, BLUR_FS_HORIZONTAL),
	apply: ({source, width, height, params, state}) => {
		applyBlur(state, source, width, height, params.radius);
	},
	cleanup: (state) => cleanupBlur(state),
	schema: null,
});

// Single horizontal pass of the separable Gaussian blur. Most callers should
// use [`blur`](./index.ts) which composes both horizontal and vertical passes.
export const blurHorizontal = (
	params: BlurHorizontalParams,
): EffectDescriptor<unknown> => createDescriptor(blurHorizontalDef, params);
