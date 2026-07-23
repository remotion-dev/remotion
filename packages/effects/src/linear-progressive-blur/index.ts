import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {assertOptionalFiniteNumber} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyLinearProgressiveBlur,
	cleanupLinearProgressiveBlur,
	setupLinearProgressiveBlur,
	type LinearProgressiveBlurState,
} from './linear-progressive-blur-runtime.js';

const {createEffect} = Internals;

const DEFAULT_START = [0, 0.5] as const;
const DEFAULT_END = [1, 0.5] as const;
const DEFAULT_START_BLUR = 0;
const DEFAULT_END_BLUR = 50;

export type LinearProgressiveBlurUvCoordinate = readonly [number, number];

export type LinearProgressiveBlurParams = {
	/**
	 * UV coordinate where `startBlur` is reached. Defaults to `[0, 0.5]`.
	 */
	readonly start?: LinearProgressiveBlurUvCoordinate;
	/**
	 * UV coordinate where `endBlur` is reached. Defaults to `[1, 0.5]`.
	 */
	readonly end?: LinearProgressiveBlurUvCoordinate;
	/**
	 * Blur radius in pixels at `start`. Defaults to `0`.
	 */
	readonly startBlur?: number;
	/**
	 * Blur radius in pixels at `end`. Defaults to `50`.
	 */
	readonly endBlur?: number;
};

export type LinearProgressiveBlurResolved = {
	readonly start: LinearProgressiveBlurUvCoordinate;
	readonly end: LinearProgressiveBlurUvCoordinate;
	readonly startBlur: number;
	readonly endBlur: number;
};

const linearProgressiveBlurSchema = {
	start: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_START,
		description: 'Start',
		visual: {
			type: 'line',
			to: 'end',
		},
	},
	end: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_END,
		description: 'End',
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

const resolveLinearProgressiveBlurParams = (
	params: LinearProgressiveBlurParams,
): LinearProgressiveBlurResolved => ({
	start: [
		...(params.start ?? DEFAULT_START),
	] as LinearProgressiveBlurUvCoordinate,
	end: [...(params.end ?? DEFAULT_END)] as LinearProgressiveBlurUvCoordinate,
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

const validateLinearProgressiveBlurParams = (
	params: LinearProgressiveBlurParams,
): void => {
	assertEffectParamsObject(params, 'Linear progressive blur');
	assertOptionalUvCoordinate(params.start, 'start');
	assertOptionalUvCoordinate(params.end, 'end');
	assertOptionalFiniteNumber(params.startBlur, 'startBlur');
	assertOptionalFiniteNumber(params.endBlur, 'endBlur');
};

export const linearProgressiveBlur = createEffect<
	LinearProgressiveBlurParams,
	LinearProgressiveBlurState
>({
	type: 'dev.remotion.effects.linearProgressiveBlur',
	label: 'linearProgressiveBlur()',
	documentationLink:
		'https://www.remotion.dev/docs/effects/linear-progressive-blur',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolveLinearProgressiveBlurParams(params);
		return `linear-progressive-blur-${r.start.join(':')}-${r.end.join(':')}-${r.startBlur}-${r.endBlur}`;
	},
	setup: (target) => setupLinearProgressiveBlur(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolveLinearProgressiveBlurParams(params);
		applyLinearProgressiveBlur({
			state,
			source,
			width,
			height,
			params: r,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupLinearProgressiveBlur(state),
	schema: linearProgressiveBlurSchema,
	validateParams: validateLinearProgressiveBlurParams,
});
