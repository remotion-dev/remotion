import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {assertOptionalFiniteNumber} from '../color-utils.js';
import {
	cleanupProgressivePixelate,
	drawProgressivePixelate,
	prepareProgressivePixelate,
	setupProgressivePixelate,
	type ProgressivePixelateState,
} from '../progressive-pixelate-runtime.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';

const {createEffect} = Internals;

const DEFAULT_START = [0, 0.5] as const;
const DEFAULT_END = [1, 0.5] as const;
const DEFAULT_START_BLOCK_SIZE = 1;
const DEFAULT_END_BLOCK_SIZE = 40;

export type LinearProgressivePixelateUvCoordinate = readonly [number, number];

export type LinearProgressivePixelateParams = {
	/** UV coordinate where `startBlockSize` is reached. Defaults to `[0, 0.5]`. */
	readonly start?: LinearProgressivePixelateUvCoordinate;
	/** UV coordinate where `endBlockSize` is reached. Defaults to `[1, 0.5]`. */
	readonly end?: LinearProgressivePixelateUvCoordinate;
	/** Pixel block size at `start`. Defaults to `1`. */
	readonly startBlockSize?: number;
	/** Pixel block size at `end`. Defaults to `40`. */
	readonly endBlockSize?: number;
};

type LinearProgressivePixelateResolved = {
	readonly start: LinearProgressivePixelateUvCoordinate;
	readonly end: LinearProgressivePixelateUvCoordinate;
	readonly startBlockSize: number;
	readonly endBlockSize: number;
};

const linearProgressivePixelateSchema = {
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
	startBlockSize: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: DEFAULT_START_BLOCK_SIZE,
		description: 'Start block size',
		hiddenFromList: false,
	},
	endBlockSize: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: DEFAULT_END_BLOCK_SIZE,
		description: 'End block size',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const resolve = (
	params: LinearProgressivePixelateParams,
): LinearProgressivePixelateResolved => ({
	start: [
		...(params.start ?? DEFAULT_START),
	] as LinearProgressivePixelateUvCoordinate,
	end: [
		...(params.end ?? DEFAULT_END),
	] as LinearProgressivePixelateUvCoordinate,
	startBlockSize: params.startBlockSize ?? DEFAULT_START_BLOCK_SIZE,
	endBlockSize: params.endBlockSize ?? DEFAULT_END_BLOCK_SIZE,
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

const validateBlockSize = (value: number, name: string): void => {
	if (value < 1) {
		throw new TypeError(`"${name}" must be >= 1`);
	}
};

const validateParams = (params: LinearProgressivePixelateParams): void => {
	assertEffectParamsObject(params, 'Linear progressive pixelate');
	assertOptionalUvCoordinate(params.start, 'start');
	assertOptionalUvCoordinate(params.end, 'end');
	assertOptionalFiniteNumber(params.startBlockSize, 'startBlockSize');
	assertOptionalFiniteNumber(params.endBlockSize, 'endBlockSize');
	validateBlockSize(
		params.startBlockSize ?? DEFAULT_START_BLOCK_SIZE,
		'startBlockSize',
	);
	validateBlockSize(
		params.endBlockSize ?? DEFAULT_END_BLOCK_SIZE,
		'endBlockSize',
	);
};

export const linearProgressivePixelate = createEffect<
	LinearProgressivePixelateParams,
	ProgressivePixelateState
>({
	type: 'dev.remotion.effects.linearProgressivePixelate',
	label: 'linearProgressivePixelate()',
	documentationLink:
		'https://www.remotion.dev/docs/effects/linear-progressive-pixelate',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `linear-progressive-pixelate-${r.start.join(':')}-${r.end.join(':')}-${r.startBlockSize}-${r.endBlockSize}`;
	},
	setup: setupProgressivePixelate,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		prepareProgressivePixelate({
			state,
			source,
			width,
			height,
			flipSourceY,
		});
		const {gl, uniforms} = state;
		if (uniforms.uMode) gl.uniform1i(uniforms.uMode, 0);
		if (uniforms.uStart) gl.uniform2f(uniforms.uStart, r.start[0], r.start[1]);
		if (uniforms.uEnd) gl.uniform2f(uniforms.uEnd, r.end[0], r.end[1]);
		if (uniforms.uStartBlockSize)
			gl.uniform1f(uniforms.uStartBlockSize, r.startBlockSize);
		if (uniforms.uEndBlockSize)
			gl.uniform1f(uniforms.uEndBlockSize, r.endBlockSize);
		drawProgressivePixelate(state);
	},
	cleanup: cleanupProgressivePixelate,
	schema: linearProgressivePixelateSchema,
	validateParams,
});
