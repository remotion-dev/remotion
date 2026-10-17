import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
} from '../validate-effect-param.js';
import {LENS_BLUR_FRAGMENT_SHADER} from './shader.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_RADIUS = 10 as const;
const DEFAULT_IRIS_SHAPE = 'hexagon' as const;
const DEFAULT_IRIS_ROUNDNESS = 0 as const;
const DEFAULT_IRIS_ROTATION = 0 as const;
const DEFAULT_IRIS_ASPECT_RATIO = 1 as const;
const DEFAULT_HIGHLIGHT_GAIN = 0 as const;
const DEFAULT_HIGHLIGHT_THRESHOLD = 1 as const;
const DEFAULT_HIGHLIGHT_SATURATION = 1 as const;
const DEFAULT_REPEAT_EDGE_PIXELS = false as const;
const DEFAULT_SAMPLES = 256 as const;
const DEFAULT_LINEAR_LIGHT = false as const;
const IRIS_SHAPES = [
	'triangle',
	'square',
	'pentagon',
	'hexagon',
	'heptagon',
	'octagon',
	'nonagon',
	'decagon',
	'circle',
] as const;

const lensBlurSchema = {
	radius: {
		type: 'number',
		default: DEFAULT_RADIUS,
		description: 'Blur radius in pixels',
		min: 0,
		max: 200,
		step: 1,
		hiddenFromList: false,
	},
	irisShape: {
		type: 'enum',
		default: DEFAULT_IRIS_SHAPE,
		description: 'Iris shape',
		variants: {
			triangle: {},
			square: {},
			pentagon: {},
			hexagon: {},
			heptagon: {},
			octagon: {},
			nonagon: {},
			decagon: {},
			circle: {},
		},
	},
	irisRoundness: {
		type: 'number',
		default: DEFAULT_IRIS_ROUNDNESS,
		description: 'Roundness of the iris, from 0 (polygon) to 1 (circle)',
		min: 0,
		max: 1,
		step: 0.01,
		hiddenFromList: false,
	},
	irisRotation: {
		type: 'rotation-degrees',
		default: DEFAULT_IRIS_ROTATION,
		description: 'Clockwise iris rotation in degrees',
		step: 1,
	},
	irisAspectRatio: {
		type: 'number',
		default: DEFAULT_IRIS_ASPECT_RATIO,
		description: 'Horizontal stretch of the iris',
		min: 0.01,
		max: 4,
		step: 0.01,
		hiddenFromList: false,
	},
	highlightGain: {
		type: 'number',
		default: DEFAULT_HIGHLIGHT_GAIN,
		description: 'Additional brightness of highlights, from 0 to 1',
		min: 0,
		max: 1,
		step: 0.01,
		hiddenFromList: false,
	},
	highlightThreshold: {
		type: 'number',
		default: DEFAULT_HIGHLIGHT_THRESHOLD,
		description: 'Minimum luminance for highlight gain, from 0 to 1',
		min: 0,
		max: 1,
		step: 0.01,
		hiddenFromList: false,
	},
	highlightSaturation: {
		type: 'number',
		default: DEFAULT_HIGHLIGHT_SATURATION,
		description: 'Saturation of added highlight brightness, from 0 to 1',
		min: 0,
		max: 1,
		step: 0.01,
		hiddenFromList: false,
	},
	repeatEdgePixels: {
		type: 'boolean',
		default: DEFAULT_REPEAT_EDGE_PIXELS,
		description:
			'Repeat edge pixels outside the source instead of sampling transparency',
	},
	samples: {
		type: 'number',
		default: DEFAULT_SAMPLES,
		description: 'Number of aperture samples, from 16 to 2048',
		min: 16,
		max: 2048,
		step: 1,
		hiddenFromList: false,
		integer: true,
	},
	linearLight: {
		type: 'boolean',
		default: DEFAULT_LINEAR_LIGHT,
		description: 'Average colors in linear light',
	},
} as const satisfies InteractivitySchema;

export type LensBlurIrisShape = (typeof IRIS_SHAPES)[number];

