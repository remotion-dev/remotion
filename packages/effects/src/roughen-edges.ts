import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 1 as const;
const DEFAULT_BORDER = 26.5 as const;
const DEFAULT_SCALE = 0.07 as const;
const DEFAULT_SEED = 231.2 as const;
const MAX_BORDER = 200 as const;
const MAX_SEED = 1000 as const;
const NOISE_TEXTURE_SIZE = 256;

const roughenEdgesSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	border: {
		type: 'number',
		min: 0,
		max: MAX_BORDER,
		step: 0.1,
		default: DEFAULT_BORDER,
		description: 'Border',
		hiddenFromList: false,
	},
	scale: {
		type: 'number',
		min: 0.01,
		max: 4,
		step: 0.01,
		default: DEFAULT_SCALE,
		description: 'Scale',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		min: 0,
		max: MAX_SEED,
		step: 0.01,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type RoughenEdgesParams = {
	/** Strength of the roughened edge from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
	/** Size of the roughened edge in pixels. Defaults to `26.5`. */
	readonly border?: number;
	/** Scale of the generated edge noise from `0.01` to `4`. Defaults to `0.07`. */
	readonly scale?: number;
	/** Seed for the generated edge pattern from `0` to `1000`. Defaults to `231.2`. */
	readonly seed?: number;
};

type RoughenEdgesResolved = {
	amount: number;
	border: number;
	scale: number;
	seed: number;
};

type RoughenEdgesState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly noiseTexture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uAmount: WebGLUniformLocation | null;
		readonly uBorder: WebGLUniformLocation | null;
		readonly uScale: WebGLUniformLocation | null;
		readonly uSeed: WebGLUniformLocation | null;
		readonly uNoiseTexture: WebGLUniformLocation | null;
	};
	cachedNoiseSeed: number;
};

const resolve = (p: RoughenEdgesParams): RoughenEdgesResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	border: p.border ?? DEFAULT_BORDER,
	scale: p.scale ?? DEFAULT_SCALE,
	seed: p.seed ?? DEFAULT_SEED,
});

