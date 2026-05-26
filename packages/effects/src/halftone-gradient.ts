import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const HALFTONE_GRADIENT_COLOR_MODES = ['solid', 'source'] as const;

const DEFAULT_FIRST_STOP_DOT_SIZE = 0;
const DEFAULT_SECOND_STOP_DOT_SIZE = 40;
const DEFAULT_GRID_SIZE = 24;
const DEFAULT_ROTATION = 0;
const DEFAULT_DOT_COLOR = 'black';

export const halftoneGradientSchema = {
	firstStopDotSize: {
		type: 'number',
		min: 0,
		max: 400,
		step: 1,
		default: DEFAULT_FIRST_STOP_DOT_SIZE,
		description: 'First stop dot size',
	},
	secondStopDotSize: {
		type: 'number',
		min: 0,
		max: 400,
		step: 1,
		default: DEFAULT_SECOND_STOP_DOT_SIZE,
		description: 'Second stop dot size',
	},
	gridSize: {
		type: 'number',
		min: 1,
		max: 400,
		step: 1,
		default: DEFAULT_GRID_SIZE,
		description: 'Grid size',
	},
	rotation: {
		type: 'number',
		min: -180,
		max: 180,
		step: 1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
	},
	colorMode: {
		type: 'enum',
		default: 'solid' as const,
		description: 'Color mode',
		variants: {
			solid: {
				dotColor: {
					type: 'color',
					default: DEFAULT_DOT_COLOR,
					description: 'Dot color',
				},
			},
			source: {},
		},
	},
} as const satisfies SequenceSchema;

export type HalftoneGradientColorMode =
	(typeof HALFTONE_GRADIENT_COLOR_MODES)[number];

type HalftoneGradientCommonParams = {
	/**
	 * Dot diameter at the first side of the gradient.
	 */
	readonly firstStopDotSize?: number;
	/**
	 * Dot diameter at the opposite side of the gradient.
	 */
	readonly secondStopDotSize?: number;
	/**
	 * Distance between adjacent dot centers.
	 */
	readonly gridSize?: number;
	/**
	 * Rotation of the dot grid and the linear gradient in degrees.
	 */
	readonly rotation?: number;
};

export type HalftoneGradientParams = HalftoneGradientCommonParams &
	(
		| {
				readonly colorMode?: 'solid';
				/** Dot color. Defaults to black. */
				readonly dotColor?: string;
		  }
		| {
				readonly colorMode: 'source';
		  }
	);

type HalftoneGradientResolved = {
	firstStopDotSize: number;
	secondStopDotSize: number;
	gridSize: number;
	rotation: number;
	colorMode: HalftoneGradientColorMode;
	dotColor: string;
};

const formatEnum = (variants: readonly string[]): string => {
	if (variants.length === 2) {
		return `"${variants[0]}" or "${variants[1]}"`;
	}

	return `${variants
		.slice(0, -1)
		.map((variant) => `"${variant}"`)
		.join(', ')} or "${variants[variants.length - 1]}"`;
};

const assertOptionalEnum = <T extends string>(
	value: unknown,
	name: string,
	variants: readonly T[],
): void => {
	if (value === undefined) {
		return;
	}

	if (typeof value !== 'string' || !variants.includes(value as T)) {
		throw new TypeError(`"${name}" must be ${formatEnum(variants)}`);
	}
};

const resolve = (p: HalftoneGradientParams): HalftoneGradientResolved => ({
	firstStopDotSize: p.firstStopDotSize ?? DEFAULT_FIRST_STOP_DOT_SIZE,
	secondStopDotSize: p.secondStopDotSize ?? DEFAULT_SECOND_STOP_DOT_SIZE,
	gridSize: p.gridSize ?? DEFAULT_GRID_SIZE,
	rotation: p.rotation ?? DEFAULT_ROTATION,
	colorMode: p.colorMode ?? 'solid',
	dotColor:
		'dotColor' in p ? (p.dotColor ?? DEFAULT_DOT_COLOR) : DEFAULT_DOT_COLOR,
});

