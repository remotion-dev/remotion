import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';

const {createEffect} = Internals;
import {
	applyBlur,
	cleanupBlur,
	setupBlur,
	type BlurState,
} from './blur-runtime.js';

export type BlurParams = {
	readonly radius: number;
};

const blurSchema = {
	radius: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: 10,
		description: 'Blur radius',
	},
} as const satisfies SequenceSchema;

export const blur = createEffect<BlurParams, BlurState>({
	type: 'remotion/blur',
	label: 'Blur',
	backend: 'webgl2',
	calculateKey: (params) => String(params.radius),
	setup: (target) => setupBlur(target),
	apply: ({source, width, height, params, state}) => {
		applyBlur({
			state,
			source,
			width,
			height,
			radius: params.radius,
		});
	},
	cleanup: (state) => cleanupBlur(state),
	schema: blurSchema,
});
