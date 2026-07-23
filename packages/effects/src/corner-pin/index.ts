import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyCornerPin,
	cleanupCornerPin,
	setupCornerPin,
	type CornerPinState,
} from './corner-pin-runtime.js';

const {createEffect} = Internals;

const DEFAULT_TOP_LEFT = [0, 0] as const;
const DEFAULT_TOP_RIGHT = [1, 0] as const;
const DEFAULT_BOTTOM_RIGHT = [1, 1] as const;
const DEFAULT_BOTTOM_LEFT = [0, 1] as const;

export type CornerPinUvCoordinate = readonly [number, number];

const cornerSchema = (defaultValue: CornerPinUvCoordinate) =>
	({
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: defaultValue,
		description: 'Corner',
	}) as const;

const cornerPinSchema = {
	topLeft: {
		...cornerSchema(DEFAULT_TOP_LEFT),
		description: 'Top left',
	},
	topRight: {
		...cornerSchema(DEFAULT_TOP_RIGHT),
		description: 'Top right',
	},
	bottomRight: {
		...cornerSchema(DEFAULT_BOTTOM_RIGHT),
		description: 'Bottom right',
	},
	bottomLeft: {
		...cornerSchema(DEFAULT_BOTTOM_LEFT),
		description: 'Bottom left',
	},
} as const satisfies InteractivitySchema;

export type CornerPinParams = {
	/** Top-left output corner in UV coordinates. Defaults to `[0, 0]`. */
	readonly topLeft?: CornerPinUvCoordinate;
	/** Top-right output corner in UV coordinates. Defaults to `[1, 0]`. */
	readonly topRight?: CornerPinUvCoordinate;
	/** Bottom-right output corner in UV coordinates. Defaults to `[1, 1]`. */
	readonly bottomRight?: CornerPinUvCoordinate;
	/** Bottom-left output corner in UV coordinates. Defaults to `[0, 1]`. */
	readonly bottomLeft?: CornerPinUvCoordinate;
};

type CornerPinResolved = {
	topLeft: CornerPinUvCoordinate;
	topRight: CornerPinUvCoordinate;
	bottomRight: CornerPinUvCoordinate;
	bottomLeft: CornerPinUvCoordinate;
};

const resolve = (p: CornerPinParams): CornerPinResolved => ({
	topLeft: [...(p.topLeft ?? DEFAULT_TOP_LEFT)] as CornerPinUvCoordinate,
	topRight: [...(p.topRight ?? DEFAULT_TOP_RIGHT)] as CornerPinUvCoordinate,
	bottomRight: [
		...(p.bottomRight ?? DEFAULT_BOTTOM_RIGHT),
	] as CornerPinUvCoordinate,
	bottomLeft: [
		...(p.bottomLeft ?? DEFAULT_BOTTOM_LEFT),
	] as CornerPinUvCoordinate,
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

const validateCornerPinParams = (params: CornerPinParams): void => {
	assertEffectParamsObject(params, 'Corner pin');
	assertOptionalUvCoordinate(params.topLeft, 'topLeft');
	assertOptionalUvCoordinate(params.topRight, 'topRight');
	assertOptionalUvCoordinate(params.bottomRight, 'bottomRight');
	assertOptionalUvCoordinate(params.bottomLeft, 'bottomLeft');
};

export const cornerPin = createEffect<CornerPinParams, CornerPinState>({
	type: 'dev.remotion.effects.cornerPin',
	label: 'cornerPin()',
	documentationLink: 'https://www.remotion.dev/docs/effects/corner-pin',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `corner-pin-${r.topLeft.join(':')}-${r.topRight.join(':')}-${r.bottomRight.join(':')}-${r.bottomLeft.join(':')}`;
	},
	setup: (target) => setupCornerPin(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		applyCornerPin({
			state,
			source,
			width,
			height,
			topLeft: r.topLeft,
			topRight: r.topRight,
			bottomRight: r.bottomRight,
			bottomLeft: r.bottomLeft,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupCornerPin(state),
	schema: cornerPinSchema,
	validateParams: validateCornerPinParams,
});
