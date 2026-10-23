import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyWebGpuProjection,
	cleanupWebGpuProjection,
	setupWebGpuProjection,
	type WebGpuProjectionState,
} from '../webgpu-projection-runtime.js';
import {SPHERE_SHADER} from './shader.js';

const DEFAULT_RADIUS = 250;
const DEFAULT_ROTATION = 0;
const DEFAULT_POSITION = [0.5, 0.5] as const;
const DEFAULT_RENDER = 'both';
const DEFAULT_SHADING = 0.35;

const sphereSchema = {
	radius: {
		type: 'number',
		min: 1,
		max: 1000,
		step: 1,
		default: DEFAULT_RADIUS,
		description: 'Radius',
		hiddenFromList: false,
	},
	rotationX: {
		type: 'rotation-degrees',
		default: DEFAULT_ROTATION,
		description: 'X rotation',
	},
	rotationY: {
		type: 'rotation-degrees',
		default: DEFAULT_ROTATION,
		description: 'Y rotation',
	},
	rotationZ: {
		type: 'rotation-degrees',
		default: DEFAULT_ROTATION,
		description: 'Z rotation',
	},
	position: {
		type: 'uv-coordinate',
		default: DEFAULT_POSITION,
		description: 'Position',
	},
	render: {
		type: 'enum',
		variants: {both: {}, front: {}, back: {}},
		default: DEFAULT_RENDER,
		description: 'Faces',
	},
	shading: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SHADING,
		description: 'Shading',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type SphereRender = 'both' | 'front' | 'back';

export type SphereParams = {
	/** Sphere radius in pixels. Defaults to 250. */
	readonly radius?: number;
	/** Sphere orientation in degrees, applied in X, Y, Z order. */
	readonly rotationX?: number;
	readonly rotationY?: number;
	readonly rotationZ?: number;
	/** Center as fractions of the canvas width and height. Defaults to [0.5, 0.5]. */
	readonly position?: readonly [number, number];
	/** Which faces to show. Defaults to 'both'. */
	readonly render?: SphereRender;
	/** Darkening at the silhouette, from 0 to 1. Defaults to 0.35. */
	readonly shading?: number;
};

const resolve = (params: SphereParams) => ({
	radius: params.radius ?? DEFAULT_RADIUS,
	rotationX: params.rotationX ?? DEFAULT_ROTATION,
	rotationY: params.rotationY ?? DEFAULT_ROTATION,
	rotationZ: params.rotationZ ?? DEFAULT_ROTATION,
	position: params.position ?? DEFAULT_POSITION,
	render: params.render ?? DEFAULT_RENDER,
	shading: params.shading ?? DEFAULT_SHADING,
});

export const sphere = Internals.createEffect<
	SphereParams,
	WebGpuProjectionState
>({
	type: 'remotion/sphere',
	label: 'sphere()',
	documentationLink: 'https://www.remotion.dev/docs/effects/sphere',
	backend: 'webgpu',
	schema: sphereSchema,
	validateParams: (params) => {
		assertEffectParamsObject(params, 'Sphere');
		for (const key of [
			'radius',
			'rotationX',
			'rotationY',
			'rotationZ',
			'shading',
		] as const) {
			assertOptionalFiniteNumber(params[key], key);
		}

		const r = resolve(params);
		if (r.radius <= 0) {
			throw new TypeError('"radius" must be greater than 0');
		}

		validateUnitInterval(r.shading, 'shading');
		if (
			params.position !== undefined &&
			(!Array.isArray(params.position) ||
				params.position.length !== 2 ||
				!Number.isFinite(params.position[0]) ||
				!Number.isFinite(params.position[1]))
		) {
			throw new TypeError('"position" must contain two finite numbers');
		}

		if (
			params.render !== undefined &&
			params.render !== 'both' &&
			params.render !== 'front' &&
			params.render !== 'back'
		) {
			throw new TypeError('"render" must be "both", "front", or "back"');
		}
	},
	calculateKey: (params) => {
		const r = resolve(params);
		return `sphere-${r.radius}-${r.rotationX}-${r.rotationY}-${r.rotationZ}-${r.position.join(',')}-${r.render}-${r.shading}`;
	},
	setup: (target) => setupWebGpuProjection(target, 'sphere'),
	apply: ({source, width, height, params, state, gpuDevice}) => {
		if (!gpuDevice) {
			throw new Error('A WebGPU device is required for the sphere effect');
		}

		const r = resolve(params);
		const radians = Math.PI / 180;
		applyWebGpuProjection({
			source,
			width,
			height,
			state,
			device: gpuDevice as GPUDevice,
			shader: SPHERE_SHADER,
			uniformData: new Float32Array([
				width,
				height,
				r.position[0] * width,
				r.position[1] * height,
				r.radius,
				0,
				r.shading,
				r.render === 'front' ? 1 : r.render === 'back' ? 2 : 0,
				(r.rotationX % 360) * radians,
				(r.rotationY % 360) * radians,
				(r.rotationZ % 360) * radians,
				0,
			]),
		});
	},
	cleanup: cleanupWebGpuProjection,
});
