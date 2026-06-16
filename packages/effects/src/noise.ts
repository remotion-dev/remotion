import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 0.15 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_PREMULTIPLY = false as const;

const noiseSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		step: 1,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	premultiply: {
		type: 'boolean',
		default: DEFAULT_PREMULTIPLY,
		description: 'Premultiply',
	},
} as const satisfies InteractivitySchema;

export type NoiseParams = {
	/** Strength of the noise from `0` to `1`. Defaults to `0.15`. */
	readonly amount?: number;
	/** Seed for the random noise pattern. Defaults to `0`. */
	readonly seed?: number;
	/** Multiply the noise with the input colors before blending. Defaults to `false`. */
	readonly premultiply?: boolean;
};

type NoiseResolved = {
	amount: number;
	seed: number;
	premultiply: boolean;
};

type NoiseState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
	readonly uPremultiply: WebGLUniformLocation | null;
};

const resolve = (p: NoiseParams): NoiseResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	seed: p.seed ?? DEFAULT_SEED,
	premultiply: p.premultiply ?? DEFAULT_PREMULTIPLY,
});

const assertOptionalBoolean = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (typeof value !== 'boolean') {
		throw new TypeError(
			`"${name}" must be a boolean, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateNoiseParams = (params: NoiseParams): void => {
	assertEffectParamsObject(params, 'Noise');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalBoolean(params.premultiply, 'premultiply');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
};

const NOISE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const NOISE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uSeed;
uniform bool uPremultiply;

float random(vec2 co) {
	vec3 p3 = fract(vec3(co.xyx) * 0.1031 + uSeed * 0.0973);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	float noise = random(gl_FragCoord.xy) - 0.5;
	vec3 rgb = texColor.rgb / alpha;
	vec3 noiseLayer = uPremultiply ? rgb * noise : vec3(noise);
	rgb = clamp(rgb + noiseLayer * uAmount, 0.0, 1.0);
	fragColor = vec4(rgb * alpha, alpha);
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
		throw new Error(`Noise shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Noise program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupNoise = (target: HTMLCanvasElement): NoiseState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('noise effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, NOISE_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, NOISE_FS);
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
		uSource: gl.getUniformLocation(program, 'uSource'),
		uResolution: gl.getUniformLocation(program, 'uResolution'),
		uAmount: gl.getUniformLocation(program, 'uAmount'),
		uSeed: gl.getUniformLocation(program, 'uSeed'),
		uPremultiply: gl.getUniformLocation(program, 'uPremultiply'),
	};
};

export const noise = createEffect<NoiseParams, NoiseState>({
	type: 'dev.remotion.effects.noise',
	label: 'noise()',
	documentationLink: 'https://www.remotion.dev/docs/effects/noise',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `noise-${r.amount}-${r.seed}-${r.premultiply ? 1 : 0}`;
	},
	setup: (target) => setupNoise(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, texture, vao} = state;

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
		if (state.uSource) gl.uniform1i(state.uSource, 0);
		if (state.uResolution) gl.uniform2f(state.uResolution, width, height);
		if (state.uAmount) gl.uniform1f(state.uAmount, r.amount);
		if (state.uSeed) gl.uniform1f(state.uSeed, r.seed);
		if (state.uPremultiply)
			gl.uniform1i(state.uPremultiply, r.premultiply ? 1 : 0);

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
	schema: noiseSchema,
	validateParams: validateNoiseParams,
});
