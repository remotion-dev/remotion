import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyFisheye,
	cleanupFisheye,
	setupFisheye,
	type FisheyeState,
} from './fisheye-runtime.js';

const {createEffect} = Internals;

const DEFAULT_FISHEYE_FIELD_OF_VIEW = 2.5 as const;
const DEFAULT_FISHEYE_CENTER = [0.5, 0.5] as const;
const DEFAULT_FISHEYE_RADIUS = 1 as const;
const DEFAULT_FISHEYE_ZOOM = 1 as const;
const MAX_FIELD_OF_VIEW = Math.PI;

export type FisheyeUvCoordinate = readonly [number, number];

const fisheyeSchema = {
	fieldOfView: {
		type: 'number',
		min: 0,
		max: MAX_FIELD_OF_VIEW,
		step: 0.01,
		default: DEFAULT_FISHEYE_FIELD_OF_VIEW,
		description: 'Field of view',
		hiddenFromList: false,
	},
	center: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_FISHEYE_CENTER,
		description: 'Center',
	},
	radius: {
		type: 'number',
		min: 0.01,
		max: 3,
		step: 0.01,
		default: DEFAULT_FISHEYE_RADIUS,
		description: 'Radius',
		hiddenFromList: false,
	},
	zoom: {
		type: 'number',
		min: 0.1,
		max: 5,
		step: 0.01,
		default: DEFAULT_FISHEYE_ZOOM,
		description: 'Zoom',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type FisheyeParams = {
	/**
	 * Lens field of view in radians, from `0` to `Math.PI`.
	 * Higher values produce a stronger fisheye distortion.
	 * Defaults to `2.5` (approx. 143°).
	 */
	readonly fieldOfView?: number;
	/**
	 * Center of the lens in UV coordinates. Defaults to `[0.5, 0.5]`.
	 */
	readonly center?: FisheyeUvCoordinate;
	/**
	 * Radius of the lens area, in normalized half-height units.
	 * `1` covers the full vertical area. Defaults to `1`.
	 */
	readonly radius?: number;
	/**
	 * Post-warp zoom factor. Values above `1` zoom in, below `1` zoom out.
	 * Defaults to `1`.
	 */
	readonly zoom?: number;
};

type FisheyeResolved = {
	fieldOfView: number;
	center: FisheyeUvCoordinate;
	radius: number;
	zoom: number;
};

const resolve = (p: FisheyeParams): FisheyeResolved => ({
	fieldOfView: p.fieldOfView ?? DEFAULT_FISHEYE_FIELD_OF_VIEW,
	center: [...(p.center ?? DEFAULT_FISHEYE_CENTER)] as FisheyeUvCoordinate,
	radius: p.radius ?? DEFAULT_FISHEYE_RADIUS,
	zoom: p.zoom ?? DEFAULT_FISHEYE_ZOOM,
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

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateFisheyeParams = (params: FisheyeParams): void => {
	assertEffectParamsObject(params, 'Fisheye');
	assertOptionalFiniteNumber(params.fieldOfView, 'fieldOfView');
	assertOptionalUvCoordinate(params.center, 'center');
	assertOptionalFiniteNumber(params.radius, 'radius');
	assertOptionalFiniteNumber(params.zoom, 'zoom');

	const resolved = resolve(params);
	validateNonNegative(resolved.fieldOfView, 'fieldOfView');
	if (resolved.fieldOfView > MAX_FIELD_OF_VIEW) {
		throw new TypeError(
			`"fieldOfView" must be <= ${MAX_FIELD_OF_VIEW}, but got ${JSON.stringify(resolved.fieldOfView)}`,
		);
	}

	validatePositive(resolved.radius, 'radius');
	validatePositive(resolved.zoom, 'zoom');
};

export const fisheye = createEffect<FisheyeParams, FisheyeState>({
	type: 'dev.remotion.effects.fisheye',
	label: 'fisheye()',
	documentationLink: 'https://www.remotion.dev/docs/effects/fisheye',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `fisheye-${r.fieldOfView}-${r.center.join(':')}-${r.radius}-${r.zoom}`;
	},
	setup: (target) => setupFisheye(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		applyFisheye({
			state,
			source,
			width,
			height,
			center: r.center,
			fieldOfView: r.fieldOfView,
			radius: r.radius,
			zoom: r.zoom,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupFisheye(state),
	schema: fisheyeSchema,
	validateParams: validateFisheyeParams,
});
