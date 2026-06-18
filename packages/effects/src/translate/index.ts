import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {assertOptionalFiniteNumber} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';

const {createEffect} = Internals;

const xyTranslateSchema = {
	x: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'X',
		hiddenFromList: false,
	},
	y: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Y',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const uvTranslateSchema = {
	u: {
		type: 'number',
		step: 0.01,
		default: 0,
		description: 'U',
		hiddenFromList: false,
	},
	v: {
		type: 'number',
		step: 0.01,
		default: 0,
		description: 'V',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type XyTranslateParams = {
	/** Horizontal offset in pixels. Defaults to `0`. */
	readonly x?: number;
	/** Vertical offset in pixels. Defaults to `0`. */
	readonly y?: number;
};

export type UvTranslateParams = {
	/** Horizontal offset in UV coordinates. `1` equals the full canvas width. Defaults to `0`. */
	readonly u?: number;
	/** Vertical offset in UV coordinates. `1` equals the full canvas height. Defaults to `0`. */
	readonly v?: number;
};

type XyTranslateResolved = {
	readonly x: number;
	readonly y: number;
};

type UvTranslateResolved = {
	readonly u: number;
	readonly v: number;
};

const resolveXyTranslate = (
	params: XyTranslateParams,
): XyTranslateResolved => ({
	x: params.x ?? 0,
	y: params.y ?? 0,
});

const resolveUvTranslate = (
	params: UvTranslateParams,
): UvTranslateResolved => ({
	u: params.u ?? 0,
	v: params.v ?? 0,
});

const validateXyTranslateParams = (params: XyTranslateParams): void => {
	assertEffectParamsObject(params, 'xyTranslate');
	assertOptionalFiniteNumber(params.x, 'x');
	assertOptionalFiniteNumber(params.y, 'y');
};

const validateUvTranslateParams = (params: UvTranslateParams): void => {
	assertEffectParamsObject(params, 'uvTranslate');
	assertOptionalFiniteNumber(params.u, 'u');
	assertOptionalFiniteNumber(params.v, 'v');
};

const applyTranslate = ({
	source,
	target,
	width,
	height,
	x,
	y,
}: {
	readonly source: CanvasImageSource;
	readonly target: HTMLCanvasElement;
	readonly width: number;
	readonly height: number;
	readonly x: number;
	readonly y: number;
}) => {
	const ctx = target.getContext('2d');
	if (!ctx) {
		throw new Error(
			'Failed to acquire 2D context for translate effect. The canvas may have been assigned a different context type.',
		);
	}

	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(source, x, y, width, height);
};

export const xyTranslate = createEffect<XyTranslateParams, null>({
	type: 'dev.remotion.effects.xyTranslate',
	label: 'xyTranslate()',
	documentationLink: 'https://www.remotion.dev/docs/effects/xy-translate',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolveXyTranslate(params);
		return `xy-translate-${r.x}-${r.y}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const r = resolveXyTranslate(params);
		applyTranslate({
			source,
			target,
			width,
			height,
			x: r.x,
			y: r.y,
		});
	},
	cleanup: () => undefined,
	schema: xyTranslateSchema,
	validateParams: validateXyTranslateParams,
});

export const uvTranslate = createEffect<UvTranslateParams, null>({
	type: 'dev.remotion.effects.uvTranslate',
	label: 'uvTranslate()',
	documentationLink: 'https://www.remotion.dev/docs/effects/uv-translate',
	backend: '2d',
	calculateKey: (params) => {
		const r = resolveUvTranslate(params);
		return `uv-translate-${r.u}-${r.v}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const r = resolveUvTranslate(params);
		applyTranslate({
			source,
			target,
			width,
			height,
			x: r.u * width,
			y: r.v * height,
		});
	},
	cleanup: () => undefined,
	schema: uvTranslateSchema,
	validateParams: validateUvTranslateParams,
});
