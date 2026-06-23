import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const HALFTONE_LINEAR_GRADIENT_COLOR_MODES = ['solid', 'source'] as const;

const DEFAULT_FIRST_STOP_DOT_SIZE = 0;
const DEFAULT_SECOND_STOP_DOT_SIZE = 40;
const DEFAULT_FIRST_STOP_POSITION = [0, 0.5] as const;
const DEFAULT_SECOND_STOP_POSITION = [1, 0.5] as const;
const DEFAULT_GRID_SIZE = 24;
const DEFAULT_DOT_COLOR = 'black';
const DEFAULT_MASK_TO_SOURCE_ALPHA = false as const;

export const halftoneLinearGradientSchema = {
	firstStopDotSize: {
		type: 'number',
		min: 0,
		max: 400,
		step: 1,
		default: DEFAULT_FIRST_STOP_DOT_SIZE,
		description: 'First stop dot size',
		hiddenFromList: false,
	},
	secondStopDotSize: {
		type: 'number',
		min: 0,
		max: 400,
		step: 1,
		default: DEFAULT_SECOND_STOP_DOT_SIZE,
		description: 'Second stop dot size',
		hiddenFromList: false,
	},
	firstStopPosition: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_FIRST_STOP_POSITION,
		description: 'First stop position',
		visual: {
			type: 'line',
			to: 'secondStopPosition',
		},
	},
	secondStopPosition: {
		type: 'uv-coordinate',
		min: -1,
		max: 2,
		step: 0.01,
		default: DEFAULT_SECOND_STOP_POSITION,
		description: 'Second stop position',
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
	maskToSourceAlpha: {
		type: 'boolean',
		default: DEFAULT_MASK_TO_SOURCE_ALPHA,
		description: 'Mask to source alpha',
	},
} as const satisfies InteractivitySchema;

export type HalftoneLinearGradientColorMode =
	(typeof HALFTONE_LINEAR_GRADIENT_COLOR_MODES)[number];

export type UvCoordinate = readonly [number, number];

type HalftoneLinearGradientCommonParams = {
	/**
	 * Dot diameter at the first side of the gradient.
	 */
	readonly firstStopDotSize?: number;
	/**
	 * Dot diameter at the opposite side of the gradient.
	 */
	readonly secondStopDotSize?: number;
	/**
	 * UV coordinate where the first dot size is reached.
	 */
	readonly firstStopPosition?: UvCoordinate;
	/**
	 * UV coordinate where the second dot size is reached.
	 */
	readonly secondStopPosition?: UvCoordinate;
	/**
	 * Distance between adjacent dot centers.
	 */
	readonly gridSize?: number;
	/**
	 * Masks solid-color dots to the source alpha channel. Defaults to `false`.
	 */
	readonly maskToSourceAlpha?: boolean;
};

export type HalftoneLinearGradientParams = HalftoneLinearGradientCommonParams &
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

