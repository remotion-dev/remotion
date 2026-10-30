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
	assertRequiredFiniteNumber,
} from './validate-effect-param.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	WEBGPU_SINGLE_PASS_VERTEX,
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

const DEFAULT_PROGRESS = 0 as const;
const DEFAULT_START_ANGLE = 0 as const;
const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_DIRECTION = 'clockwise' as const;
const DEFAULT_FEATHER = 0 as const;
const DIRECTIONS = ['clockwise', 'counterclockwise', 'both'] as const;

const radialWipeSchema = {
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	startAngle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_START_ANGLE,
		description: 'Start angle',
	},
	center: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
	},
	direction: {
		type: 'enum',
		variants: {clockwise: {}, counterclockwise: {}, both: {}},
		default: DEFAULT_DIRECTION,
		description: 'Direction',
	},
	feather: {
		type: 'number',
		min: 0,
		max: 360,
		step: 1,
		default: DEFAULT_FEATHER,
		description: 'Feather',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type RadialWipeDirection = (typeof DIRECTIONS)[number];
export type RadialWipeCenter = readonly [number, number];
export type RadialWipeParams = {
	/** Wipe progress from `0` (visible) to `1` (erased). Defaults to `0`. */
	readonly progress?: number;
	/** Start angle in degrees clockwise from up. Defaults to `0`. */
	readonly startAngle?: number;
	/** Normalized center from `[0, 0]` (top left) to `[1, 1]` (bottom right). Defaults to `[0.5, 0.5]`. */
	readonly center?: RadialWipeCenter;
	/** Sweep direction. `both` erases on both sides of the start angle. Defaults to `clockwise`. */
	readonly direction?: RadialWipeDirection;
	/** Width of the soft sweep edge in degrees, from `0` to `360`. Defaults to `0`. */
	readonly feather?: number;
};

const resolve = (p: RadialWipeParams): Required<RadialWipeParams> => ({
	progress: p.progress ?? DEFAULT_PROGRESS,
	startAngle: p.startAngle ?? DEFAULT_START_ANGLE,
	center: p.center ?? DEFAULT_CENTER,
	direction: p.direction ?? DEFAULT_DIRECTION,
	feather: p.feather ?? DEFAULT_FEATHER,
});

// Adapted from EffectCraft's radial_wipe(), under the MIT license.
// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/effects/src/misc.rs
// See ../THIRD_PARTY_LICENSES.md.
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uStartAngle;
uniform float uProgress;
uniform float uFeather;
uniform int uDirection;

void main() {
	vec4 source = texture(uSource, vUv);
	if (uProgress <= 0.0) { fragColor = source; return; }
	if (uProgress >= 1.0) { fragColor = vec4(0.0); return; }
	vec2 delta = (vec2(vUv.x, 1.0 - vUv.y) - uCenter) * uResolution;
	// atan(0, 0) is undefined; the center belongs to the erased sector.
	if (dot(delta, delta) == 0.0) { fragColor = vec4(0.0); return; }
	float angle = mod(degrees(atan(delta.x, -delta.y)) - uStartAngle, 360.0);
	float sweep = 360.0;
	if (uDirection == 1) angle = 360.0 - angle;
	if (uDirection == 2) { angle = min(angle, 360.0 - angle); sweep = 180.0; }
	float distance = angle - uProgress * sweep;
	float mask = uFeather > 0.0 ? clamp(distance / uFeather + 0.5, 0.0, 1.0) : step(0.0, distance);
	fragColor = source * mask;
}
`;

const WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { resolutionCenter: vec4f, controls: vec4f, }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
	let progress = params.controls.y;
	if (progress <= 0.0) { return color; }
	if (progress >= 1.0) { return vec4f(0); }
	let delta = (input.uv - params.resolutionCenter.zw) * params.resolutionCenter.xy;
	if (dot(delta, delta) == 0.0) { return vec4f(0); }
	// Avoid the implementation-dependent atan2 result at a signed-zero X argument.
	var polarAngle = atan2(delta.x, -delta.y);
	if (delta.y == 0.0) { polarAngle = select(-1.5707963267948966, 1.5707963267948966, delta.x >= 0.0); }
	let rawAngle = degrees(polarAngle) - params.controls.x;
	var angle = rawAngle - 360.0 * floor(rawAngle / 360.0);
	var sweep = 360.0;
	if (params.controls.w == 1.0) { angle = 360.0 - angle; }
	if (params.controls.w == 2.0) { angle = min(angle, 360.0 - angle); sweep = 180.0; }
	let distance = angle - progress * sweep;
	var mask = step(0.0, distance);
	if (params.controls.z > 0.0) { mask = clamp(distance / params.controls.z + 0.5, 0.0, 1.0); }
	return color * mask;
}
`;

export const radialWipe = Internals.createEffect<RadialWipeParams>({
	type: 'remotion/radial-wipe',
	label: 'radialWipe()',
	documentationLink: 'https://www.remotion.dev/docs/effects/radial-wipe',
	calculateKey: (params) => `radial-wipe-${JSON.stringify(resolve(params))}`,
	implementations: {
		webgpu: Internals.createEffectImplementation<
			RadialWipeParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'radial-wipe'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error(
						'A WebGPU device is required for the radial-wipe effect',
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
						r.startAngle % 360,
						r.progress,
						r.feather,
						DIRECTIONS.indexOf(r.direction),
					]),
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<
			RadialWipeParams,
			SinglePassState
		>({
			setup: (target) =>
				setupSinglePass(target, FRAGMENT_SHADER, 'radial wipe', [
					'uResolution',
					'uCenter',
					'uStartAngle',
					'uProgress',
					'uFeather',
					'uDirection',
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
				gl.uniform2f(uniforms.uResolution, width, height);
				gl.uniform2f(uniforms.uCenter, r.center[0], r.center[1]);
				gl.uniform1f(uniforms.uStartAngle, r.startAngle % 360);
				gl.uniform1f(uniforms.uProgress, r.progress);
				gl.uniform1f(uniforms.uFeather, r.feather);
				gl.uniform1i(uniforms.uDirection, DIRECTIONS.indexOf(r.direction));
				drawSinglePass(state);
			},
			cleanup: cleanupSinglePass,
		}),
	},
	schema: radialWipeSchema,
	validateParams: (params) => {
		assertEffectParamsObject(params, 'Radial wipe');
		assertOptionalFiniteNumber(params.progress, 'progress');
		assertOptionalFiniteNumber(params.startAngle, 'startAngle');
		assertOptionalFiniteNumber(params.feather, 'feather');
		if (params.center !== undefined) {
			if (!Array.isArray(params.center) || params.center.length !== 2) {
				throw new TypeError('"center" must be a tuple of two finite numbers');
			}

			assertRequiredFiniteNumber(params.center[0], 'center[0]');
			assertRequiredFiniteNumber(params.center[1], 'center[1]');
		}

		const r = resolve(params);
		if (
			params.direction !== undefined &&
			!DIRECTIONS.includes(params.direction)
		) {
			throw new TypeError(
				'"direction" must be "clockwise", "counterclockwise" or "both"',
			);
		}

		validateUnitInterval(r.progress, 'progress');
		validateUnitInterval(r.center[0], 'center[0]');
		validateUnitInterval(r.center[1], 'center[1]');
		validateNonNegative(r.feather, 'feather');
		if (r.feather > 360) throw new TypeError('"feather" must be at most 360');
	},
});
