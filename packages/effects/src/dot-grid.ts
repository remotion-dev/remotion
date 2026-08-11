import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_DOT_SIZE = 16 as const;
const DEFAULT_GRID_SIZE = 20 as const;
const DEFAULT_INVERT = false as const;

export const dotGridSchema = {
	dotSize: {
		type: 'number',
		min: 0,
		max: 400,
		step: 1,
		default: DEFAULT_DOT_SIZE,
		description: 'Dot size',
		hiddenFromList: false,
	},
	gridSize: {
		type: 'number',
		min: 1,
		max: 400,
		step: 1,
		default: DEFAULT_GRID_SIZE,
		description: 'Grid size',
		hiddenFromList: false,
	},
	invert: {
		type: 'boolean',
		default: DEFAULT_INVERT,
		description: 'Invert',
	},
} as const satisfies InteractivitySchema;

export type DotGridParams = {
	readonly dotSize?: number;
	readonly gridSize?: number;
	readonly invert?: boolean;
};

type DotGridResolved = {
	dotSize: number;
	gridSize: number;
	invert: boolean;
};

const resolve = (p: DotGridParams): DotGridResolved => ({
	dotSize: p.dotSize ?? DEFAULT_DOT_SIZE,
	gridSize: p.gridSize ?? DEFAULT_GRID_SIZE,
	invert: p.invert ?? DEFAULT_INVERT,
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

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateDotGridParams = (params: DotGridParams): void => {
	assertEffectParamsObject(params, 'Dot grid');
	assertOptionalFiniteNumber(params.dotSize, 'dotSize');
	assertOptionalFiniteNumber(params.gridSize, 'gridSize');
	assertOptionalBoolean(params.invert, 'invert');

	if (params.dotSize !== undefined) {
		validateNonNegative(params.dotSize, 'dotSize');
	}

	if (params.gridSize !== undefined) {
		validatePositive(params.gridSize, 'gridSize');
	}
};

const DOT_GRID_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const DOT_GRID_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uDotSize;
uniform float uGridSize;
uniform bool uInvert;

void main() {
	vec2 fragPos = vUv * uResolution;
	vec2 center = uResolution * 0.5;
	vec2 gridPos = fragPos - center;

	float gridSize = max(uGridSize, 0.001);
	vec2 cellIndex = floor(gridPos / gridSize + 0.5);
	vec2 gridCenter = cellIndex * gridSize;
	vec2 diff = gridPos - gridCenter;

	float radius = uDotSize * 0.5;
	float dotCoverage = radius <= 0.005
		? 0.0
		: 1.0 - smoothstep(radius - 0.75, radius + 0.75, length(diff));
	float coverage = uInvert ? 1.0 - dotCoverage : dotCoverage;

	vec4 texColor = texture(uSource, vUv);
	fragColor = texColor * coverage;
}
`;

type DotGridState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uDotSize: WebGLUniformLocation | null;
	uGridSize: WebGLUniformLocation | null;
	uInvert: WebGLUniformLocation | null;
};

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
		throw new Error(`Dot grid shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Dot grid program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const dotGrid = createEffect<DotGridParams, DotGridState>({
	type: 'dev.remotion.effects.dotGrid',
	label: 'dotGrid()',
	documentationLink: 'https://www.remotion.dev/docs/effects/dot-grid',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `dot-grid-${r.dotSize}-${r.gridSize}-${r.invert ? 1 : 0}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('dot grid effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, DOT_GRID_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, DOT_GRID_FS);
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
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uDotSize: gl.getUniformLocation(program, 'uDotSize'),
			uGridSize: gl.getUniformLocation(program, 'uGridSize'),
			uInvert: gl.getUniformLocation(program, 'uInvert'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture} = state;

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

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

		if (state.uSource) gl.uniform1i(state.uSource, 0);
		if (state.uResolution) gl.uniform2f(state.uResolution, width, height);
		if (state.uDotSize) gl.uniform1f(state.uDotSize, r.dotSize);
		if (state.uGridSize) gl.uniform1f(state.uGridSize, r.gridSize);
		if (state.uInvert) gl.uniform1i(state.uInvert, r.invert ? 1 : 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
		gl.deleteTexture(texture);
	},
	schema: dotGridSchema,
	validateParams: validateDotGridParams,
});
