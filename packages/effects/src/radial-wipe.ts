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

export const radialWipe = Internals.createEffect<
	RadialWipeParams,
	SinglePassState
>({
	type: 'remotion/radial-wipe',
	label: 'radialWipe()',
	documentationLink: 'https://www.remotion.dev/docs/effects/radial-wipe',
	backend: 'webgl2',
	calculateKey: (params) => `radial-wipe-${JSON.stringify(resolve(params))}`,
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
