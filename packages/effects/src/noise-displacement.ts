import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_STRENGTH = 36 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_GRAIN_SIZE = 8 as const;
const DEFAULT_PASSES = 6 as const;
const DEFAULT_BLUR = 0 as const;
const DEFAULT_FEATHER = 0.25 as const;
const DEFAULT_BIAS_DIRECTION = 0 as const;
const DEFAULT_BIAS_AMOUNT = 0 as const;
const MAX_PASSES = 12 as const;

const noiseDisplacementSchema = {
	center: {
		type: 'uv-coordinate',
		step: 0.01,
		default: undefined,
		description: 'Center',
	},
	radius: {
		type: 'number',
		min: 0.001,
		max: 1,
		step: 0.01,
		default: undefined,
		description: 'Radius',
		hiddenFromList: false,
	},
	strength: {
		type: 'number',
		min: 0,
		max: 200,
		step: 0.1,
		default: DEFAULT_STRENGTH,
		description: 'Strength',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		step: 1,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	grainSize: {
		type: 'number',
		min: 0.1,
		max: 100,
		step: 0.1,
		default: DEFAULT_GRAIN_SIZE,
		description: 'Grain size',
		hiddenFromList: false,
	},
	passes: {
		type: 'number',
		min: 1,
		max: MAX_PASSES,
		step: 1,
		default: DEFAULT_PASSES,
		description: 'Passes',
		hiddenFromList: false,
	},
	blur: {
		type: 'number',
		min: 0,
		max: 100,
		step: 0.1,
		default: DEFAULT_BLUR,
		description: 'Blur',
		hiddenFromList: false,
	},
	feather: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_FEATHER,
		description: 'Feather',
		hiddenFromList: false,
	},
	biasDirection: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_BIAS_DIRECTION,
		description: 'Bias direction',
	},
	biasAmount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_BIAS_AMOUNT,
		description: 'Bias amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type NoiseDisplacementCenter = readonly [number, number];

export type NoiseDisplacementParams = {
	/** Center of the affected area in UV coordinates. */
	readonly center: NoiseDisplacementCenter;
	/** Radius of the affected area, relative to the shorter canvas side. */
	readonly radius: number;
	/** Maximum displacement in pixels at the center. Defaults to `36`. */
	readonly strength?: number;
	/** Seed for the deterministic noise field. Defaults to `0`. */
	readonly seed?: number;
	/** Size of each noise cell in pixels. Defaults to `8`. */
	readonly grainSize?: number;
	/** Number of source samples along the displacement path. Defaults to `6`. */
	readonly passes?: number;
	/** Additional local blur in pixels. Defaults to `0`. */
	readonly blur?: number;
	/** Edge softness as a fraction of the radius. Defaults to `0.25`. */
	readonly feather?: number;
	/** Direction of the optional bias pull in degrees. Defaults to `0`. */
	readonly biasDirection?: number;
	/** Directional pull multiplier relative to `strength`. Defaults to `0`. */
	readonly biasAmount?: number;
};

type NoiseDisplacementResolved = {
	center: NoiseDisplacementCenter;
	radius: number;
	strength: number;
	seed: number;
	grainSize: number;
	passes: number;
	blur: number;
	feather: number;
	biasDirection: number;
	biasAmount: number;
};

type NoiseDisplacementState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uCenter: WebGLUniformLocation | null;
		readonly uRadius: WebGLUniformLocation | null;
		readonly uStrength: WebGLUniformLocation | null;
		readonly uSeed: WebGLUniformLocation | null;
		readonly uGrainSize: WebGLUniformLocation | null;
		readonly uPasses: WebGLUniformLocation | null;
		readonly uBlur: WebGLUniformLocation | null;
		readonly uFeather: WebGLUniformLocation | null;
		readonly uBiasDirection: WebGLUniformLocation | null;
		readonly uBiasAmount: WebGLUniformLocation | null;
	};
};

const resolve = (p: NoiseDisplacementParams): NoiseDisplacementResolved => ({
	center: [...p.center] as NoiseDisplacementCenter,
	radius: p.radius,
	strength: p.strength ?? DEFAULT_STRENGTH,
	seed: p.seed ?? DEFAULT_SEED,
	grainSize: p.grainSize ?? DEFAULT_GRAIN_SIZE,
	passes: p.passes ?? DEFAULT_PASSES,
	blur: p.blur ?? DEFAULT_BLUR,
	feather: p.feather ?? DEFAULT_FEATHER,
	biasDirection: p.biasDirection ?? DEFAULT_BIAS_DIRECTION,
	biasAmount: p.biasAmount ?? DEFAULT_BIAS_AMOUNT,
});

