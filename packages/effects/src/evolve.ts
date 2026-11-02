import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
	validateNonNegative,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	WEBGPU_SINGLE_PASS_VERTEX,
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

const {createEffect, createWebGL2ContextError} = Internals;

const EVOLVE_DIRECTIONS = ['left', 'right', 'top', 'bottom', 'angle'] as const;
const EVOLVE_FEATHER_UNITS = ['relative', 'pixels'] as const;
const DIRECTION_VECTORS = {
	left: [1, 0],
	right: [-1, 0],
	top: [0, 1],
	bottom: [0, -1],
} as const;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_FEATHER = 0.1 as const;
const DEFAULT_DIRECTION = 'left' as const;
const DEFAULT_ANGLE = 90 as const;
const DEFAULT_FEATHER_UNIT = 'relative' as const;
const DEFAULT_FEATHER_PIXELS = 0 as const;

export type EvolveDirection = (typeof EVOLVE_DIRECTIONS)[number];
export type EvolveFeatherUnit = (typeof EVOLVE_FEATHER_UNITS)[number];

export const evolveSchema = {
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	direction: {
		type: 'enum',
		variants: {
			left: {},
			right: {},
			top: {},
			bottom: {},
			angle: {
				angle: {
					type: 'rotation-degrees',
					step: 1,
					default: DEFAULT_ANGLE,
					description: 'Angle',
				},
			},
		},
		default: DEFAULT_DIRECTION,
		description: 'Direction',
	},
	featherUnit: {
		type: 'enum',
		variants: {
			relative: {
				feather: {
					type: 'number',
					min: 0,
					max: 1,
					step: 0.01,
					default: DEFAULT_FEATHER,
					description: 'Feather',
					hiddenFromList: false,
				},
			},
			pixels: {
				featherPixels: {
					type: 'number',
					min: 0,
					max: 500,
					step: 1,
					default: DEFAULT_FEATHER_PIXELS,
					description: 'Feather in pixels',
					hiddenFromList: false,
				},
			},
		},
		default: DEFAULT_FEATHER_UNIT,
		description: 'Feather unit',
	},
} as const satisfies InteractivitySchema;

export type EvolveParams = {
	/** Reveal progress from `0` (hidden) to `1` (fully revealed). Defaults to `0.5`. */
	readonly progress?: number;
	/** Reveal direction. Defaults to `left`. */
	readonly direction?: EvolveDirection;
	/** Relative softness from `0` (sharp) to `1` (fully feathered), used with `featherUnit: 'relative'`. Defaults to `0.1`. */
	readonly feather?: number;
	/** Reveal travel direction in degrees clockwise from up, used with `direction: 'angle'`. Defaults to `90` (left to right). */
	readonly angle?: number;
	/** Use relative feathering or a pixel-wide linear edge. Defaults to `relative`. */
	readonly featherUnit?: EvolveFeatherUnit;
	/** Width of the soft edge in pixels when `featherUnit` is `pixels`. Defaults to `0`. */
	readonly featherPixels?: number;
};

type EvolveResolved = {
	readonly progress: number;
	readonly direction: EvolveDirection;
	readonly feather: number;
	readonly angle: number;
	readonly featherUnit: EvolveFeatherUnit;
	readonly featherPixels: number;
};

const formatEnum = (variants: readonly string[]): string => {
	if (variants.length === 2) {
		return `"${variants[0]}" or "${variants[1]}"`;
	}

	return `${variants
		.slice(0, -1)
		.map((variant) => `"${variant}"`)
		.join(', ')} or "${variants[variants.length - 1]}"`;
};

const assertOptionalEnum = <T extends string>(
	value: unknown,
	name: string,
	variants: readonly T[],
): void => {
	if (value === undefined) {
		return;
	}

	if (!variants.includes(value as T)) {
		throw new TypeError(
			`"${name}" must be ${formatEnum(variants)}, but got ${JSON.stringify(value)}`,
		);
	}
};

const resolve = (p: EvolveParams): EvolveResolved => ({
	progress: p.progress ?? DEFAULT_PROGRESS,
	direction: p.direction ?? DEFAULT_DIRECTION,
	feather: p.feather ?? DEFAULT_FEATHER,
	angle: p.angle ?? DEFAULT_ANGLE,
	featherUnit: p.featherUnit ?? DEFAULT_FEATHER_UNIT,
	featherPixels: p.featherPixels ?? DEFAULT_FEATHER_PIXELS,
});

const validateEvolveParams = (params: EvolveParams): void => {
	assertEffectParamsObject(params, 'Evolve');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.feather, 'feather');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.featherPixels, 'featherPixels');
	assertOptionalEnum(params.featherUnit, 'featherUnit', EVOLVE_FEATHER_UNITS);
	assertOptionalEnum(params.direction, 'direction', EVOLVE_DIRECTIONS);

	const r = resolve(params);
	validateUnitInterval(r.progress, 'progress');
	validateUnitInterval(r.feather, 'feather');
	validateNonNegative(r.featherPixels, 'featherPixels');
};