const validateAtMost = (value: number, max: number, name: string): void => {
	if (value > max) {
		throw new TypeError(
			`"${name}" must be <= ${max}, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateRoughenEdgesParams = (params: RoughenEdgesParams): void => {
	assertEffectParamsObject(params, 'Roughen edges');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.border, 'border');
	assertOptionalFiniteNumber(params.scale, 'scale');
	assertOptionalFiniteNumber(params.seed, 'seed');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validateNonNegative(r.border, 'border');
	validateAtMost(r.border, MAX_BORDER, 'border');
	if (r.scale <= 0) {
		throw new TypeError(
			`"scale" must be greater than 0, but got ${JSON.stringify(r.scale)}`,
		);
	}

	validateAtMost(r.scale, 4, 'scale');
	validateNonNegative(r.seed, 'seed');
	validateAtMost(r.seed, MAX_SEED, 'seed');
};

const ROUGHEN_EDGES_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Noise helpers adapted from @paper-design/shaders, Apache-2.0.
const ROUGHEN_EDGES_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uBorder;
uniform float uScale;
uniform float uSeed;
uniform sampler2D uNoiseTexture;

float sampleAlpha(vec2 uv) {
	return texture(uSource, clamp(uv, vec2(0.0), vec2(1.0))).a;
}

vec2 seedOffset(float salt) {
	float seeded = uSeed + salt;
	return fract(
		sin(
			vec2(
				seeded * 12.9898 + 78.233,
				seeded * 39.3468 + 11.135
			)
		) * 43758.5453
	);
}

float randomR(vec2 p) {
	vec2 uv = floor(p) / 100.0 + 0.5;
	return texture(uNoiseTexture, fract(uv)).r;
}

float valueNoise(vec2 st) {
	vec2 i = floor(st);
	vec2 f = fract(st);
	float a = randomR(i);
	float b = randomR(i + vec2(1.0, 0.0));
	float c = randomR(i + vec2(0.0, 1.0));
	float d = randomR(i + vec2(1.0, 1.0));
	vec2 u = f * f * (3.0 - 2.0 * f);
	float x1 = mix(a, b, u.x);
	float x2 = mix(c, d, u.x);
	return mix(x1, x2, u.y);
}

float fbm(vec2 n) {
	float total = 0.0;
	float amplitude = 0.5;
	for (int i = 0; i < 4; i++) {
		total += valueNoise(n) * amplitude;
		n *= 2.03;
		amplitude *= 0.55;
	}
	return total;
}

void addAlphaSample(
	vec2 uv,
	vec2 offset,
	inout float minAlpha,
	inout float maxAlpha
) {
	float alpha = sampleAlpha(uv + offset);
	minAlpha = min(minAlpha, alpha);
	maxAlpha = max(maxAlpha, alpha);
}

float edgeProximity(vec2 uv, float alpha) {
	if (uBorder <= 0.0) {
		return 0.0;
	}

	vec2 reach = max(uBorder, 1.0) / uResolution;
	float minAlpha = alpha;
	float maxAlpha = alpha;

	addAlphaSample(uv, vec2(reach.x, 0.0), minAlpha, maxAlpha);
	addAlphaSample(uv, vec2(-reach.x, 0.0), minAlpha, maxAlpha);
	addAlphaSample(uv, vec2(0.0, reach.y), minAlpha, maxAlpha);
	addAlphaSample(uv, vec2(0.0, -reach.y), minAlpha, maxAlpha);
	addAlphaSample(uv, vec2(reach.x, reach.y), minAlpha, maxAlpha);
	addAlphaSample(uv, vec2(-reach.x, reach.y), minAlpha, maxAlpha);
	addAlphaSample(uv, vec2(reach.x, -reach.y), minAlpha, maxAlpha);
	addAlphaSample(uv, vec2(-reach.x, -reach.y), minAlpha, maxAlpha);

	return smoothstep(0.02, 0.35, maxAlpha - minAlpha);
}

vec2 alphaGradient(vec2 uv) {
	vec2 reach = max(uBorder * 0.25, 1.0) / uResolution;
	return vec2(
		sampleAlpha(uv + vec2(reach.x, 0.0)) -
			sampleAlpha(uv - vec2(reach.x, 0.0)),
		sampleAlpha(uv + vec2(0.0, reach.y)) -
			sampleAlpha(uv - vec2(0.0, reach.y))
	);
}

float edgeNoise(vec2 uv, float salt) {
	vec2 patternUV = uv - 0.5;
	patternUV *= vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
	patternUV *= 7.0 / max(uScale, 0.001);
	patternUV += 64.0 * seedOffset(salt);
	return fbm(patternUV);
}

void main() {
	vec4 source = texture(uSource, vUv);

	if (uAmount <= 0.0 || uBorder <= 0.0) {
		fragColor = source;
		return;
	}

	float alpha = source.a;
	float proximity = edgeProximity(vUv, alpha);

	if (proximity <= 0.001) {
		fragColor = source;
		return;
	}

	vec2 gradient = alphaGradient(vUv);
	vec2 noiseVector = vec2(
		edgeNoise(vUv + vec2(0.17, 0.0), 2.0),
		edgeNoise(vUv + vec2(0.0, 0.31), 3.0)
	) * 2.0 - 1.0;
	vec2 direction = gradient + 0.7 * noiseVector;
	if (length(direction) <= 0.0001) {
		direction = length(noiseVector) <= 0.0001 ? vec2(1.0, 0.0) : noiseVector;
	}

	direction = normalize(direction);

	float scalar = edgeNoise(vUv, 4.0) * 2.0 - 1.0;
	vec2 offset = direction * scalar * uBorder / uResolution;
	vec4 roughened = texture(
		uSource,
		clamp(vUv + offset, vec2(0.0), vec2(1.0))
	);
	float blend = clamp(proximity * uAmount, 0.0, 1.0);

	fragColor = mix(source, roughened, blend);
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
			`Roughen edges shader compile failed: ${log ?? '(no log)'}`,
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
		throw new Error(`Roughen edges program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createSourceTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
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

const initialNoiseState = (seed: number): number => {
	const scaledSeed = Math.round(seed * 1000);
	const mixedState = (0x9e3779b9 ^ Math.imul(scaledSeed, 0x85ebca6b)) >>> 0;
	return mixedState === 0 ? 0x9e3779b9 : mixedState;
};

const nextNoiseState = (state: number): number => {
	let next = state;
	next ^= next << 13;
	next ^= next >>> 17;
	next ^= next << 5;
	return next >>> 0;
};

const createNoiseData = (seed: number): Uint8Array => {
	const data = new Uint8Array(NOISE_TEXTURE_SIZE * NOISE_TEXTURE_SIZE * 4);
	let state = initialNoiseState(seed);
	for (let i = 0; i < data.length; i += 4) {
		state = nextNoiseState(state);
		data[i] = state & 0xff;
		state = nextNoiseState(state);
		data[i + 1] = state & 0xff;
		state = nextNoiseState(state);
		data[i + 2] = state & 0xff;
		data[i + 3] = 255;
	}

	return data;
};

const uploadNoiseTexture = (
	gl: WebGL2RenderingContext,
	texture: WebGLTexture,
	seed: number,
): void => {
	const data = createNoiseData(seed);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		NOISE_TEXTURE_SIZE,
		NOISE_TEXTURE_SIZE,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		data,
	);
};

const createNoiseTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create WebGL noise texture');
	}

	uploadNoiseTexture(gl, texture, DEFAULT_SEED);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const setupRoughenEdges = (target: HTMLCanvasElement): RoughenEdgesState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('roughen edges effect');
	}

	const vs = compileShader(gl, gl.VERTEX_SHADER, ROUGHEN_EDGES_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, ROUGHEN_EDGES_FS);
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

	const sourceTexture = createSourceTexture(gl);
	const noiseTexture = createNoiseTexture(gl);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	return {
		gl,
		program,
		vao,
		vbo,
		sourceTexture,
		noiseTexture,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uAmount: gl.getUniformLocation(program, 'uAmount'),
			uBorder: gl.getUniformLocation(program, 'uBorder'),
			uScale: gl.getUniformLocation(program, 'uScale'),
			uSeed: gl.getUniformLocation(program, 'uSeed'),
			uNoiseTexture: gl.getUniformLocation(program, 'uNoiseTexture'),
		},
		cachedNoiseSeed: DEFAULT_SEED,
	};
};

