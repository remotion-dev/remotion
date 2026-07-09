import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyRadialProgressiveBlur,
	cleanupRadialProgressiveBlur,
	setupRadialProgressiveBlur,
	type RadialProgressiveBlurState,
} from './radial-progressive-blur-runtime.js';

const {createEffect} = Internals;

const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_WIDTH = 1;
const DEFAULT_HEIGHT = 1;
const DEFAULT_ROTATION = 0;
const DEFAULT_START = 0;
const DEFAULT_START_BLUR = 0;
const DEFAULT_END_BLUR = 50;

export type RadialProgressiveBlurUvCoordinate = readonly [number, number];

export type RadialProgressiveBlurParams = {
	/**
	 * UV coordinate where `startBlur` is reached. Defaults to `[0.5, 0.5]`.
	 */
	readonly center?: RadialProgressiveBlurUvCoordinate;
	/**
	 * Full ellipse width in UV coordinates. Defaults to `1`.
	 */
	readonly width?: number;
	/**
	 * Full ellipse height in UV coordinates. Defaults to `1`.
	 */
	readonly height?: number;
	/**
	 * Ellipse rotation in degrees. Defaults to `0`.
	 */
	readonly rotation?: number;
	/**
	 * Normalized ellipse progress where `startBlur` is reached. `0` is the
	 * center and `1` is the ellipse line. Defaults to `0`.
	 */
	readonly start?: number;
	/**
	 * Blur radius in pixels at `start`. Defaults to `0`.
	 */
	readonly startBlur?: number;
	/**
	 * Blur radius in pixels at the outer ellipse. Defaults to `50`.
	 */
	readonly endBlur?: number;
};

export type RadialProgressiveBlurResolved = {
	readonly center: RadialProgressiveBlurUvCoordinate;
	readonly width: number;
	readonly height: number;
	readonly rotation: number;
	readonly start: number;
	readonly startBlur: number;
	readonly endBlur: number;
};

const radialProgressiveBlurSchema = {
	center: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
		visual: {
			type: 'ellipse',
			width: 'width',
			height: 'height',
			rotation: 'rotation',
			innerScale: 'start',
		},
	},
	width: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: DEFAULT_WIDTH,
		description: 'Width',
		hiddenFromList: false,
	},
	height: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: DEFAULT_HEIGHT,
		description: 'Height',
		hiddenFromList: false,
	},
	rotation: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
	},
	start: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_START,
		description: 'Start',
		hiddenFromList: false,
	},
	startBlur: {
		type: 'number',
		min: 0,
		max: 200,
		step: 1,
		default: DEFAULT_START_BLUR,
		description: 'Start blur',
		hiddenFromList: false,
	},
	endBlur: {
		type: 'number',
		min: 0,
		max: 200,
		step: 1,
		default: DEFAULT_END_BLUR,
		description: 'End blur',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const clampBlur = (value: number): number => Math.max(0, value);

const resolveRadialProgressiveBlurParams = (
	params: RadialProgressiveBlurParams,
): RadialProgressiveBlurResolved => ({
	center: [
		...(params.center ?? DEFAULT_CENTER),
	] as RadialProgressiveBlurUvCoordinate,
	width: params.width ?? DEFAULT_WIDTH,
	height: params.height ?? DEFAULT_HEIGHT,
	rotation: params.rotation ?? DEFAULT_ROTATION,
	start: params.start ?? DEFAULT_START,
	startBlur: clampBlur(params.startBlur ?? DEFAULT_START_BLUR),
	endBlur: clampBlur(params.endBlur ?? DEFAULT_END_BLUR),
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

const validateRadialProgressiveBlurParams = (
	params: RadialProgressiveBlurParams,
): void => {
	assertEffectParamsObject(params, 'Radial progressive blur');
	assertOptionalUvCoordinate(params.center, 'center');
	assertOptionalFiniteNumber(params.width, 'width');
	assertOptionalFiniteNumber(params.height, 'height');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	validateNonNegative(params.width ?? DEFAULT_WIDTH, 'width');
	validateNonNegative(params.height ?? DEFAULT_HEIGHT, 'height');
	assertOptionalFiniteNumber(params.start, 'start');
	validateUnitInterval(params.start ?? DEFAULT_START, 'start');
	assertOptionalFiniteNumber(params.startBlur, 'startBlur');
	assertOptionalFiniteNumber(params.endBlur, 'endBlur');
};

export const radialProgressiveBlur = createEffect<
	RadialProgressiveBlurParams,
	RadialProgressiveBlurState
>({
	type: 'dev.remotion.effects.radialProgressiveBlur',
	label: 'radialProgressiveBlur()',
	documentationLink:
		'https://www.remotion.dev/docs/effects/radial-progressive-blur',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolveRadialProgressiveBlurParams(params);
		return `radial-progressive-blur-${r.center.join(':')}-${r.width}-${r.height}-${r.rotation}-${r.start}-${r.startBlur}-${r.endBlur}`;
	},
	setup: (target) => setupRadialProgressiveBlur(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolveRadialProgressiveBlurParams(params);
		applyRadialProgressiveBlur({
			state,
			source,
			width,
			height,
			params: r,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupRadialProgressiveBlur(state),
	schema: radialProgressiveBlurSchema,
	validateParams: validateRadialProgressiveBlurParams,
});
