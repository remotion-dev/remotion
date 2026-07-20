import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {assertOptionalFiniteNumber} from './color-utils.js';
import {publicUvToShaderUv} from './uv-coordinate.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_X = 20 as const;
const DEFAULT_Y = 0 as const;
const DEFAULT_ORIGIN = [0.5, 0.5] as const;
const MAX_ABSOLUTE_ANGLE = 89 as const;

const skewSchema = {
	x: {
		type: 'rotation-degrees',
		min: -80,
		max: 80,
		step: 1,
		default: DEFAULT_X,
		description: 'X angle',
	},
	y: {
		type: 'rotation-degrees',
		min: -80,
		max: 80,
		step: 1,
		default: DEFAULT_Y,
		description: 'Y angle',
	},
	origin: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_ORIGIN,
		description: 'Origin',
	},
} as const satisfies InteractivitySchema;

export type SkewOrigin = readonly [number, number];

export type SkewParams = {
	/** Horizontal skew angle in degrees. Defaults to `20`. */
	readonly x?: number;
	/** Vertical skew angle in degrees. Defaults to `0`. */
	readonly y?: number;
	/** Origin of the skew in UV coordinates. Defaults to `[0.5, 0.5]`. */
	readonly origin?: SkewOrigin;
};

type SkewResolved = {
	readonly x: number;
	readonly y: number;
	readonly origin: SkewOrigin;
};

type SkewState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uSkew: WebGLUniformLocation | null;
	readonly uOrigin: WebGLUniformLocation | null;
};

const resolve = (params: SkewParams): SkewResolved => ({
	x: params.x ?? DEFAULT_X,
	y: params.y ?? DEFAULT_Y,
	origin: [...(params.origin ?? DEFAULT_ORIGIN)] as SkewOrigin,
});

const assertOptionalUvCoordinate = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		value.some((item) => typeof item !== 'number' || !Number.isFinite(item))
	) {
		throw new TypeError(`"${name}" must be a [number, number] tuple`);
	}
};

const validateUvCoordinate = (value: number, name: string): void => {
	if (value < 0 || value > 1) {
		throw new TypeError(
			`"${name}" must be between 0 and 1, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateAngle = (value: number, name: string): void => {
	if (Math.abs(value) >= MAX_ABSOLUTE_ANGLE) {
		throw new TypeError(
			`"${name}" must be greater than -${MAX_ABSOLUTE_ANGLE} and less than ${MAX_ABSOLUTE_ANGLE}, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateSkewParams = (params: SkewParams): void => {
	assertEffectParamsObject(params, 'Skew');
	assertOptionalFiniteNumber(params.x, 'x');
	assertOptionalFiniteNumber(params.y, 'y');
	assertOptionalUvCoordinate(params.origin, 'origin');
	const resolved = resolve(params);
	validateAngle(resolved.x, 'x');
	validateAngle(resolved.y, 'y');
	validateUvCoordinate(resolved.origin[0], 'origin[0]');
	validateUvCoordinate(resolved.origin[1], 'origin[1]');
};

const SKEW_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SKEW_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uSkew;
uniform vec2 uOrigin;

void main() {
	vec2 destination = (vUv - uOrigin) * uResolution;

	// Invert a horizontal skew followed by a vertical skew.
	float sourceY = destination.y - uSkew.y * destination.x;
	float sourceX = destination.x - uSkew.x * sourceY;
	vec2 sourceUv = vec2(sourceX, sourceY) / uResolution + uOrigin;

	if (any(lessThan(sourceUv, vec2(0.0))) || any(greaterThan(sourceUv, vec2(1.0)))) {
		fragColor = vec4(0.0);
		return;
	}

	fragColor = texture(uSource, sourceUv);
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
		throw new Error(`Skew shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const setupSkew = (target: HTMLCanvasElement): SkewState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('skew effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, SKEW_VS);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, SKEW_FS);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Skew program link failed: ${log ?? '(no log)'}`);
	}

	const vao = gl.createVertexArray();
	const vbo = gl.createBuffer();
	if (!vao || !vbo) {
		throw new Error('Failed to create WebGL geometry');
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
		uSkew: gl.getUniformLocation(program, 'uSkew'),
		uOrigin: gl.getUniformLocation(program, 'uOrigin'),
	};
};

export const skew = createEffect<SkewParams, SkewState>({
	type: 'dev.remotion.effects.skew',
	label: 'skew()',
	documentationLink: 'https://www.remotion.dev/docs/effects/skew',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `skew-${resolved.x}-${resolved.y}-${resolved.origin[0]}-${resolved.origin[1]}`;
	},
	setup: setupSkew,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);
		const radians = Math.PI / 180;
		const {gl} = state;
		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(state.program);
		gl.bindVertexArray(state.vao);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, state.texture);
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
		if (state.uSkew) {
			gl.uniform2f(
				state.uSkew,
				Math.tan(resolved.x * radians),
				Math.tan(resolved.y * radians),
			);
		}

		if (state.uOrigin) {
			const [originX, originY] = publicUvToShaderUv(resolved.origin);
			gl.uniform2f(state.uOrigin, originX, originY);
		}

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
	schema: skewSchema,
	validateParams: validateSkewParams,
});
