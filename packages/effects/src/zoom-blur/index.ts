import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyZoomBlur,
	cleanupZoomBlur,
	setupZoomBlur,
	type ZoomBlurState,
} from './zoom-blur-runtime.js';

const {createEffect} = Internals;

const DEFAULT_AMOUNT = 40 as const;
const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_SAMPLES = 24 as const;
const MAX_SAMPLES = 64 as const;

const zoomBlurSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 200,
		step: 1,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	center: {
		type: 'uv-coordinate',
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
	},
	samples: {
		type: 'number',
		min: 1,
		max: MAX_SAMPLES,
		step: 1,
		default: DEFAULT_SAMPLES,
		description: 'Samples',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type ZoomBlurCenter = readonly [number, number];

export type ZoomBlurParams = {
	/** Blur strength in pixels. Defaults to `40`. */
	readonly amount?: number;
	/** Origin of the zoom blur in UV coordinates. Defaults to `[0.5, 0.5]`. */
	readonly center?: ZoomBlurCenter;
	/** Number of source samples. Higher values are smoother. Defaults to `24`. */
	readonly samples?: number;
};

type ZoomBlurResolved = {
	readonly amount: number;
	readonly center: ZoomBlurCenter;
	readonly samples: number;
};

const resolve = (params: ZoomBlurParams): ZoomBlurResolved => ({
	amount: params.amount ?? DEFAULT_AMOUNT,
	center: [...(params.center ?? DEFAULT_CENTER)] as ZoomBlurCenter,
	samples: params.samples ?? DEFAULT_SAMPLES,
});

const assertOptionalUvCoordinate = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		value.some((item) => typeof item !== 'number' || !Number.isFinite(item))
	) {
		throw new TypeError(`"${name}" must be a [number, number] tuple`);
	}
};

const assertOptionalInteger = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (!Number.isInteger(value)) {
		throw new TypeError(
			`"${name}" must be an integer, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateZoomBlurParams = (params: ZoomBlurParams): void => {
	assertEffectParamsObject(params, 'Zoom Blur');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalUvCoordinate(params.center, 'center');
	assertOptionalFiniteNumber(params.samples, 'samples');
	assertOptionalInteger(params.samples, 'samples');

	const r = resolve(params);
	validateNonNegative(r.amount, 'amount');
	validateUnitInterval(r.center[0], 'center[0]');
	validateUnitInterval(r.center[1], 'center[1]');
	if (r.samples < 1) {
		throw new TypeError(
			`"samples" must be >= 1, but got ${JSON.stringify(r.samples)}`,
		);
	}

	if (r.samples > MAX_SAMPLES) {
		throw new TypeError(
			`"samples" must be <= ${MAX_SAMPLES}, but got ${JSON.stringify(r.samples)}`,
		);
	}
};

export const zoomBlur = createEffect<ZoomBlurParams, ZoomBlurState>({
	type: 'remotion/zoom-blur',
	label: 'zoomBlur()',
	documentationLink: 'https://www.remotion.dev/docs/effects/zoom-blur',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `zoom-blur-${r.amount}-${r.center[0]}-${r.center[1]}-${r.samples}`;
	},
	setup: (target) => setupZoomBlur(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		applyZoomBlur({
			state,
			source,
			width,
			height,
			amount: r.amount,
			center: r.center,
			samples: r.samples,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupZoomBlur(state),
	schema: zoomBlurSchema,
	validateParams: validateZoomBlurParams,
});
