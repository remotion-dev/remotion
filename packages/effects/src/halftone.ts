import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
} from './color-utils.js';
import {
	assertOptionalBoolean,
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;
const HALFTONE_SHAPES = ['circle', 'square', 'line'] as const;
const HALFTONE_SAMPLING = ['bilinear', 'nearest'] as const;
const HALFTONE_COLOR_MODES = ['solid', 'source'] as const;

export const halftoneSchema = {
	dotSize: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: 20,
		description: 'Dot size',
		hiddenFromList: false,
	},
	dotSpacing: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: 20,
		description: 'Dot spacing',
		hiddenFromList: false,
	},
	rotation: {
		type: 'rotation-degrees',
		step: 1,
		default: 0,
		description: 'Rotation',
	},
	offsetX: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Offset X',
		hiddenFromList: false,
	},
	offsetY: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Offset Y',
		hiddenFromList: false,
	},
	shape: {
		type: 'enum',
		variants: {
			circle: {},
			square: {},
			line: {},
		},
		default: 'circle' as const,
		description: 'Shape',
	},
	invert: {
		type: 'boolean',
		default: false,
		description: 'Invert',
	},
	colorMode: {
		type: 'enum',
		default: 'solid' as const,
		description: 'Color mode',
		variants: {
			solid: {
				dotColor: {
					type: 'color',
					default: 'red',
					description: 'Dot color',
				},
			},
			source: {},
		},
	},
} as const satisfies InteractivitySchema;

export type HalftoneShape = (typeof HALFTONE_SHAPES)[number];
export type HalftoneSampling = (typeof HALFTONE_SAMPLING)[number];
export type HalftoneColorMode = (typeof HALFTONE_COLOR_MODES)[number];

type HalftoneCommonParams = {
	readonly shape?: HalftoneShape;
	readonly dotSize?: number;
	/**
	 * Distance between adjacent dot centers on the halftone grid (pitch).
	 * When omitted, matches `dotSize` so dots can touch at full coverage (same as before).
	 */
	readonly dotSpacing?: number;
	readonly rotation?: number;
	readonly offsetX?: number;
	readonly offsetY?: number;
	readonly sampling?: HalftoneSampling;
	/**
	 * When false (default), dark areas produce larger dots.
	 * When true, the pattern is inverted:
	 * bright and transparent areas produce larger dots instead.
	 */
	readonly invert?: boolean;
};

export type HalftoneParams = HalftoneCommonParams &
	(
		| {
				readonly colorMode?: 'solid';
				/** Dot color. Defaults to red. */
				readonly dotColor?: string;
		  }
		| {
				readonly colorMode: 'source';
		  }
	);