export const roughenEdges = createEffect<RoughenEdgesParams, RoughenEdgesState>(
	{
		type: 'dev.remotion.effects.roughen-edges',
		label: 'roughenEdges()',
		documentationLink: 'https://www.remotion.dev/docs/effects/roughen-edges',
		backend: 'webgl2',
		calculateKey: (params) => {
			const r = resolve(params);
			return `roughen-edges-${r.amount}-${r.border}-${r.scale}-${r.seed}`;
		},
		setup: (target) => setupRoughenEdges(target),
		apply: ({source, width, height, params, state, flipSourceY}) => {
			const r = resolve(params);
			const {gl, program, vao, sourceTexture, noiseTexture, uniforms} = state;

			gl.viewport(0, 0, width, height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(program);
			gl.bindVertexArray(vao);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				source as TexImageSource,
			);

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
			if (state.cachedNoiseSeed !== r.seed) {
				uploadNoiseTexture(gl, noiseTexture, r.seed);
				state.cachedNoiseSeed = r.seed;
			}

			if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
			if (uniforms.uResolution)
				gl.uniform2f(uniforms.uResolution, width, height);
			if (uniforms.uAmount) gl.uniform1f(uniforms.uAmount, r.amount);
			if (uniforms.uBorder) gl.uniform1f(uniforms.uBorder, r.border);
			if (uniforms.uScale) gl.uniform1f(uniforms.uScale, r.scale);
			if (uniforms.uSeed) gl.uniform1f(uniforms.uSeed, r.seed);
			if (uniforms.uNoiseTexture) gl.uniform1i(uniforms.uNoiseTexture, 1);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			gl.bindVertexArray(null);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.useProgram(null);
		},
		cleanup: ({gl, program, vao, vbo, sourceTexture, noiseTexture}) => {
			gl.deleteTexture(sourceTexture);
			gl.deleteTexture(noiseTexture);
			gl.deleteBuffer(vbo);
			gl.deleteProgram(program);
			gl.deleteVertexArray(vao);
		},
		schema: roughenEdgesSchema,
		validateParams: validateRoughenEdgesParams,
	},
);