const validateNonNegative = (value: number, name: string): void => {
	if (value < 0) {
		throw new TypeError(
			`"${name}" must be >= 0, but got ${JSON.stringify(value)}`,
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

const validateHalftoneGradientParams = (
	params: HalftoneGradientParams,
): void => {
	assertEffectParamsObject(params, 'Halftone gradient');
	assertOptionalFiniteNumber(params.firstStopDotSize, 'firstStopDotSize');
	assertOptionalFiniteNumber(params.secondStopDotSize, 'secondStopDotSize');
	assertOptionalFiniteNumber(params.gridSize, 'gridSize');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	assertOptionalEnum(
		params.colorMode,
		'colorMode',
		HALFTONE_GRADIENT_COLOR_MODES,
	);

	if (params.colorMode === 'source' && 'dotColor' in params) {
		throw new TypeError(
			'"dotColor" can only be set when "colorMode" is "solid"',
		);
	}

	assertOptionalColor(
		'dotColor' in params ? params.dotColor : undefined,
		'dotColor',
	);

	if (params.firstStopDotSize !== undefined) {
		validateNonNegative(params.firstStopDotSize, 'firstStopDotSize');
	}

	if (params.secondStopDotSize !== undefined) {
		validateNonNegative(params.secondStopDotSize, 'secondStopDotSize');
	}

	if (params.gridSize !== undefined) {
		validatePositive(params.gridSize, 'gridSize');
	}
};

const HALFTONE_GRADIENT_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const HALFTONE_GRADIENT_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uFirstStopDotSize;
uniform float uSecondStopDotSize;
uniform float uGridSize;
uniform float uRotation;
uniform vec4 uColor;
uniform bool uUseSourceColor;

vec2 rotatePoint(vec2 point, float angle) {
	float cosR = cos(angle);
	float sinR = sin(angle);
	return vec2(
		point.x * cosR + point.y * sinR,
		-point.x * sinR + point.y * cosR
	);
}

vec2 unrotatePoint(vec2 point, float angle) {
	float cosR = cos(angle);
	float sinR = sin(angle);
	return vec2(
		point.x * cosR - point.y * sinR,
		point.x * sinR + point.y * cosR
	);
}

float gradientProgress(vec2 point, vec2 direction) {
	float halfExtent = dot(abs(direction), uResolution * 0.5);
	if (halfExtent <= 0.0) {
		return 0.0;
	}

	return clamp(dot(point, direction) / (halfExtent * 2.0) + 0.5, 0.0, 1.0);
}

void main() {
	vec2 fragPos = vUv * uResolution;
	vec2 center = uResolution * 0.5;
	vec2 relative = fragPos - center;

	vec2 gridPos = rotatePoint(relative, uRotation);
	float gridSize = max(uGridSize, 0.001);
	vec2 cellIndex = floor(gridPos / gridSize + 0.5);
	vec2 gridCenter = cellIndex * gridSize;
	vec2 canvasCenter = center + unrotatePoint(gridCenter, uRotation);

	vec2 direction = vec2(cos(uRotation), sin(uRotation));
	float progress = gradientProgress(canvasCenter - center, direction);
	float dotSize = mix(uFirstStopDotSize, uSecondStopDotSize, progress);

	if (dotSize <= 0.01) {
		fragColor = vec4(0.0);
		return;
	}

	vec2 diff = gridPos - gridCenter;
	float radius = dotSize * 0.5;
	float coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, length(diff));

	vec2 sampleUv = clamp(canvasCenter / uResolution, vec2(0.0), vec2(1.0));
	vec4 texColor = texture(uSource, sampleUv);
	fragColor = (uUseSourceColor ? texColor : uColor) * coverage;
}
`;

type HalftoneGradientState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uFirstStopDotSize: WebGLUniformLocation | null;
	uSecondStopDotSize: WebGLUniformLocation | null;
	uGridSize: WebGLUniformLocation | null;
	uRotation: WebGLUniformLocation | null;
	uColor: WebGLUniformLocation | null;
	uUseSourceColor: WebGLUniformLocation | null;
	colorCtx: CanvasRenderingContext2D;
	cachedColorStr: string;
	cachedColorRgba: ParsedColorRgba;
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
		throw new Error(
			`Halftone gradient shader compile failed: ${log ?? '(no log)'}`,
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
			`Halftone gradient program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

export const halftoneGradient = createEffect<
	HalftoneGradientParams,
	HalftoneGradientState
>({
	type: 'remotion/halftone-gradient',
	label: 'halftoneGradient()',
	documentationLink: 'https://www.remotion.dev/docs/effects/halftone-gradient',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `halftone-gradient-${r.firstStopDotSize}-${r.secondStopDotSize}-${r.gridSize}-${r.rotation}-${r.colorMode}-${r.dotColor}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('halftone gradient effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, HALFTONE_GRADIENT_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, HALFTONE_GRADIENT_FS);
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
			texture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uFirstStopDotSize: gl.getUniformLocation(program, 'uFirstStopDotSize'),
			uSecondStopDotSize: gl.getUniformLocation(program, 'uSecondStopDotSize'),
			uGridSize: gl.getUniformLocation(program, 'uGridSize'),
			uRotation: gl.getUniformLocation(program, 'uRotation'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uUseSourceColor: gl.getUniformLocation(program, 'uUseSourceColor'),
			colorCtx,
			cachedColorStr: '',
			cachedColorRgba: [0, 0, 0, 255],
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture} = state;

		if (state.cachedColorStr !== r.dotColor) {
			state.cachedColorStr = r.dotColor;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.dotColor);
		}

		const [cr, cg, cb, ca] = state.cachedColorRgba;
		const caNormalized = ca / 255;

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
		if (state.uFirstStopDotSize)
			gl.uniform1f(state.uFirstStopDotSize, r.firstStopDotSize);
		if (state.uSecondStopDotSize)
			gl.uniform1f(state.uSecondStopDotSize, r.secondStopDotSize);
		if (state.uGridSize) gl.uniform1f(state.uGridSize, r.gridSize);
		if (state.uRotation)
			gl.uniform1f(state.uRotation, (r.rotation * Math.PI) / 180);
		if (state.uColor)
			gl.uniform4f(
				state.uColor,
				(cr / 255) * caNormalized,
				(cg / 255) * caNormalized,
				(cb / 255) * caNormalized,
				caNormalized,
			);
		if (state.uUseSourceColor)
			gl.uniform1i(state.uUseSourceColor, r.colorMode === 'source' ? 1 : 0);

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
	schema: halftoneGradientSchema,
	validateParams: validateHalftoneGradientParams,
});
