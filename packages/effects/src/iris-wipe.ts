import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {
	cleanupSinglePass,
	drawSinglePass,
	prepareSinglePassSource,
	setupSinglePass,
	type SinglePassState,
} from './single-pass-runtime.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
	assertRequiredFiniteNumber,
} from './validate-effect-param.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	WEBGPU_SINGLE_PASS_VERTEX,
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

const {createEffect} = Internals;

const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_POINTS = 6 as const;
const DEFAULT_OUTER_RADIUS = 0 as const;
const DEFAULT_USE_INNER_RADIUS = false as const;
const DEFAULT_INNER_RADIUS = 0 as const;
const DEFAULT_ROTATION = 0 as const;
const DEFAULT_FEATHER = 0 as const;

export type IrisWipeCenter = readonly [number, number];

export type IrisWipeParams = {
	/** Normalized center measured from the top-left corner. Defaults to `[0.5, 0.5]`. */
	readonly center?: IrisWipeCenter;
	/** Number of polygon vertices or star points, from 3 to 64. Defaults to `6`. */
	readonly points?: number;
	/** Distance to the outer vertices in pixels. Defaults to `0`, leaving the source unchanged. */
	readonly outerRadius?: number;
	/** Alternate outer and inner vertices to create a star. Defaults to `false`. */
	readonly useInnerRadius?: boolean;
	/** Distance to the inner star vertices in pixels. Defaults to `0`. */
	readonly innerRadius?: number;
	/** Clockwise rotation in degrees from the top. Defaults to `0`. */
	readonly rotation?: number;
	/** Width of the feathered boundary in pixels. Defaults to `0`. */
	readonly feather?: number;
};