type HalftoneLinearGradientResolved = {
	firstStopDotSize: number;
	secondStopDotSize: number;
	firstStopPosition: UvCoordinate;
	secondStopPosition: UvCoordinate;
	gridSize: number;
	colorMode: HalftoneLinearGradientColorMode;
	dotColor: string;
	maskToSourceAlpha: boolean;
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

const resolve = (
	p: HalftoneLinearGradientParams,
): HalftoneLinearGradientResolved => ({
	firstStopDotSize: p.firstStopDotSize ?? DEFAULT_FIRST_STOP_DOT_SIZE,
	secondStopDotSize: p.secondStopDotSize ?? DEFAULT_SECOND_STOP_DOT_SIZE,
	firstStopPosition: [
		...(p.firstStopPosition ?? DEFAULT_FIRST_STOP_POSITION),
	] as UvCoordinate,
	secondStopPosition: [
		...(p.secondStopPosition ?? DEFAULT_SECOND_STOP_POSITION),
	] as UvCoordinate,
	gridSize: p.gridSize ?? DEFAULT_GRID_SIZE,
	colorMode: p.colorMode ?? 'solid',
	dotColor:
		'dotColor' in p ? (p.dotColor ?? DEFAULT_DOT_COLOR) : DEFAULT_DOT_COLOR,
	maskToSourceAlpha: p.maskToSourceAlpha ?? DEFAULT_MASK_TO_SOURCE_ALPHA,
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

const validateHalftoneLinearGradientParams = (
	params: HalftoneLinearGradientParams,
): void => {
	assertEffectParamsObject(params, 'Halftone linear gradient');
	assertOptionalFiniteNumber(params.firstStopDotSize, 'firstStopDotSize');
	assertOptionalFiniteNumber(params.secondStopDotSize, 'secondStopDotSize');
	assertOptionalUvCoordinate(params.firstStopPosition, 'firstStopPosition');
	assertOptionalUvCoordinate(params.secondStopPosition, 'secondStopPosition');
	assertOptionalFiniteNumber(params.gridSize, 'gridSize');
	assertOptionalBoolean(params.maskToSourceAlpha, 'maskToSourceAlpha');
	assertOptionalEnum(
		params.colorMode,
		'colorMode',
		HALFTONE_LINEAR_GRADIENT_COLOR_MODES,
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

const HALFTONE_LINEAR_GRADIENT_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const HALFTONE_LINEAR_GRADIENT_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uFirstStopDotSize;
uniform float uSecondStopDotSize;
uniform vec2 uFirstStopPosition;
uniform vec2 uSecondStopPosition;
uniform float uGridSize;
uniform vec4 uColor;
uniform bool uUseSourceColor;
uniform bool uMaskToSourceAlpha;

float gradientProgress(vec2 uv) {
	vec2 stopVector = uSecondStopPosition - uFirstStopPosition;
	float stopDistance = dot(stopVector, stopVector);
	if (stopDistance <= 0.0) {
		return 0.0;
	}

	return clamp(dot(uv - uFirstStopPosition, stopVector) / stopDistance, 0.0, 1.0);
}

vec4 sourceOver(vec4 backdrop, vec4 overlay) {
	return overlay + backdrop * (1.0 - overlay.a);
}

vec4 sourceAtop(vec4 backdrop, vec4 overlay) {
	return vec4(
		overlay.rgb * backdrop.a + backdrop.rgb * (1.0 - overlay.a),
		backdrop.a
	);
}

void main() {
	vec2 fragPos = vUv * uResolution;
	vec2 center = uResolution * 0.5;
	vec2 gridPos = fragPos - center;

	float gridSize = max(uGridSize, 0.001);
	vec2 cellIndex = floor(gridPos / gridSize + 0.5);
	vec2 gridCenter = cellIndex * gridSize;
	vec2 canvasCenter = center + gridCenter;

	vec2 centerUv = canvasCenter / uResolution;
	// Flip Y so that (0,0) is top-left, matching CSS/canvas coordinate conventions.
	vec2 gradientUv = vec2(centerUv.x, 1.0 - centerUv.y);
	float progress = gradientProgress(gradientUv);
	float dotSize = mix(uFirstStopDotSize, uSecondStopDotSize, progress);

	if (dotSize <= 0.01) {
		fragColor = vec4(0.0);
		return;
	}

	vec2 diff = gridPos - gridCenter;
	float radius = dotSize * 0.5;
	float coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, length(diff));

	vec2 sampleUv = clamp(centerUv, vec2(0.0), vec2(1.0));
	vec4 texColor = texture(uSource, sampleUv);
	vec4 dotColor = (uUseSourceColor ? texColor : uColor) * coverage;
	fragColor = uUseSourceColor
		? dotColor
		: uMaskToSourceAlpha
			? sourceAtop(texColor, dotColor)
			: sourceOver(texColor, dotColor);
}
`;

type HalftoneLinearGradientState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uFirstStopDotSize: WebGLUniformLocation | null;
	uSecondStopDotSize: WebGLUniformLocation | null;
	uFirstStopPosition: WebGLUniformLocation | null;
	uSecondStopPosition: WebGLUniformLocation | null;
	uGridSize: WebGLUniformLocation | null;
	uColor: WebGLUniformLocation | null;
	uUseSourceColor: WebGLUniformLocation | null;
	uMaskToSourceAlpha: WebGLUniformLocation | null;
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
			`Halftone linear gradient shader compile failed: ${log ?? '(no log)'}`,
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
			`Halftone linear gradient program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

export const halftoneLinearGradient = createEffect<
	HalftoneLinearGradientParams,
	HalftoneLinearGradientState
>({
	type: 'dev.remotion.effects.halftoneLinearGradient',
	label: 'halftoneLinearGradient()',
	documentationLink:
		'https://www.remotion.dev/docs/effects/halftone-linear-gradient',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		const maskSuffix = r.maskToSourceAlpha ? '-mask-to-source-alpha' : '';
		return `halftone-linear-gradient-${r.firstStopDotSize}-${r.secondStopDotSize}-${r.firstStopPosition.join(':')}-${r.secondStopPosition.join(':')}-${r.gridSize}-${r.colorMode}-${r.dotColor}${maskSuffix}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('halftone linear gradient effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, HALFTONE_LINEAR_GRADIENT_VS);
		const fs = compileShader(
			gl,
			gl.FRAGMENT_SHADER,
			HALFTONE_LINEAR_GRADIENT_FS,
		);
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
			uFirstStopPosition: gl.getUniformLocation(program, 'uFirstStopPosition'),
			uSecondStopPosition: gl.getUniformLocation(
				program,
				'uSecondStopPosition',
			),
			uGridSize: gl.getUniformLocation(program, 'uGridSize'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uUseSourceColor: gl.getUniformLocation(program, 'uUseSourceColor'),
			uMaskToSourceAlpha: gl.getUniformLocation(program, 'uMaskToSourceAlpha'),
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
		if (state.uFirstStopPosition)
			gl.uniform2f(
				state.uFirstStopPosition,
				r.firstStopPosition[0],
				r.firstStopPosition[1],
			);
		if (state.uSecondStopPosition)
			gl.uniform2f(
				state.uSecondStopPosition,
				r.secondStopPosition[0],
				r.secondStopPosition[1],
			);
		if (state.uGridSize) gl.uniform1f(state.uGridSize, r.gridSize);
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
		if (state.uMaskToSourceAlpha)
			gl.uniform1i(state.uMaskToSourceAlpha, r.maskToSourceAlpha ? 1 : 0);

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
	schema: halftoneLinearGradientSchema,
	validateParams: validateHalftoneLinearGradientParams,
});
