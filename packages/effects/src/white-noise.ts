import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 1 as const;
const DEFAULT_SEED = 0 as const;

const whiteNoiseSchema = {
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
} as const satisfies InteractivitySchema;

export type WhiteNoiseParams = {
	/** Blend amount from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
	/** Seed for the random noise pattern. Defaults to `0`. */
	readonly seed?: number;
};

type WhiteNoiseResolved = {
	amount: number;
	seed: number;
};

const resolve = (params: WhiteNoiseParams): WhiteNoiseResolved => ({
	amount: params.amount ?? DEFAULT_AMOUNT,
	seed: params.seed ?? DEFAULT_SEED,
});

const validateWhiteNoiseParams = (params: WhiteNoiseParams): void => {
	assertEffectParamsObject(params, 'White noise');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.seed, 'seed');
	validateUnitInterval(params.amount ?? DEFAULT_AMOUNT, 'amount');
};

type WhiteNoiseState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAmount;
uniform float uSeed;

float random(vec2 co) {
	return fract(sin(dot(co, vec2(12.9898, 78.233)) + uSeed * 37.719) * 43758.5453);
}

void main() {
	vec4 color = texture(uSource, vUv);
	float noise = random(gl_FragCoord.xy);
	vec3 unpremultiplied = color.a == 0.0 ? vec3(0.0) : color.rgb / color.a;
	vec3 mixed = mix(unpremultiplied, vec3(noise), uAmount);
	fragColor = vec4(mixed * color.a, color.a);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader) ?? 'Unknown shader compile error';
		gl.deleteShader(shader);
		throw new Error(info);
	}

	return shader;
};

const createProgram = (
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram => {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create program');
	}

	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program) ?? 'Unknown program link error';
		gl.deleteProgram(program);
		throw new Error(info);
	}

	return program;
};

const createWhiteNoiseState = (
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WhiteNoiseState => {
	const program = createProgram(gl, vertexSource, fragmentSource);
	const vao = gl.createVertexArray();
	const vbo = gl.createBuffer();
	const texture = gl.createTexture();

	if (!vao || !vbo || !texture) {
		throw new Error('Failed to create WebGL resources');
	}

	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);

	const aPos = gl.getAttribLocation(program, 'aPos');
	const aUv = gl.getAttribLocation(program, 'aUv');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(aUv);
	gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	return {
		gl,
		program,
		vao,
		vbo,
		texture,
		uSource: gl.getUniformLocation(program, 'uSource'),
		uAmount: gl.getUniformLocation(program, 'uAmount'),
		uSeed: gl.getUniformLocation(program, 'uSeed'),
	};
};

export const whiteNoise = createEffect<WhiteNoiseParams, WhiteNoiseState>({
	type: 'dev.remotion.effects.whiteNoise',
	label: 'whiteNoise()',
	documentationLink: 'https://www.remotion.dev/docs/effects/white-noise',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `white-noise-${resolved.amount}-${resolved.seed}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('white noise effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		return createWhiteNoiseState(gl, VERTEX_SHADER, FRAGMENT_SHADER);
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);

		state.gl.viewport(0, 0, width, height);
		state.gl.bindFramebuffer(state.gl.FRAMEBUFFER, null);
		state.gl.activeTexture(state.gl.TEXTURE0);
		state.gl.bindTexture(state.gl.TEXTURE_2D, state.texture);
		state.gl.pixelStorei(state.gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		state.gl.texImage2D(
			state.gl.TEXTURE_2D,
			0,
			state.gl.RGBA,
			state.gl.RGBA,
			state.gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		state.gl.useProgram(state.program);
		if (state.uSource) {
			state.gl.uniform1i(state.uSource, 0);
		}

		if (state.uAmount) {
			state.gl.uniform1f(state.uAmount, resolved.amount);
		}

		if (state.uSeed) {
			state.gl.uniform1f(state.uSeed, resolved.seed);
		}

		state.gl.bindVertexArray(state.vao);
		state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, 4);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: whiteNoiseSchema,
	validateParams: validateWhiteNoiseParams,
});