export const irisWipeSchema = {
	center: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
	},
	points: {
		type: 'number',
		min: 3,
		max: 64,
		step: 1,
		integer: true,
		default: DEFAULT_POINTS,
		description: 'Points',
		hiddenFromList: false,
	},
	outerRadius: {
		type: 'number',
		min: 0,
		max: 2000,
		step: 1,
		default: DEFAULT_OUTER_RADIUS,
		description: 'Outer radius',
		hiddenFromList: false,
	},
	useInnerRadius: {
		type: 'boolean',
		default: DEFAULT_USE_INNER_RADIUS,
		description: 'Use inner radius',
	},
	innerRadius: {
		type: 'number',
		min: 0,
		max: 2000,
		step: 1,
		default: DEFAULT_INNER_RADIUS,
		description: 'Inner radius',
		hiddenFromList: false,
	},
	rotation: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
	},
	feather: {
		type: 'number',
		min: 0,
		max: 500,
		step: 1,
		default: DEFAULT_FEATHER,
		description: 'Feather',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

type IrisWipeResolved = {
	readonly center: IrisWipeCenter;
	readonly points: number;
	readonly outerRadius: number;
	readonly useInnerRadius: boolean;
	readonly innerRadius: number;
	readonly rotation: number;
	readonly feather: number;
};

const resolve = (params: IrisWipeParams): IrisWipeResolved => ({
	center: params.center ?? DEFAULT_CENTER,
	points: params.points ?? DEFAULT_POINTS,
	outerRadius: params.outerRadius ?? DEFAULT_OUTER_RADIUS,
	useInnerRadius: params.useInnerRadius ?? DEFAULT_USE_INNER_RADIUS,
	innerRadius: params.innerRadius ?? DEFAULT_INNER_RADIUS,
	rotation: params.rotation ?? DEFAULT_ROTATION,
	feather: params.feather ?? DEFAULT_FEATHER,
});

const validateIrisWipeParams = (params: IrisWipeParams): void => {
	assertEffectParamsObject(params, 'Iris wipe');
	assertOptionalFiniteNumber(params.points, 'points');
	assertOptionalFiniteNumber(params.outerRadius, 'outerRadius');
	assertOptionalBoolean(params.useInnerRadius, 'useInnerRadius');
	assertOptionalFiniteNumber(params.innerRadius, 'innerRadius');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	assertOptionalFiniteNumber(params.feather, 'feather');

	if (params.center !== undefined) {
		if (!Array.isArray(params.center) || params.center.length !== 2) {
			throw new TypeError('"center" must be a [number, number] tuple');
		}

		assertRequiredFiniteNumber(params.center[0], 'center[0]');
		assertRequiredFiniteNumber(params.center[1], 'center[1]');
		validateUnitInterval(params.center[0], 'center[0]');
		validateUnitInterval(params.center[1], 'center[1]');
	}

	const r = resolve(params);
	if (!Number.isInteger(r.points) || r.points < 3 || r.points > 64) {
		throw new TypeError(
			`"points" must be an integer between 3 and 64, but got ${JSON.stringify(r.points)}`,
		);
	}

	validateNonNegative(r.outerRadius, 'outerRadius');
	validateNonNegative(r.innerRadius, 'innerRadius');
	validateNonNegative(r.feather, 'feather');
};

// Polygon and star geometry adapted from EffectCraft's iris_wipe, under the MIT license.
// See ../THIRD_PARTY_LICENSES.md.
// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/effects/src/transition.rs
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform int uPoints;
uniform float uOuterRadius;
uniform bool uUseInnerRadius;
uniform float uInnerRadius;
uniform float uRotation;
uniform float uFeather;

const float TAU = 6.283185307179586;

float cross2d(vec2 a, vec2 b) {
	return a.x * b.y - a.y * b.x;
}

void main() {
	vec4 source = texture(uSource, vUv);
	if (uOuterRadius <= 0.0) {
		fragColor = source;
		return;
	}

	vec2 position = (vec2(vUv.x, 1.0 - vUv.y) - uCenter) * uResolution;
	float radius = length(position);
	float innerRadius = uUseInnerRadius ? uInnerRadius : uOuterRadius;
	float boundary = min(uOuterRadius, innerRadius);
	if (radius > 0.000001) {
		float vertexCount = float(uPoints) * (uUseInnerRadius ? 2.0 : 1.0);
		float angleStep = TAU / vertexCount;
		float angle = mod(atan(position.x, -position.y) - uRotation, TAU);
		float index = min(floor(angle / angleStep), vertexCount - 1.0);
		float firstRadius = uUseInnerRadius && mod(index, 2.0) == 1.0
			? innerRadius : uOuterRadius;
		float secondRadius = uUseInnerRadius && mod(index + 1.0, 2.0) == 1.0
			? innerRadius : uOuterRadius;
		float firstAngle = uRotation + index * angleStep;
		float secondAngle = firstAngle + angleStep;
		vec2 first = firstRadius * vec2(sin(firstAngle), -cos(firstAngle));
		vec2 second = secondRadius * vec2(sin(secondAngle), -cos(secondAngle));
		vec2 edge = second - first;
		float denominator = cross2d(position / radius, edge);
		boundary = abs(denominator) < 0.000001
			? uOuterRadius : cross2d(first, edge) / denominator;
	}

	float mask = uFeather > 0.0
		? clamp((radius - boundary) / uFeather + 0.5, 0.0, 1.0)
		: step(boundary, radius);
	fragColor = source * mask;
}
`;

const WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
// Polygon and star geometry adapted from EffectCraft; see THIRD_PARTY_LICENSES.md.
struct Params { resolutionCenter: vec4f, radii: vec4f, controls: vec4f, }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
fn cross2d(a: vec2f, b: vec2f) -> f32 { return a.x * b.y - a.y * b.x; }
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
	let outerRadius = params.radii.y;
	if (outerRadius <= 0.0) { return color; }
	let position = (input.uv - params.resolutionCenter.zw) * params.resolutionCenter.xy;
	let radius = length(position);
	let useInnerRadius = params.radii.z != 0.0;
	let innerRadius = select(outerRadius, params.radii.w, useInnerRadius);
	var boundary = min(outerRadius, innerRadius);
	if (radius > 0.000001) {
		let vertexCount = params.radii.x * select(1.0, 2.0, useInnerRadius);
		let angleStep = 6.283185307179586 / vertexCount;
		// Avoid the implementation-dependent atan2 result at a signed-zero X argument.
		var polarAngle = atan2(position.x, -position.y);
		if (position.y == 0.0) { polarAngle = select(-1.5707963267948966, 1.5707963267948966, position.x >= 0.0); }
		let rawAngle = polarAngle - params.controls.x;
		let angle = rawAngle - 6.283185307179586 * floor(rawAngle / 6.283185307179586);
		let index = min(floor(angle / angleStep), vertexCount - 1.0);
		let firstRadius = select(outerRadius, innerRadius, useInnerRadius && index % 2.0 == 1.0);
		let secondRadius = select(outerRadius, innerRadius, useInnerRadius && (index + 1.0) % 2.0 == 1.0);
		let firstAngle = params.controls.x + index * angleStep;
		let secondAngle = firstAngle + angleStep;
		let first = firstRadius * vec2f(sin(firstAngle), -cos(firstAngle));
		let second = secondRadius * vec2f(sin(secondAngle), -cos(secondAngle));
		let edge = second - first;
		let denominator = cross2d(position / radius, edge);
		boundary = outerRadius;
		if (abs(denominator) >= 0.000001) { boundary = cross2d(first, edge) / denominator; }
	}
	var mask = step(boundary, radius);
	if (params.controls.y > 0.0) { mask = clamp((radius - boundary) / params.controls.y + 0.5, 0.0, 1.0); }
	return color * mask;
}
`;

export const irisWipe = createEffect<IrisWipeParams>({
	type: 'remotion/iris-wipe',
	label: 'irisWipe()',
	documentationLink: 'https://www.remotion.dev/docs/effects/iris-wipe',
	calculateKey: (params) => {
		const r = resolve(params);
		return `iris-wipe-${r.center.join(':')}-${r.points}-${r.outerRadius}-${r.useInnerRadius}-${r.innerRadius}-${r.rotation}-${r.feather}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			IrisWipeParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'iris-wipe'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error(
						'A WebGPU device is required for the iris-wipe effect',
					);
				}

				const r = resolve(params);

				applyWebGpuSinglePass({
					source,
					width,
					height,
					state,
					device: gpuDevice as GPUDevice,
					shader: WEBGPU_SHADER,
					uniformData: new Float32Array([
						width,
						height,
						r.center[0],
						r.center[1],
						r.points,
						r.outerRadius,
						r.useInnerRadius ? 1 : 0,
						r.innerRadius,
						((r.rotation % 360) * Math.PI) / 180,
						r.feather,
						0,
						0,
					]),
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<
			IrisWipeParams,
			SinglePassState
		>({
			setup: (target) =>
				setupSinglePass(target, FRAGMENT_SHADER, 'iris wipe', [
					'uResolution',
					'uCenter',
					'uPoints',
					'uOuterRadius',
					'uUseInnerRadius',
					'uInnerRadius',
					'uRotation',
					'uFeather',
				]),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolve(params);
				const {gl, uniforms} = state;

				prepareSinglePassSource({
					state,
					source: source as TexImageSource,
					width,
					height,
					flipSourceY,
				});
				if (uniforms.uResolution)
					gl.uniform2f(uniforms.uResolution, width, height);
				if (uniforms.uCenter)
					gl.uniform2f(uniforms.uCenter, r.center[0], r.center[1]);
				if (uniforms.uPoints) gl.uniform1i(uniforms.uPoints, r.points);
				if (uniforms.uOuterRadius)
					gl.uniform1f(uniforms.uOuterRadius, r.outerRadius);
				if (uniforms.uUseInnerRadius)
					gl.uniform1i(uniforms.uUseInnerRadius, r.useInnerRadius ? 1 : 0);
				if (uniforms.uInnerRadius)
					gl.uniform1f(uniforms.uInnerRadius, r.innerRadius);
				if (uniforms.uRotation)
					gl.uniform1f(
						uniforms.uRotation,
						((r.rotation % 360) * Math.PI) / 180,
					);
				if (uniforms.uFeather) gl.uniform1f(uniforms.uFeather, r.feather);

				drawSinglePass(state);
			},
			cleanup: cleanupSinglePass,
		}),
	},
	schema: irisWipeSchema,
	validateParams: validateIrisWipeParams,
});