export type LensBlurParams = {
	/** Blur radius in pixels. Defaults to `10`. */
	readonly radius?: number;
	/** Iris shape. Defaults to `hexagon`. */
	readonly irisShape?: LensBlurIrisShape;
	/** Roundness of the iris, from 0 (polygon) to 1 (circle). Defaults to `0`. */
	readonly irisRoundness?: number;
	/** Clockwise iris rotation in degrees. Defaults to `0`. */
	readonly irisRotation?: number;
	/** Horizontal stretch of the iris. Must be greater than zero. Defaults to `1`. */
	readonly irisAspectRatio?: number;
	/** Additional brightness of highlights, from 0 to 1. Defaults to `0`. */
	readonly highlightGain?: number;
	/** Minimum luminance for highlight gain, from 0 to 1. Defaults to `1`. */
	readonly highlightThreshold?: number;
	/** Saturation of added highlight brightness, from 0 to 1. Defaults to `1`. */
	readonly highlightSaturation?: number;
	/** Repeat edge pixels outside the source instead of sampling transparency. Defaults to `false`. */
	readonly repeatEdgePixels?: boolean;
	/** Number of aperture samples, from 16 to 2048. Higher values reduce grain. Defaults to `256`. */
	readonly samples?: number;
	/** Average colors in linear light. Defaults to `false`. */
	readonly linearLight?: boolean;
};

type LensBlurResolved = Required<LensBlurParams>;

const resolve = (p: LensBlurParams): LensBlurResolved => ({
	radius: p.radius ?? DEFAULT_RADIUS,
	irisShape: p.irisShape ?? DEFAULT_IRIS_SHAPE,
	irisRoundness: p.irisRoundness ?? DEFAULT_IRIS_ROUNDNESS,
	irisRotation: p.irisRotation ?? DEFAULT_IRIS_ROTATION,
	irisAspectRatio: p.irisAspectRatio ?? DEFAULT_IRIS_ASPECT_RATIO,
	highlightGain: p.highlightGain ?? DEFAULT_HIGHLIGHT_GAIN,
	highlightThreshold: p.highlightThreshold ?? DEFAULT_HIGHLIGHT_THRESHOLD,
	highlightSaturation: p.highlightSaturation ?? DEFAULT_HIGHLIGHT_SATURATION,
	repeatEdgePixels: p.repeatEdgePixels ?? DEFAULT_REPEAT_EDGE_PIXELS,
	samples: p.samples ?? DEFAULT_SAMPLES,
	linearLight: p.linearLight ?? DEFAULT_LINEAR_LIGHT,
});

const validateLensBlurParams = (params: LensBlurParams): void => {
	assertEffectParamsObject(params, 'Lens blur');
	assertOptionalFiniteNumber(params.radius, 'radius');
	assertOptionalFiniteNumber(params.irisRoundness, 'irisRoundness');
	assertOptionalFiniteNumber(params.irisRotation, 'irisRotation');
	assertOptionalFiniteNumber(params.irisAspectRatio, 'irisAspectRatio');
	assertOptionalFiniteNumber(params.highlightGain, 'highlightGain');
	assertOptionalFiniteNumber(params.highlightThreshold, 'highlightThreshold');
	assertOptionalFiniteNumber(params.highlightSaturation, 'highlightSaturation');
	assertOptionalBoolean(params.repeatEdgePixels, 'repeatEdgePixels');
	assertOptionalFiniteNumber(params.samples, 'samples');
	assertOptionalBoolean(params.linearLight, 'linearLight');
	if (
		params.irisShape !== undefined &&
		!IRIS_SHAPES.includes(params.irisShape)
	) {
		throw new TypeError(
			'Invalid irisShape: ' + JSON.stringify(params.irisShape),
		);
	}

	const r = resolve(params);
	validateNonNegative(r.radius, 'radius');
	validateUnitInterval(r.irisRoundness, 'irisRoundness');
	validateUnitInterval(r.highlightGain, 'highlightGain');
	validateUnitInterval(r.highlightThreshold, 'highlightThreshold');
	validateUnitInterval(r.highlightSaturation, 'highlightSaturation');
	if (r.irisAspectRatio <= 0)
		throw new TypeError('"irisAspectRatio" must be greater than zero');
	if (!Number.isInteger(r.samples) || r.samples < 16 || r.samples > 2048)
		throw new TypeError('"samples" must be an integer between 16 and 2048');
};