type EvolveState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uProgress: WebGLUniformLocation | null;
		readonly uDirection: WebGLUniformLocation | null;
		readonly uFeather: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uTravelDirection: WebGLUniformLocation | null;
		readonly uUsePixelFeather: WebGLUniformLocation | null;
		readonly uFeatherPixels: WebGLUniformLocation | null;
	};
};

const EVOLVE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const EVOLVE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uProgress;
uniform float uFeather;
uniform int uDirection;
uniform vec2 uResolution;
uniform vec2 uTravelDirection;
uniform bool uUsePixelFeather;
uniform float uFeatherPixels;

float getT(vec2 uv) {
	// 0: left, 1: right, 2: top, 3: bottom
	if (uDirection == 0) {
		return uv.x;
	}

	if (uDirection == 1) {
		return 1.0 - uv.x;
	}

	if (uDirection == 2) {
		// vUv.y is bottom-to-top; top reveal starts at y=1
		return 1.0 - uv.y;
	}

	return uv.y;
}

float maskValue(float t, float progress, float feather) {
	float p = clamp(progress, 0.0, 1.0);
	float f = max(feather, 0.0);

	if (p <= 0.000001) {
		return 0.0;
	}

	if (p >= 0.999999) {
		return 1.0;
	}

	if (f <= 0.0001) {
		return step(t, p);
	}

	return 1.0 - smoothstep(p, min(p + f, 1.0), t);
}

void main() {
	vec4 source = texture(uSource, vUv);
	float t = getT(vUv);
	float mask;
	if (uDirection == 4 || uUsePixelFeather) {
		vec2 extent = uResolution * uTravelDirection;
		float low = min(0.0, extent.x) + min(0.0, extent.y);
		float high = max(0.0, extent.x) + max(0.0, extent.y);
		vec2 position = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
		float projection = dot(position, uTravelDirection);
		if (uUsePixelFeather) {
			// Adapted from EffectCraft's linear_wipe(), under the MIT license:
			// https://github.com/storytold/effectcraft/blob/eb5108786b90bf994a6abe4e6c0b2614c6aeaa29/crates/effects/src/misc.rs
			// See ../THIRD_PARTY_LICENSES.md. Increasing progress reveals the source.
			float edge = mix(low - uFeatherPixels, high + uFeatherPixels, uProgress);
			mask = uFeatherPixels > 0.0
				? clamp((edge - projection) / uFeatherPixels + 0.5, 0.0, 1.0)
				: step(projection, edge);
			if (uProgress <= 0.0) mask = 0.0;
			if (uProgress >= 1.0) mask = 1.0;
		} else {
			t = (projection - low) / (high - low);
			mask = maskValue(t, uProgress, uFeather);
		}
	} else {
		mask = maskValue(t, uProgress, uFeather);
	}
	fragColor = vec4(source.rgb * mask, source.a * mask);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create WebGL shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Evolve shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const linkProgram = (
	gl: WebGL2RenderingContext,
	vs: WebGLShader,
	fs: WebGLShader,
): WebGLProgram => {
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Evolve program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createRgbaTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create WebGL texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const setupEvolve = (target: HTMLCanvasElement): EvolveState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});

	if (!gl) {
		throw createWebGL2ContextError('evolve effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, EVOLVE_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, EVOLVE_FS);
	const program = linkProgram(gl, vs, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);

	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create WebGL vertex array');
	}

	gl.bindVertexArray(vao);

	const data = new Float32Array([
		-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
	]);

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create WebGL buffer');
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	const aPos = gl.getAttribLocation(program, 'aPos');
	const aUv = gl.getAttribLocation(program, 'aUv');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(aUv);
	gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

	gl.bindVertexArray(null);

	const textureSource = createRgbaTexture(gl);

	return {
		gl,
		program,
		vao,
		vbo,
		textureSource,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uProgress: gl.getUniformLocation(program, 'uProgress'),
			uDirection: gl.getUniformLocation(program, 'uDirection'),
			uFeather: gl.getUniformLocation(program, 'uFeather'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uTravelDirection: gl.getUniformLocation(program, 'uTravelDirection'),
			uUsePixelFeather: gl.getUniformLocation(program, 'uUsePixelFeather'),
			uFeatherPixels: gl.getUniformLocation(program, 'uFeatherPixels'),
		},
	};
};

const directionToInt = (direction: EvolveDirection): number => {
	switch (direction) {
		case 'left':
			return 0;
		case 'right':
			return 1;
		case 'top':
			return 2;
		case 'bottom':
			return 3;
		case 'angle':
			return 4;
		default: {
			const exhaustiveCheck: never = direction;
			return exhaustiveCheck;
		}
	}
};

const WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { resolutionTravel: vec4f, controls: vec4f, featherPixels: vec4f, }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
fn maskValue(t: f32, progress: f32, feather: f32) -> f32 {
	let p = clamp(progress, 0.0, 1.0);
	let f = max(feather, 0.0);
	if (p <= 0.000001) { return 0.0; }
	if (p >= 0.999999) { return 1.0; }
	if (f <= 0.0001) { return step(t, p); }
	return 1.0 - smoothstep(p, min(p + f, 1.0), t);
}
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let color = textureSampleLevel(source, sourceSampler, input.uv, 0);
	let progress = params.controls.x;
	let direction = params.controls.z;
	let usePixelFeather = params.controls.w != 0.0;
	var t = input.uv.x;
	if (direction == 1.0) { t = 1.0 - input.uv.x; }
	if (direction == 2.0) { t = input.uv.y; }
	if (direction == 3.0) { t = 1.0 - input.uv.y; }
	var mask: f32;
	if (direction == 4.0 || usePixelFeather) {
		let extent = params.resolutionTravel.xy * params.resolutionTravel.zw;
		let low = min(0.0, extent.x) + min(0.0, extent.y);
		let high = max(0.0, extent.x) + max(0.0, extent.y);
		let position = input.uv * params.resolutionTravel.xy;
		let projection = dot(position, params.resolutionTravel.zw);
		if (usePixelFeather) {
			let feather = params.featherPixels.x;
			let edge = mix(low - feather, high + feather, progress);
			mask = step(projection, edge);
			if (feather > 0.0) { mask = clamp((edge - projection) / feather + 0.5, 0.0, 1.0); }
			if (progress <= 0.0) { mask = 0.0; }
			if (progress >= 1.0) { mask = 1.0; }
		} else {
			t = (projection - low) / (high - low);
			mask = maskValue(t, progress, params.controls.y);
		}
	} else { mask = maskValue(t, progress, params.controls.y); }
	return color * mask;
}
`;

export const evolve = createEffect<EvolveParams>({
	type: 'dev.remotion.effects.evolve',
	label: 'evolve()',
	documentationLink: 'https://www.remotion.dev/docs/effects/evolve',
	calculateKey: (params) => {
		const r = resolve(params);
		return `evolve-${r.progress}-${r.direction}-${r.feather}-${r.angle}-${r.featherUnit}-${r.featherPixels}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			EvolveParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'evolve'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error('A WebGPU device is required for the evolve effect');
				}

				const r = resolve(params);
				const radians = ((r.angle % 360) * Math.PI) / 180;
				const travelDirection =
					r.direction === 'angle'
						? [Math.sin(radians), -Math.cos(radians)]
						: DIRECTION_VECTORS[r.direction];
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
						travelDirection[0],
						travelDirection[1],
						r.progress,
						r.feather,
						directionToInt(r.direction),
						r.featherUnit === 'pixels' ? 1 : 0,
						r.featherPixels,
						0,
						0,
						0,
					]),
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<EvolveParams, EvolveState>({
			setup: (target) => setupEvolve(target),
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const r = resolve(params);
				const {gl, program, textureSource, uniforms, vao} = state;

				gl.viewport(0, 0, width, height);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				gl.clearColor(0, 0, 0, 0);
				gl.clear(gl.COLOR_BUFFER_BIT);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, textureSource);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					source as TexImageSource,
				);

				gl.useProgram(program);
				if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
				if (uniforms.uProgress) gl.uniform1f(uniforms.uProgress, r.progress);
				if (uniforms.uFeather) gl.uniform1f(uniforms.uFeather, r.feather);
				if (uniforms.uDirection)
					gl.uniform1i(uniforms.uDirection, directionToInt(r.direction));

				gl.uniform2f(uniforms.uResolution, width, height);
				const radians = ((r.angle % 360) * Math.PI) / 180;
				const travelDirection =
					r.direction === 'angle'
						? [Math.sin(radians), -Math.cos(radians)]
						: DIRECTION_VECTORS[r.direction];
				gl.uniform2f(
					uniforms.uTravelDirection,
					travelDirection[0],
					travelDirection[1],
				);
				gl.uniform1i(
					uniforms.uUsePixelFeather,
					r.featherUnit === 'pixels' ? 1 : 0,
				);
				gl.uniform1f(uniforms.uFeatherPixels, r.featherPixels);

				gl.bindVertexArray(vao);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
				gl.bindVertexArray(null);

				gl.bindTexture(gl.TEXTURE_2D, null);
				gl.useProgram(null);
			},
			cleanup: ({gl, program, vao, vbo, textureSource}) => {
				gl.deleteTexture(textureSource);
				gl.deleteBuffer(vbo);
				gl.deleteProgram(program);
				gl.deleteVertexArray(vao);
			},
		}),
	},
	schema: evolveSchema,
	validateParams: validateEvolveParams,
});
