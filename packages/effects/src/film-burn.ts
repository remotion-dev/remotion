import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {FILM_BURN_WEBGPU_SHADER} from './film-burn-webgpu-shader.js';
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
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

const {createEffect} = Internals;

const DEFAULT_PROGRESS = 0 as const;
const DEFAULT_CENTER = [0.5, 0.5] as const;
const DEFAULT_SEED = 0 as const;

export type FilmBurnParams = {
	/** Burn progress from `0` (unchanged) to `1` (transparent). Defaults to `0`. */
	readonly progress?: number;
	/** Normalized burn center measured from the top-left corner. Defaults to `[0.5, 0.5]`. */
	readonly center?: readonly [number, number];
	/** Unsigned 32-bit integer seed for a repeatable burn pattern. Defaults to `0`. */
	readonly seed?: number;
};

export const filmBurnSchema = {
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	center: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
	},
	seed: {
		type: 'number',
		min: 0,
		max: 4294967295,
		step: 1,
		integer: true,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

type FilmBurnResolved = {
	readonly progress: number;
	readonly center: readonly [number, number];
	readonly seed: number;
};

const resolve = (params: FilmBurnParams): FilmBurnResolved => ({
	progress: params.progress ?? DEFAULT_PROGRESS,
	center: params.center ?? DEFAULT_CENTER,
	seed: params.seed ?? DEFAULT_SEED,
});

const validateFilmBurnParams = (params: FilmBurnParams): void => {
	assertEffectParamsObject(params, 'Film burn');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.seed, 'seed');
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
	validateUnitInterval(r.progress, 'progress');
	if (!Number.isInteger(r.seed) || r.seed < 0 || r.seed > 4294967295) {
		throw new TypeError('"seed" must be an unsigned 32-bit integer');
	}
};

// Adapted from EffectCraft's CC Burn Film and its four-octave value noise,
// under the MIT license. See ../THIRD_PARTY_LICENSES.md.
// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/effects/src/stylize3.rs
// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/effects/src/generate.rs
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uProgress;
uniform vec2 uCenter;
uniform uint uSeed;

float lattice(ivec3 point, uint seed) {
	uvec3 p = uvec3(point);
	uint h = p.x * 0x27d4eb2du ^ p.y * 0x165667b1u
		^ p.z * 0x9e3779b9u ^ seed * 0x85ebca6bu;
	h ^= h >> 15;
	h *= 0x2c1b3c6du;
	h ^= h >> 12;
	h *= 0x297a2d39u;
	h ^= h >> 15;
	return float(h & 65535u) / 65535.0;
}

float valueNoise(vec3 point, uint seed) {
	ivec3 cell = ivec3(floor(point));
	vec3 t = fract(point);
	vec3 fade = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
	float lower = mix(
		mix(lattice(cell, seed), lattice(cell + ivec3(1, 0, 0), seed), fade.x),
		mix(lattice(cell + ivec3(0, 1, 0), seed), lattice(cell + ivec3(1, 1, 0), seed), fade.x),
		fade.y
	);
	float upper = mix(
		mix(lattice(cell + ivec3(0, 0, 1), seed), lattice(cell + ivec3(1, 0, 1), seed), fade.x),
		mix(lattice(cell + ivec3(0, 1, 1), seed), lattice(cell + ivec3(1, 1, 1), seed), fade.x),
		fade.y
	);
	return mix(lower, upper, fade.z);
}

void main() {
	vec4 source = texture(uSource, vUv);
	if (uProgress <= 0.0 || source.a == 0.0) {
		fragColor = source;
		return;
	}
	if (uProgress >= 1.0) {
		fragColor = vec4(0.0);
		return;
	}

	vec2 pixel = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
	float distanceFromCenter = length(pixel - uCenter * uResolution)
		/ max(length(uResolution), 1.0);
	float noise = 0.0;
	float amplitude = 1.0;
	float frequency = 1.0;
	for (int octave = 0; octave < 4; octave++) {
		noise += valueNoise(
			vec3(pixel / 60.0 * frequency, float(octave) * 7.31),
			uSeed + 17u + uint(octave)
		) * amplitude;
		amplitude *= 0.5;
		frequency *= 2.0;
	}
	noise /= 1.875;
	float field = noise * 0.65 + (1.0 - min(distanceFromCenter, 1.0)) * 0.35;
	float threshold = 1.0 - uProgress * 1.25;
	float band = 0.12 * min(uProgress * 10.0, 1.0);
	if (field > threshold + band) {
		fragColor = vec4(0.0);
		return;
	}
	if (field <= threshold - band * 2.0) {
		fragColor = source;
		return;
	}

	float scorch = smoothstep(threshold - band * 2.0, threshold, field);
	float hot = smoothstep(threshold, threshold + band, field);
	vec3 color = source.rgb / source.a * (1.0 - scorch * 0.85);
	color = vec3(
		color.r + (1.0 - color.r) * hot * 0.9,
		color.g + (0.45 - color.g) * hot * 0.9,
		color.b * (1.0 - hot)
	);
	float alpha = source.a * (1.0 - hot * 0.6);
	fragColor = vec4(color * alpha, alpha);
}
`;

export const filmBurn = createEffect<FilmBurnParams>({
	type: 'remotion/film-burn',
	label: 'filmBurn()',
	documentationLink: 'https://www.remotion.dev/docs/effects/film-burn',
	calculateKey: (params) => {
		const r = resolve(params);
		return `film-burn-${r.progress}-${r.center.join(':')}-${r.seed}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			FilmBurnParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'film-burn'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice)
					throw new Error(
						'A WebGPU device is required for the film-burn effect',
					);
				const r = resolve(params);
				const uniformData = new Float32Array([
					width,
					height,
					r.progress,
					0,
					r.center[0],
					r.center[1],
					0,
					0,
				]);
				new Uint32Array(uniformData.buffer)[3] = r.seed;
				applyWebGpuSinglePass({
					state,
					source,
					width,
					height,
					device: gpuDevice as GPUDevice,
					shader: FILM_BURN_WEBGPU_SHADER,
					uniformData,
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<
			FilmBurnParams,
			SinglePassState
		>({
			setup: (target) =>
				setupSinglePass(target, FRAGMENT_SHADER, 'film burn', [
					'uResolution',
					'uProgress',
					'uCenter',
					'uSeed',
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
				if (uniforms.uProgress) gl.uniform1f(uniforms.uProgress, r.progress);
				if (uniforms.uCenter)
					gl.uniform2f(uniforms.uCenter, r.center[0], r.center[1]);
				if (uniforms.uSeed) gl.uniform1ui(uniforms.uSeed, r.seed);
				drawSinglePass(state);
			},
			cleanup: cleanupSinglePass,
		}),
	},
	schema: filmBurnSchema,
	validateParams: validateFilmBurnParams,
});