type LensBlurState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uRadius: WebGLUniformLocation | null;
	readonly uIrisShape: WebGLUniformLocation | null;
	readonly uIrisRoundness: WebGLUniformLocation | null;
	readonly uIrisRotation: WebGLUniformLocation | null;
	readonly uIrisAspectRatio: WebGLUniformLocation | null;
	readonly uHighlightGain: WebGLUniformLocation | null;
	readonly uHighlightThreshold: WebGLUniformLocation | null;
	readonly uHighlightSaturation: WebGLUniformLocation | null;
	readonly uRepeatEdgePixels: WebGLUniformLocation | null;
	readonly uSamples: WebGLUniformLocation | null;
	readonly uLinearLight: WebGLUniformLocation | null;
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
		throw new Error(`LensBlur shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`LensBlur program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupLensBlur = (target: HTMLCanvasElement): LensBlurState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('lens blur effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, LENS_BLUR_FRAGMENT_SHADER);
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
		uRadius: gl.getUniformLocation(program, 'uRadius'),
		uIrisShape: gl.getUniformLocation(program, 'uIrisShape'),
		uIrisRoundness: gl.getUniformLocation(program, 'uIrisRoundness'),
		uIrisRotation: gl.getUniformLocation(program, 'uIrisRotation'),
		uIrisAspectRatio: gl.getUniformLocation(program, 'uIrisAspectRatio'),
		uHighlightGain: gl.getUniformLocation(program, 'uHighlightGain'),
		uHighlightThreshold: gl.getUniformLocation(program, 'uHighlightThreshold'),
		uHighlightSaturation: gl.getUniformLocation(
			program,
			'uHighlightSaturation',
		),
		uRepeatEdgePixels: gl.getUniformLocation(program, 'uRepeatEdgePixels'),
		uSamples: gl.getUniformLocation(program, 'uSamples'),
		uLinearLight: gl.getUniformLocation(program, 'uLinearLight'),
	};
};

export const lensBlur = createEffect<LensBlurParams, LensBlurState>({
	type: 'remotion/lens-blur',
	label: 'lensBlur()',
	documentationLink: 'https://www.remotion.dev/docs/effects/lens-blur',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `lens-blur-${JSON.stringify(r)}`;
	},
	setup: (target) => setupLensBlur(target),
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
		if (state.uRadius) gl.uniform1f(state.uRadius, r.radius);
		if (state.uIrisShape)
			gl.uniform1i(state.uIrisShape, IRIS_SHAPES.indexOf(r.irisShape) + 3);
		if (state.uIrisRoundness)
			gl.uniform1f(state.uIrisRoundness, r.irisRoundness);
		if (state.uIrisRotation)
			gl.uniform1f(
				state.uIrisRotation,
				((r.irisRotation % 360) * Math.PI) / 180,
			);
		if (state.uIrisAspectRatio)
			gl.uniform1f(state.uIrisAspectRatio, r.irisAspectRatio);
		if (state.uHighlightGain)
			gl.uniform1f(state.uHighlightGain, r.highlightGain);
		if (state.uHighlightThreshold)
			gl.uniform1f(state.uHighlightThreshold, r.highlightThreshold);
		if (state.uHighlightSaturation)
			gl.uniform1f(state.uHighlightSaturation, r.highlightSaturation);
		if (state.uRepeatEdgePixels)
			gl.uniform1i(state.uRepeatEdgePixels, r.repeatEdgePixels ? 1 : 0);
		if (state.uSamples) gl.uniform1i(state.uSamples, r.samples);
		if (state.uLinearLight)
			gl.uniform1i(state.uLinearLight, r.linearLight ? 1 : 0);

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
	schema: lensBlurSchema,
	validateParams: validateLensBlurParams,
});
