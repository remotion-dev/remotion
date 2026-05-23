import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from '../validate-effect-param.js';

const {createEffect} = Internals;
import {
	applyBlur,
	cleanupBlur,
	setupBlur,
	type BlurState,
} from './blur-runtime.js';

export type BlurParams = {
	readonly radius: number;
	/** Apply blur along the horizontal axis. Defaults to `true`. */
	readonly horizontal?: boolean;
	/** Apply blur along the vertical axis. Defaults to `true`. */
	readonly vertical?: boolean;
};

type BlurResolved = {
	readonly radius: number;
	readonly horizontal: boolean;
	readonly vertical: boolean;
};

const resolveBlurParams = (params: BlurParams): BlurResolved => ({
	radius: params.radius,
	horizontal: params.horizontal ?? true,
	vertical: params.vertical ?? true,
});

const blurSchema = {
	radius: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: undefined,
		description: 'Radius',
	},
	horizontal: {
		type: 'boolean',
		default: true,
		description: 'Horizontal',
	},
	vertical: {
		type: 'boolean',
		default: true,
		description: 'Vertical',
	},
} as const satisfies SequenceSchema;

const validateBlurParams = (params: BlurParams): void => {
	assertEffectParamsObject(params, 'Blur');
	assertRequiredFiniteNumber(params.radius, 'radius');
};

export const blur = createEffect<BlurParams, BlurState>({
	type: 'remotion/blur',
	label: 'Blur',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolveBlurParams(params);
		return `${r.radius}-${r.horizontal ? 1 : 0}-${r.vertical ? 1 : 0}`;
	},
	setup: (target) => setupBlur(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolveBlurParams(params);
		applyBlur({
			state,
			source,
			width,
			height,
			radius: r.radius,
			horizontal: r.horizontal,
			vertical: r.vertical,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupBlur(state),
	schema: blurSchema,
	validateParams: validateBlurParams,
});
