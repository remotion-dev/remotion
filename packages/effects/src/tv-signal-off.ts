import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 1 as const;

const tvSignalOffSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type TvSignalOffParams = {
	/** Blend amount from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
};

type TvSignalOffResolved = {
	amount: number;
};

const resolve = (params: TvSignalOffParams): TvSignalOffResolved => ({
	amount: params.amount ?? DEFAULT_AMOUNT,
});

const validateTvSignalOffParams = (params: TvSignalOffParams): void => {
	assertEffectParamsObject(params, 'TV signal off');
	assertOptionalFiniteNumber(params.amount, 'amount');
	validateUnitInterval(params.amount ?? DEFAULT_AMOUNT, 'amount');
};

type TvSignalOffState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
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

vec3 topBar(float x) {
	if (x < 1.0 / 7.0) return vec3(0.74);
	if (x < 2.0 / 7.0) return vec3(1.0, 1.0, 0.0);
	if (x < 3.0 / 7.0) return vec3(0.0, 1.0, 1.0);
	if (x < 4.0 / 7.0) return vec3(0.0, 1.0, 0.0);
	if (x < 5.0 / 7.0) return vec3(1.0, 0.0, 1.0);
	if (x < 6.0 / 7.0) return vec3(1.0, 0.0, 0.0);
	return vec3(0.0, 0.0, 1.0);
}

vec3 middleBar(float x) {
	if (x < 1.0 / 7.0) return vec3(0.0, 0.0, 1.0);
	if (x < 2.0 / 7.0) return vec3(0.0);
	if (x < 3.0 / 7.0) return vec3(1.0, 0.0, 1.0);
	if (x < 4.0 / 7.0) return vec3(0.0);
	if (x < 5.0 / 7.0) return vec3(0.0, 1.0, 1.0);
	if (x < 6.0 / 7.0) return vec3(0.0);
	return vec3(0.74);
}

vec3 tvPattern(vec2 uv) {
	if (uv.y < 0.64) {
		return topBar(uv.x);
	}

	if (uv.y < 0.76) {
		return middleBar(uv.x);
	}

	if (uv.y < 0.88) {
		if (uv.x < 0.58) return vec3(1.0);
		float ramp = smoothstep(0.58, 1.0, uv.x);
		return vec3(1.0 - ramp);
	}

	if (uv.x < 0.58) {
		float stepValue = floor(uv.x * 12.0) / 11.0;
		return vec3(stepValue);
	}

	return vec3(0.0);
}

void main() {
	vec4 color = texture(uSource, vUv);
	vec3 sourceColor = color.a == 0.0 ? vec3(0.0) : color.rgb / color.a;
	vec3 bars = tvPattern(vUv);
	vec3 mixed = mix(sourceColor, bars, uAmount);

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

const createTvSignalOffState = (
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): TvSignalOffState => {
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
	};
};

export const tvSignalOff = createEffect<TvSignalOffParams, TvSignalOffState>({
	type: 'dev.remotion.effects.tvSignalOff',
	label: 'tvSignalOff()',
	documentationLink: 'https://www.remotion.dev/docs/effects/tv-signal-off',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `tv-signal-off-${resolved.amount}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('TV signal off effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		return createTvSignalOffState(gl, VERTEX_SHADER, FRAGMENT_SHADER);
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

		state.gl.bindVertexArray(state.vao);
		state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, 4);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: tvSignalOffSchema,
	validateParams: validateTvSignalOffParams,
});
