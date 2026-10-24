import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';
import {
	cleanupWipe,
	drawWipe,
	prepareWipeSource,
	setupWipe,
	type WipeState,
} from './wipe-runtime.js';

const DEFAULT_COMPLETION = 0 as const;
const DEFAULT_ANGLE = 90 as const;
const DEFAULT_FEATHER = 0 as const;

const linearWipeSchema = {
	completion: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_COMPLETION,
		description: 'Completion',
		hiddenFromList: false,
	},
	angle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ANGLE,
		description: 'Angle',
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

export type LinearWipeParams = {
	/** Wipe completion from `0` (visible) to `1` (erased). Defaults to `0`. */
	readonly completion?: number;
	/** Travel direction in degrees clockwise from up. `90` wipes left to right. Defaults to `90`. */
	readonly angle?: number;
	/** Width of the soft edge in pixels. Defaults to `0`. */
	readonly feather?: number;
};

const resolve = (p: LinearWipeParams): Required<LinearWipeParams> => ({
	completion: p.completion ?? DEFAULT_COMPLETION,
	angle: p.angle ?? DEFAULT_ANGLE,
	feather: p.feather ?? DEFAULT_FEATHER,
});

// Adapted from EffectCraft's linear_wipe(), under the MIT license.
// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/effects/src/misc.rs
// See ../THIRD_PARTY_LICENSES.md.
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uDirection;
uniform float uCompletion;
uniform float uFeather;

void main() {
	vec4 source = texture(uSource, vUv);
	if (uCompletion <= 0.0) { fragColor = source; return; }
	if (uCompletion >= 1.0) { fragColor = vec4(0.0); return; }
	vec2 extent = uResolution * uDirection;
	float low = min(0.0, extent.x) + min(0.0, extent.y);
	float high = max(0.0, extent.x) + max(0.0, extent.y);
	float edge = mix(low - uFeather, high + uFeather, uCompletion);
	vec2 position = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
	float distance = dot(position, uDirection) - edge;
	float mask = uFeather > 0.0 ? clamp(distance / uFeather + 0.5, 0.0, 1.0) : step(0.0, distance);
	fragColor = source * mask;
}
`;

export const linearWipe = Internals.createEffect<LinearWipeParams, WipeState>({
	type: 'remotion/linear-wipe',
	label: 'linearWipe()',
	documentationLink: 'https://www.remotion.dev/docs/effects/linear-wipe',
	backend: 'webgl2',
	calculateKey: (params) => `linear-wipe-${JSON.stringify(resolve(params))}`,
	setup: (target) =>
		setupWipe(target, FRAGMENT_SHADER, 'linear wipe', [
			'uResolution',
			'uDirection',
			'uCompletion',
			'uFeather',
		]),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, uniforms} = state;
		prepareWipeSource({
			state,
			source: source as TexImageSource,
			width,
			height,
			flipSourceY,
		});
		gl.uniform2f(uniforms.uResolution, width, height);
		const angle = ((r.angle % 360) * Math.PI) / 180;
		gl.uniform2f(uniforms.uDirection, Math.sin(angle), -Math.cos(angle));
		gl.uniform1f(uniforms.uCompletion, r.completion);
		gl.uniform1f(uniforms.uFeather, r.feather);
		drawWipe(state);
	},
	cleanup: cleanupWipe,
	schema: linearWipeSchema,
	validateParams: (params) => {
		assertEffectParamsObject(params, 'Linear wipe');
		assertOptionalFiniteNumber(params.completion, 'completion');
		assertOptionalFiniteNumber(params.angle, 'angle');
		assertOptionalFiniteNumber(params.feather, 'feather');
		const r = resolve(params);
		validateUnitInterval(r.completion, 'completion');
		validateNonNegative(r.feather, 'feather');
	},
});
