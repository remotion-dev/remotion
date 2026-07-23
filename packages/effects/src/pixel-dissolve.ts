import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_COLUMNS = 10 as const;
const DEFAULT_ROWS = 10 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_FEATHER = 0.15 as const;

const pixelDissolveSchema = {
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	columns: {
		type: 'number',
		min: 1,
		max: 400,
		step: 1,
		default: DEFAULT_COLUMNS,
		description: 'Columns',
		hiddenFromList: false,
	},
	rows: {
		type: 'number',
		min: 1,
		max: 400,
		step: 1,
		default: DEFAULT_ROWS,
		description: 'Rows',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		step: 1,
		default: DEFAULT_SEED,
		description: 'Seed',
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
} as const satisfies InteractivitySchema;

export type PixelDissolveParams = {
	readonly progress?: number;
	readonly columns?: number;
	readonly rows?: number;
	readonly seed?: number;
	readonly feather?: number;
};

type PixelDissolveResolved = {
	readonly progress: number;
	readonly columns: number;
	readonly rows: number;
	readonly seed: number;
	readonly feather: number;
};

const resolve = (params: PixelDissolveParams): PixelDissolveResolved => ({
	progress: params.progress ?? DEFAULT_PROGRESS,
	columns: params.columns ?? DEFAULT_COLUMNS,
	rows: params.rows ?? DEFAULT_ROWS,
	seed: params.seed ?? DEFAULT_SEED,
	feather: params.feather ?? DEFAULT_FEATHER,
});

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

const validatePixelDissolveParams = (params: PixelDissolveParams): void => {
	assertEffectParamsObject(params, 'Pixel Dissolve');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.columns, 'columns');
	assertOptionalFiniteNumber(params.rows, 'rows');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalFiniteNumber(params.feather, 'feather');
	assertOptionalIntegerNumber(params.columns, 'columns');
	assertOptionalIntegerNumber(params.rows, 'rows');

	const r = resolve(params);
	validateUnitInterval(r.progress, 'progress');
	validateUnitInterval(r.feather, 'feather');

	if (r.columns < 1) {
		throw new TypeError(
			`"columns" must be >= 1, but got ${JSON.stringify(r.columns)}`,
		);
	}

	if (r.rows < 1) {
		throw new TypeError(
			`"rows" must be >= 1, but got ${JSON.stringify(r.rows)}`,
		);
	}
};

type PixelDissolveState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uProgress: WebGLUniformLocation | null;
	readonly uColumns: WebGLUniformLocation | null;
	readonly uRows: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
	readonly uFeather: WebGLUniformLocation | null;
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
uniform float uProgress;
uniform float uColumns;
uniform float uRows;
uniform float uSeed;
uniform float uFeather;

float hash21(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1871));
	p3 += dot(p3, p3.yzx + 19.19);
	return fract((p3.x + p3.y) * p3.z);
}

float dissolveMask(float noise, float progress, float feather) {
	float edge = max(feather, 0.0);
	float threshold = 1.0 - clamp(progress, 0.0, 1.0) * (1.0 + edge);

	if (edge <= 0.0001) {
		return 1.0 - step(threshold, noise);
	}

	return 1.0 - smoothstep(threshold, threshold + edge, noise);
}

void main() {
	vec2 divisions = max(vec2(uColumns, uRows), vec2(1.0));
	vec2 gridUv = min(vUv, vec2(1.0) - vec2(0.000001));
	vec2 cell = floor(gridUv * divisions);
	vec4 color = texture(uSource, vUv);

	float noise = hash21(cell + vec2(uSeed, uSeed * 1.618));
	float mask = dissolveMask(noise, uProgress, uFeather);

	fragColor = vec4(color.rgb * mask, color.a * mask);
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
			`Pixel Dissolve shader compile failed: ${log ?? '(no log)'}`,
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
		throw new Error(`Pixel Dissolve program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createFullscreenQuad = (
	gl: WebGL2RenderingContext,
): {
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
} => {
	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create WebGL vertex array');
	}

	gl.bindVertexArray(vao);

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create WebGL buffer');
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);

	return {vao, vbo};
};

export const pixelDissolve = createEffect<
	PixelDissolveParams,
	PixelDissolveState
>({
	type: 'dev.remotion.effects.pixelDissolve',
	label: 'pixelDissolve()',
	documentationLink: 'https://www.remotion.dev/docs/effects/pixel-dissolve',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `pixel-dissolve-${r.progress}-${r.columns}-${r.rows}-${r.seed}-${r.feather}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('pixel dissolve effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		const program = linkProgram(gl, vs, fs);
		gl.deleteShader(vs);
		gl.deleteShader(fs);

		const {vao, vbo} = createFullscreenQuad(gl);
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
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return {
			gl,
			program,
			vao,
			vbo,
			texture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uProgress: gl.getUniformLocation(program, 'uProgress'),
			uColumns: gl.getUniformLocation(program, 'uColumns'),
			uRows: gl.getUniformLocation(program, 'uRows'),
			uSeed: gl.getUniformLocation(program, 'uSeed'),
			uFeather: gl.getUniformLocation(program, 'uFeather'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);

		state.gl.viewport(0, 0, width, height);
		state.gl.bindFramebuffer(state.gl.FRAMEBUFFER, null);
		state.gl.clearColor(0, 0, 0, 0);
		state.gl.clear(state.gl.COLOR_BUFFER_BIT);

		state.gl.useProgram(state.program);
		state.gl.bindVertexArray(state.vao);

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

		if (state.uSource) state.gl.uniform1i(state.uSource, 0);
		if (state.uProgress) state.gl.uniform1f(state.uProgress, r.progress);
		if (state.uColumns) state.gl.uniform1f(state.uColumns, r.columns);
		if (state.uRows) state.gl.uniform1f(state.uRows, r.rows);
		if (state.uSeed) state.gl.uniform1f(state.uSeed, r.seed);
		if (state.uFeather) state.gl.uniform1f(state.uFeather, r.feather);

		state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, 4);

		state.gl.bindVertexArray(null);
		state.gl.bindTexture(state.gl.TEXTURE_2D, null);
		state.gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: pixelDissolveSchema,
	validateParams: validatePixelDissolveParams,
});