const assertRequiredUvCoordinate = (value: unknown, name: string): void => {
	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		value.some((item) => typeof item !== 'number' || !Number.isFinite(item))
	) {
		throw new TypeError(`"${name}" must be a [number, number] tuple`);
	}
};

const assertOptionalIntegerNumber = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (!Number.isInteger(value)) {
		throw new TypeError(
			`"${name}" must be an integer, but got ${JSON.stringify(value)}`,
		);
	}
};

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateMax = (value: number, max: number, name: string): void => {
	if (value > max) {
		throw new TypeError(
			`"${name}" must be <= ${max}, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateNoiseDisplacementParams = (
	params: NoiseDisplacementParams,
): void => {
	assertEffectParamsObject(params, 'Noise Displacement');
	assertRequiredUvCoordinate(params.center, 'center');
	assertRequiredFiniteNumber(params.radius, 'radius');
	assertOptionalFiniteNumber(params.strength, 'strength');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalFiniteNumber(params.grainSize, 'grainSize');
	assertOptionalFiniteNumber(params.passes, 'passes');
	assertOptionalIntegerNumber(params.passes, 'passes');
	assertOptionalFiniteNumber(params.blur, 'blur');
	assertOptionalFiniteNumber(params.feather, 'feather');
	assertOptionalFiniteNumber(params.biasDirection, 'biasDirection');
	assertOptionalFiniteNumber(params.biasAmount, 'biasAmount');

	const r = resolve(params);
	validateUnitInterval(r.center[0], 'center[0]');
	validateUnitInterval(r.center[1], 'center[1]');
	validatePositive(r.radius, 'radius');
	validateUnitInterval(r.radius, 'radius');
	if (r.strength < 0) {
		throw new TypeError(
			`"strength" must be >= 0, but got ${JSON.stringify(r.strength)}`,
		);
	}

	validatePositive(r.grainSize, 'grainSize');
	validatePositive(r.passes, 'passes');
	validateMax(r.passes, MAX_PASSES, 'passes');
	if (r.blur < 0) {
		throw new TypeError(
			`"blur" must be >= 0, but got ${JSON.stringify(r.blur)}`,
		);
	}

	validateUnitInterval(r.feather, 'feather');
	if (r.biasAmount < 0) {
		throw new TypeError(
			`"biasAmount" must be >= 0, but got ${JSON.stringify(r.biasAmount)}`,
		);
	}
};

const NOISE_DISPLACEMENT_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const NOISE_DISPLACEMENT_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
uniform float uSeed;
uniform float uGrainSize;
uniform int uPasses;
uniform float uBlur;
uniform float uFeather;
uniform float uBiasDirection;
uniform float uBiasAmount;

const float PI = 3.141592653589793;
const vec2 DISC[9] = vec2[9](
	vec2(0.0, 0.0),
	vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, -1.0),
	vec2(0.707, 0.707), vec2(-0.707, 0.707),
	vec2(0.707, -0.707), vec2(-0.707, -0.707)
);
const float DISC_W[9] = float[9](1.0, 0.7, 0.7, 0.7, 0.7, 0.5, 0.5, 0.5, 0.5);

float hash12(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031 + uSeed * 0.0973);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
		mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
		u.y
	);
}

vec2 noiseVector(vec2 p) {
	return vec2(
		valueNoise(p + vec2(17.13, 71.79)),
		valueNoise(p + vec2(83.41, 29.67))
	) * 2.0 - 1.0;
}

float effectMask(vec2 pixel) {
	vec2 centerPx = uCenter * uResolution;
	float radiusPx = uRadius * min(uResolution.x, uResolution.y);
	float dist = length(pixel - centerPx);

	if (dist >= radiusPx) {
		return 0.0;
	}

	if (uFeather <= 0.0001) {
		return 1.0;
	}

	float inner = radiusPx * (1.0 - uFeather);
	return 1.0 - smoothstep(inner, radiusPx, dist);
}

vec4 sampleSource(vec2 pixel) {
	vec2 uv = clamp(
		vec2(pixel.x / uResolution.x, 1.0 - pixel.y / uResolution.y),
		vec2(0.0),
		vec2(1.0)
	);
	return texture(uSource, uv);
}

void main() {
	vec2 pixel = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
	float mask = effectMask(pixel);

	if (mask <= 0.0 || uStrength <= 0.0) {
		fragColor = texture(uSource, vUv);
		return;
	}

	vec2 noiseCoord = pixel / max(uGrainSize, 0.001);
	vec2 biasDir = vec2(
		cos(uBiasDirection * PI / 180.0),
		sin(uBiasDirection * PI / 180.0)
	);
	vec2 displacement = (noiseVector(noiseCoord) + biasDir * uBiasAmount) * uStrength * mask;
	int passes = max(uPasses, 1);
	float blurRadius = uBlur * mask;
	int blurTaps = blurRadius > 0.5 ? 9 : 1;

	vec4 color = vec4(0.0);
	float totalWeight = 0.0;
	for (int s = 0; s < 12; s++) {
		if (s >= passes) {
			break;
		}

		float t = passes == 1 ? 1.0 : float(s) / float(passes - 1);
		vec2 samplePixel = pixel + displacement * t;
		float passWeight = 1.0 - t * 0.6;

		for (int b = 0; b < 9; b++) {
			if (b >= blurTaps) {
				break;
			}

			float weight = passWeight * DISC_W[b];
			color += sampleSource(samplePixel + DISC[b] * blurRadius) * weight;
			totalWeight += weight;
		}
	}

	fragColor = color / totalWeight;
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
		throw new Error(
			`Noise displacement shader compile failed: ${log ?? '(no log)'}`,
		);
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
		throw new Error(
			`Noise displacement program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

const setupNoiseDisplacement = (
	target: HTMLCanvasElement,
): NoiseDisplacementState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('noise displacement effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, NOISE_DISPLACEMENT_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, NOISE_DISPLACEMENT_FS);
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

	return {
		gl,
		program,
		vao,
		vbo,
		texture,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uCenter: gl.getUniformLocation(program, 'uCenter'),
			uRadius: gl.getUniformLocation(program, 'uRadius'),
			uStrength: gl.getUniformLocation(program, 'uStrength'),
			uSeed: gl.getUniformLocation(program, 'uSeed'),
			uGrainSize: gl.getUniformLocation(program, 'uGrainSize'),
			uPasses: gl.getUniformLocation(program, 'uPasses'),
			uBlur: gl.getUniformLocation(program, 'uBlur'),
			uFeather: gl.getUniformLocation(program, 'uFeather'),
			uBiasDirection: gl.getUniformLocation(program, 'uBiasDirection'),
			uBiasAmount: gl.getUniformLocation(program, 'uBiasAmount'),
		},
	};
};

export const noiseDisplacement = createEffect<
	NoiseDisplacementParams,
	NoiseDisplacementState
>({
	type: 'dev.remotion.effects.noiseDisplacement',
	label: 'noiseDisplacement()',
	documentationLink: 'https://www.remotion.dev/docs/effects/noise-displacement',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `noise-displacement-${r.center.join(':')}-${r.radius}-${r.strength}-${r.seed}-${r.grainSize}-${r.passes}-${r.blur}-${r.feather}-${r.biasDirection}-${r.biasAmount}`;
	},
	setup: (target) => setupNoiseDisplacement(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, texture, vao, uniforms} = state;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
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
		if (uniforms.uResolution) gl.uniform2f(uniforms.uResolution, width, height);
		if (uniforms.uCenter)
			gl.uniform2f(uniforms.uCenter, r.center[0], r.center[1]);
		if (uniforms.uRadius) gl.uniform1f(uniforms.uRadius, r.radius);
		if (uniforms.uStrength) gl.uniform1f(uniforms.uStrength, r.strength);
		if (uniforms.uSeed) gl.uniform1f(uniforms.uSeed, r.seed);
		if (uniforms.uGrainSize) gl.uniform1f(uniforms.uGrainSize, r.grainSize);
		if (uniforms.uPasses) gl.uniform1i(uniforms.uPasses, r.passes);
		if (uniforms.uBlur) gl.uniform1f(uniforms.uBlur, r.blur);
		if (uniforms.uFeather) gl.uniform1f(uniforms.uFeather, r.feather);
		if (uniforms.uBiasDirection)
			gl.uniform1f(uniforms.uBiasDirection, r.biasDirection);
		if (uniforms.uBiasAmount) gl.uniform1f(uniforms.uBiasAmount, r.biasAmount);

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: noiseDisplacementSchema,
	validateParams: validateNoiseDisplacementParams,
});
