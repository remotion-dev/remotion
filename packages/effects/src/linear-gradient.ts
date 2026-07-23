import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {parseColorRgba, type ParsedColorRgba} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_START = [0, 0.5] as const;
const DEFAULT_END = [1, 0.5] as const;
const DEFAULT_START_COLOR = '#000000' as const;
const DEFAULT_END_COLOR = '#ffffff' as const;

export type LinearGradientUvCoordinate = readonly [number, number];

export type LinearGradientParams = {
	/**
	 * UV coordinate where `startColor` is reached. Defaults to `[0, 0.5]`.
	 */
	readonly start?: LinearGradientUvCoordinate;
	/**
	 * UV coordinate where `endColor` is reached. Defaults to `[1, 0.5]`.
	 */
	readonly end?: LinearGradientUvCoordinate;
	/**
	 * Color at `start`. Defaults to black.
	 */
	readonly startColor?: string;
	/**
	 * Color at `end`. Defaults to white.
	 */
	readonly endColor?: string;
};

type LinearGradientResolved = {
	readonly start: LinearGradientUvCoordinate;
	readonly end: LinearGradientUvCoordinate;
	readonly startColor: string;
	readonly endColor: string;
};

type LinearGradientState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly uniforms: {
		readonly uStart: WebGLUniformLocation | null;
		readonly uEnd: WebGLUniformLocation | null;
		readonly uStartColor: WebGLUniformLocation | null;
		readonly uEndColor: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedStartColor: string;
	cachedStartColorRgba: ParsedColorRgba;
	cachedEndColor: string;
	cachedEndColorRgba: ParsedColorRgba;
};

const linearGradientSchema = {
	start: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_START,
		description: 'Start',
		visual: {
			type: 'line',
			to: 'end',
		},
	},
	end: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_END,
		description: 'End',
	},
	startColor: {
		type: 'color',
		default: DEFAULT_START_COLOR,
		description: 'Start color',
	},
	endColor: {
		type: 'color',
		default: DEFAULT_END_COLOR,
		description: 'End color',
	},
} as const satisfies InteractivitySchema;

const resolve = (p: LinearGradientParams): LinearGradientResolved => ({
	start: [...(p.start ?? DEFAULT_START)] as LinearGradientUvCoordinate,
	end: [...(p.end ?? DEFAULT_END)] as LinearGradientUvCoordinate,
	startColor: p.startColor ?? DEFAULT_START_COLOR,
	endColor: p.endColor ?? DEFAULT_END_COLOR,
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

const validateLinearGradientParams = (params: LinearGradientParams): void => {
	assertEffectParamsObject(params, 'Linear gradient');
	assertOptionalUvCoordinate(params.start, 'start');
	assertOptionalUvCoordinate(params.end, 'end');
	assertOptionalColor(params.startColor, 'startColor');
	assertOptionalColor(params.endColor, 'endColor');
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

uniform vec2 uStart;
uniform vec2 uEnd;
uniform vec4 uStartColor;
uniform vec4 uEndColor;

float gradientProgress(vec2 uv) {
	vec2 gradient = uEnd - uStart;
	float gradientLengthSq = dot(gradient, gradient);
	if (gradientLengthSq <= 0.0000001) {
		return 0.0;
	}

	return clamp(dot(uv - uStart, gradient) / gradientLengthSq, 0.0, 1.0);
}

void main() {
	vec2 publicUv = vec2(vUv.x, 1.0 - vUv.y);
	vec4 color = mix(uStartColor, uEndColor, gradientProgress(publicUv));
	fragColor = vec4(color.rgb * color.a, color.a);
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
			`Linear gradient shader compile failed: ${log ?? '(no log)'}`,
		);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(
			`Linear gradient program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

const setupLinearGradient = (
	target: HTMLCanvasElement,
): LinearGradientState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('linear gradient effect');
	}

	const program = createProgram(gl);

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

	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx) {
		throw new Error('Failed to acquire 2D context for color parsing');
	}

	return {
		gl,
		program,
		vao,
		vbo,
		uniforms: {
			uStart: gl.getUniformLocation(program, 'uStart'),
			uEnd: gl.getUniformLocation(program, 'uEnd'),
			uStartColor: gl.getUniformLocation(program, 'uStartColor'),
			uEndColor: gl.getUniformLocation(program, 'uEndColor'),
		},
		colorCtx,
		cachedStartColor: '',
		cachedStartColorRgba: [0, 0, 0, 255],
		cachedEndColor: '',
		cachedEndColorRgba: [255, 255, 255, 255],
	};
};

const normalizedRgba = (
	color: ParsedColorRgba,
): readonly [number, number, number, number] => {
	return [color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255];
};

const getParsedColors = (
	state: LinearGradientState,
	resolved: LinearGradientResolved,
): {
	start: ParsedColorRgba;
	end: ParsedColorRgba;
} => {
	if (state.cachedStartColor !== resolved.startColor) {
		state.cachedStartColor = resolved.startColor;
		state.cachedStartColorRgba = parseColorRgba(
			state.colorCtx,
			resolved.startColor,
		);
	}

	if (state.cachedEndColor !== resolved.endColor) {
		state.cachedEndColor = resolved.endColor;
		state.cachedEndColorRgba = parseColorRgba(
			state.colorCtx,
			resolved.endColor,
		);
	}

	return {
		start: state.cachedStartColorRgba,
		end: state.cachedEndColorRgba,
	};
};

export const linearGradient = createEffect<
	LinearGradientParams,
	LinearGradientState
>({
	type: 'dev.remotion.effects.linearGradient',
	label: 'linearGradient()',
	documentationLink: 'https://www.remotion.dev/docs/effects/linear-gradient',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `linear-gradient-${r.start.join(':')}-${r.end.join(':')}-${r.startColor}-${r.endColor}`;
	},
	setup: (target) => setupLinearGradient(target),
	apply: ({width, height, params, state}) => {
		const r = resolve(params);
		const {start, end} = getParsedColors(state, r);
		const [sr, sg, sb, sa] = normalizedRgba(start);
		const [er, eg, eb, ea] = normalizedRgba(end);
		const {gl, program, uniforms, vao} = state;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);

		if (uniforms.uStart) gl.uniform2f(uniforms.uStart, r.start[0], r.start[1]);
		if (uniforms.uEnd) gl.uniform2f(uniforms.uEnd, r.end[0], r.end[1]);
		if (uniforms.uStartColor) {
			gl.uniform4f(uniforms.uStartColor, sr, sg, sb, sa);
		}

		if (uniforms.uEndColor) {
			gl.uniform4f(uniforms.uEndColor, er, eg, eb, ea);
		}

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo}) => {
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: linearGradientSchema,
	validateParams: validateLinearGradientParams,
});