type HalftoneResolved = {
	shape: HalftoneShape;
	dotSize: number;
	dotSpacing: number;
	rotation: number;
	offsetX: number;
	offsetY: number;
	sampling: HalftoneSampling;
	colorMode: HalftoneColorMode;
	dotColor: string;
	invert: boolean;
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

const resolve = (p: HalftoneParams): HalftoneResolved => ({
	shape: p.shape ?? 'circle',
	dotSize: p.dotSize ?? 20,
	dotSpacing: p.dotSpacing ?? p.dotSize ?? 20,
	rotation: p.rotation ?? 0,
	offsetX: p.offsetX ?? 0,
	offsetY: p.offsetY ?? 0,
	sampling: p.sampling ?? 'bilinear',
	colorMode: p.colorMode ?? 'solid',
	dotColor: 'dotColor' in p ? (p.dotColor ?? 'red') : 'red',
	invert: p.invert ?? false,
});

const validateHalftoneParams = (params: HalftoneParams): void => {
	assertEffectParamsObject(params, 'Halftone');
	assertOptionalFiniteNumber(params.dotSize, 'dotSize');
	assertOptionalFiniteNumber(params.dotSpacing, 'dotSpacing');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalEnum(params.shape, 'shape', HALFTONE_SHAPES);
	assertOptionalEnum(params.sampling, 'sampling', HALFTONE_SAMPLING);
	assertOptionalEnum(params.colorMode, 'colorMode', HALFTONE_COLOR_MODES);
	if ('color' in params && params.color !== undefined) {
		throw new TypeError('"color" has been renamed to "dotColor"');
	}

	if (params.colorMode === 'source' && 'dotColor' in params) {
		throw new TypeError(
			'"dotColor" can only be set when "colorMode" is "solid"',
		);
	}

	assertOptionalColor(
		'dotColor' in params ? params.dotColor : undefined,
		'dotColor',
	);
	assertOptionalBoolean(params.invert, 'invert');

	if (params.dotSize !== undefined && params.dotSize < 1) {
		throw new TypeError(
			`"dotSize" must be >= 1, but got ${JSON.stringify(params.dotSize)}`,
		);
	}

	if (params.dotSpacing !== undefined && params.dotSpacing < 1) {
		throw new TypeError(
			`"dotSpacing" must be >= 1, but got ${JSON.stringify(params.dotSpacing)}`,
		);
	}
};

const HALFTONE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const HALFTONE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uDotSize;
uniform float uDotSpacing;
uniform float uRotation;
uniform vec2 uOffset;
uniform vec4 uColor;
uniform int uShape;
uniform bool uShadeOutside;
uniform bool uUseSourceColor;

void main() {
	vec2 fragPos = vUv * uResolution;
	vec2 center = uResolution * 0.5;

	vec2 d = fragPos - center;
	float cosR = cos(uRotation);
	float sinR = sin(uRotation);

	vec2 gridPos = vec2(
		d.x * cosR + d.y * sinR,
		-d.x * sinR + d.y * cosR
	);

	float spacing = max(uDotSpacing, 0.001);
	vec2 cellIndex = floor((gridPos + uOffset) / spacing + 0.5);
	vec2 gridCenter = cellIndex * spacing - uOffset;

	vec2 canvasPos = center + vec2(
		gridCenter.x * cosR - gridCenter.y * sinR,
		gridCenter.x * sinR + gridCenter.y * cosR
	);

	vec2 sampleUv = clamp(canvasPos / uResolution, vec2(0.0), vec2(1.0));
	vec4 texColor = texture(uSource, sampleUv);

	float alpha = texColor.a;
	vec3 rgb = alpha > 0.001 ? texColor.rgb / alpha : vec3(0.0);
	float lum = dot(rgb, vec3(0.299, 0.587, 0.114));

	float lumDefault = lum * alpha + (1.0 - alpha);
	float dotScale = uShadeOutside
		? lumDefault
		: 1.0 - lumDefault;

	if (dotScale <= 0.01) {
		fragColor = vec4(0.0);
		return;
	}

	vec2 diff = gridPos - gridCenter;
	float halfSize = uDotSize * 0.5;
	float coverage = 0.0;

	if (uShape == 0) {
		float radius = halfSize * dotScale;
		float dist = length(diff);
		coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, dist);
	} else if (uShape == 1) {
		float s = uDotSize * dotScale * 0.5;
		coverage = (1.0 - smoothstep(s - 0.5, s + 0.5, abs(diff.x)))
				 * (1.0 - smoothstep(s - 0.5, s + 0.5, abs(diff.y)));
	} else {
		vec4 localTexColor = texture(uSource, vUv);
		float localAlpha = localTexColor.a;
		vec3 localRgb = localAlpha > 0.001 ? localTexColor.rgb / localAlpha : vec3(0.0);
		float localLum = dot(localRgb, vec3(0.299, 0.587, 0.114));
		float localLumDefault = localLum * localAlpha + (1.0 - localAlpha);
		float localDotScale = uShadeOutside
			? localLumDefault
			: 1.0 - localLumDefault;

		if (localDotScale <= 0.12) {
			fragColor = vec4(0.0);
			return;
		}

		float lineHalf = uDotSize * dotScale * 0.5;
		if (lineHalf <= 1.0) {
			fragColor = vec4(0.0);
			return;
		}

		coverage = (1.0 - smoothstep(halfSize - 0.5, halfSize + 0.5, abs(diff.x)))
				 * (1.0 - smoothstep(lineHalf - 0.5, lineHalf + 0.5, abs(diff.y)));
	}

	fragColor = (uUseSourceColor ? texColor : uColor) * coverage;
}
`;

type HalftoneState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uDotSize: WebGLUniformLocation | null;
	uDotSpacing: WebGLUniformLocation | null;
	uRotation: WebGLUniformLocation | null;
	uOffset: WebGLUniformLocation | null;
	uColor: WebGLUniformLocation | null;
	uShape: WebGLUniformLocation | null;
	uShadeOutside: WebGLUniformLocation | null;
	uUseSourceColor: WebGLUniformLocation | null;
	colorCtx: CanvasRenderingContext2D;
	cachedColorStr: string;
	cachedColorRgba: ParsedColorRgba;
};

const SHAPE_INDEX: Record<HalftoneShape, number> = {
	circle: 0,
	square: 1,
	line: 2,
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
		throw new Error(`Halftone shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Halftone program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

// Halftone effect (WebGL2). Converts luminance into a grid of dots, squares,
// or lines. Each fragment determines its nearest grid cell and whether it falls
// inside a dot, so edge dots are never culled. `dotSpacing` sets the grid pitch
// (defaults to `dotSize`). `sampling` controls texture interpolation when
// reading luminance at grid centres. `invert` inverts the pattern so
// bright/transparent areas produce larger dots and dark areas produce fewer.
// `colorMode` controls whether dots use a solid `dotColor` or the sampled source
// color at each grid cell.
export const halftone = createEffect<HalftoneParams, HalftoneState>({
	type: 'dev.remotion.effects.halftone',
	label: 'halftone()',
	documentationLink: 'https://www.remotion.dev/docs/effects/halftone',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `halftone-${r.shape}-${r.dotSize}-${r.dotSpacing}-${r.rotation}-${r.offsetX}-${r.offsetY}-${r.sampling}-${r.colorMode}-${r.dotColor}-${r.invert ? 1 : 0}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('halftone effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, HALFTONE_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, HALFTONE_FS);
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
			uDotSize: gl.getUniformLocation(program, 'uDotSize'),
			uDotSpacing: gl.getUniformLocation(program, 'uDotSpacing'),
			uRotation: gl.getUniformLocation(program, 'uRotation'),
			uOffset: gl.getUniformLocation(program, 'uOffset'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uShape: gl.getUniformLocation(program, 'uShape'),
			uShadeOutside: gl.getUniformLocation(program, 'uShadeOutside'),
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

		const filter = r.sampling === 'nearest' ? gl.NEAREST : gl.LINEAR;

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
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
		if (state.uDotSpacing) gl.uniform1f(state.uDotSpacing, r.dotSpacing);
		if (state.uRotation)
			gl.uniform1f(state.uRotation, (r.rotation * Math.PI) / 180);
		if (state.uOffset) gl.uniform2f(state.uOffset, r.offsetX, r.offsetY);
		if (state.uColor)
			gl.uniform4f(
				state.uColor,
				(cr / 255) * caNormalized,
				(cg / 255) * caNormalized,
				(cb / 255) * caNormalized,
				caNormalized,
			);
		if (state.uShape) gl.uniform1i(state.uShape, SHAPE_INDEX[r.shape]);
		if (state.uShadeOutside)
			gl.uniform1i(state.uShadeOutside, r.invert ? 1 : 0);
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
	schema: halftoneSchema,
	validateParams: validateHalftoneParams,
});
