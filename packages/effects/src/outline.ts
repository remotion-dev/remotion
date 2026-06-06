import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	validateNonNegative,
	validateUnitInterval,
	type ParsedColorRgba,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const OUTLINE_MODES = ['outer', 'inner', 'center'] as const;

const DEFAULT_WIDTH = 8 as const;
const DEFAULT_COLOR = '#ffffff' as const;
const DEFAULT_OPACITY = 1 as const;
const DEFAULT_SOURCE_OPACITY = 1 as const;
const DEFAULT_BACKGROUND_COLOR = 'transparent' as const;
const DEFAULT_DISPLACEMENT = 0 as const;
const DEFAULT_DISPLACEMENT_FREQUENCY = 12 as const;
const DEFAULT_DISPLACEMENT_SEED = 0 as const;
const DEFAULT_SIMPLIFICATION = 0 as const;
const DEFAULT_MODE = 'outer' as const;

const outlineSchema = {
	width: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_WIDTH,
		description: 'Width',
		hiddenFromList: false,
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
	opacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_OPACITY,
		description: 'Opacity',
		hiddenFromList: false,
	},
	sourceOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SOURCE_OPACITY,
		description: 'Source opacity',
		hiddenFromList: false,
	},
	backgroundColor: {
		type: 'color',
		default: DEFAULT_BACKGROUND_COLOR,
		description: 'Background color',
	},
	displacement: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_DISPLACEMENT,
		description: 'Displacement',
		hiddenFromList: false,
	},
	displacementFrequency: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_DISPLACEMENT_FREQUENCY,
		description: 'Displacement frequency',
		hiddenFromList: false,
	},
	displacementSeed: {
		type: 'number',
		step: 1,
		default: DEFAULT_DISPLACEMENT_SEED,
		description: 'Displacement seed',
		hiddenFromList: false,
	},
	simplification: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SIMPLIFICATION,
		description: 'Simplification',
		hiddenFromList: false,
	},
	mode: {
		type: 'enum',
		variants: {
			outer: {},
			inner: {},
			center: {},
		},
		default: DEFAULT_MODE,
		description: 'Mode',
	},
} as const satisfies SequenceSchema;

export type OutlineMode = (typeof OUTLINE_MODES)[number];

export type OutlineParams = {
	/** Width of the outline in pixels. Defaults to `8`. */
	readonly width?: number;
	/** Color of the outline. Defaults to white. */
	readonly color?: string;
	/** Opacity of the outline from `0` to `1`. Defaults to `1`. */
	readonly opacity?: number;
	/** Opacity of the original source from `0` to `1`. Defaults to `1`. */
	readonly sourceOpacity?: number;
	/** Background color behind the source and outline. Defaults to transparent. */
	readonly backgroundColor?: string;
	/** Amount of procedural outline displacement in pixels. Defaults to `0`. */
	readonly displacement?: number;
	/** Frequency of the procedural displacement. Defaults to `12`. */
	readonly displacementFrequency?: number;
	/** Seed for the procedural displacement. Defaults to `0`. */
	readonly displacementSeed?: number;
	/** Blocky edge simplification amount from `0` to `1`. Defaults to `0`. */
	readonly simplification?: number;
	/** Which side of the alpha edge receives the outline. Defaults to `outer`. */
	readonly mode?: OutlineMode;
};

type OutlineResolved = {
	width: number;
	color: string;
	opacity: number;
	sourceOpacity: number;
	backgroundColor: string;
	displacement: number;
	displacementFrequency: number;
	displacementSeed: number;
	simplification: number;
	mode: OutlineMode;
};

const resolve = (p: OutlineParams): OutlineResolved => ({
	width: p.width ?? DEFAULT_WIDTH,
	color: p.color ?? DEFAULT_COLOR,
	opacity: p.opacity ?? DEFAULT_OPACITY,
	sourceOpacity: p.sourceOpacity ?? DEFAULT_SOURCE_OPACITY,
	backgroundColor: p.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
	displacement: p.displacement ?? DEFAULT_DISPLACEMENT,
	displacementFrequency:
		p.displacementFrequency ?? DEFAULT_DISPLACEMENT_FREQUENCY,
	displacementSeed: p.displacementSeed ?? DEFAULT_DISPLACEMENT_SEED,
	simplification: p.simplification ?? DEFAULT_SIMPLIFICATION,
	mode: p.mode ?? DEFAULT_MODE,
});

const formatEnum = (variants: readonly string[]): string => {
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

const validateOutlineParams = (params: OutlineParams): void => {
	assertEffectParamsObject(params, 'Outline');
	assertOptionalFiniteNumber(params.width, 'width');
	assertOptionalFiniteNumber(params.opacity, 'opacity');
	assertOptionalFiniteNumber(params.sourceOpacity, 'sourceOpacity');
	assertOptionalFiniteNumber(params.displacement, 'displacement');
	assertOptionalFiniteNumber(
		params.displacementFrequency,
		'displacementFrequency',
	);
	assertOptionalFiniteNumber(params.displacementSeed, 'displacementSeed');
	assertOptionalFiniteNumber(params.simplification, 'simplification');
	assertOptionalColor(params.color, 'color');
	assertOptionalColor(params.backgroundColor, 'backgroundColor');
	assertOptionalEnum(params.mode, 'mode', OUTLINE_MODES);

	const r = resolve(params);
	validateNonNegative(r.width, 'width');
	validateUnitInterval(r.opacity, 'opacity');
	validateUnitInterval(r.sourceOpacity, 'sourceOpacity');
	validateNonNegative(r.displacement, 'displacement');
	validateNonNegative(r.displacementFrequency, 'displacementFrequency');
	validateUnitInterval(r.simplification, 'simplification');
};

const OUTLINE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
vUv = aUv;
gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const OUTLINE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec4 uColor;
uniform vec4 uBackgroundColor;
uniform float uWidth;
uniform float uOpacity;
uniform float uSourceOpacity;
uniform float uDisplacement;
uniform float uDisplacementFrequency;
uniform float uDisplacementSeed;
uniform float uSimplification;
uniform int uMode;

float hash(vec2 p) {
return fract(sin(dot(p, vec2(127.1, 311.7)) + uDisplacementSeed * 17.13) * 43758.5453123);
}

float noise(vec2 p) {
vec2 i = floor(p);
vec2 f = fract(p);
vec2 u = f * f * (3.0 - 2.0 * f);
return mix(
mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
u.y
);
}

vec2 displacedUv(vec2 uv) {
float frequency = max(uDisplacementFrequency, 0.001);
float n1 = noise(uv * frequency + vec2(0.0, uDisplacementSeed));
float n2 = noise(uv * frequency + vec2(23.7, uDisplacementSeed + 11.0));
vec2 offset = vec2(n1 - 0.5, n2 - 0.5) * uDisplacement / uResolution;
return clamp(uv + offset, vec2(0.0), vec2(1.0));
}

vec2 simplifiedUv(vec2 uv) {
if (uSimplification <= 0.0) {
return uv;
}

float blockSize = mix(1.0, 42.0, uSimplification);
vec2 pixel = uv * uResolution;
vec2 snapped = (floor(pixel / blockSize) + 0.5) * blockSize;
return clamp(snapped / uResolution, vec2(0.0), vec2(1.0));
}

float alphaAt(vec2 uv) {
return texture(uSource, clamp(simplifiedUv(displacedUv(uv)), vec2(0.0), vec2(1.0))).a;
}

vec4 over(vec4 top, vec4 bottom) {
return top + bottom * (1.0 - top.a);
}

void main() {
vec4 source = texture(uSource, vUv) * clamp(uSourceOpacity, 0.0, 1.0);
float centerAlpha = alphaAt(vUv);
float maxAlpha = centerAlpha;
float minAlpha = centerAlpha;
float radius = max(uWidth, 0.0);

for (int i = 0; i < 32; i++) {
float angle = 6.28318530718 * (float(i) / 32.0);
vec2 direction = vec2(cos(angle), sin(angle));
float sampleRadius = radius * (0.35 + 0.65 * hash(vec2(float(i), uDisplacementSeed + 3.0)));
vec2 sampleUv = vUv + direction * sampleRadius / uResolution;
float a = alphaAt(sampleUv);
maxAlpha = max(maxAlpha, a);
minAlpha = min(minAlpha, a);
}

float outer = (1.0 - centerAlpha) * maxAlpha;
float inner = centerAlpha * (1.0 - minAlpha);
float edge = uMode == 0 ? outer : (uMode == 1 ? inner : max(outer, inner));
float outlineAlpha = clamp(edge * uOpacity, 0.0, 1.0) * uColor.a;
vec4 outline = vec4(uColor.rgb * outlineAlpha, outlineAlpha);
vec4 background = uBackgroundColor;

fragColor = over(source, over(outline, background));
}
`;

type OutlineState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uColor: WebGLUniformLocation | null;
	uBackgroundColor: WebGLUniformLocation | null;
	uWidth: WebGLUniformLocation | null;
	uOpacity: WebGLUniformLocation | null;
	uSourceOpacity: WebGLUniformLocation | null;
	uDisplacement: WebGLUniformLocation | null;
	uDisplacementFrequency: WebGLUniformLocation | null;
	uDisplacementSeed: WebGLUniformLocation | null;
	uSimplification: WebGLUniformLocation | null;
	uMode: WebGLUniformLocation | null;
	colorCtx: CanvasRenderingContext2D;
	cachedColorStr: string;
	cachedColorRgba: ParsedColorRgba;
	cachedBackgroundColorStr: string;
	cachedBackgroundColorRgba: ParsedColorRgba;
};

const MODE_INDEX: Record<OutlineMode, number> = {
	outer: 0,
	inner: 1,
	center: 2,
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
		throw new Error(`Outline shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Outline program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const outline = createEffect<OutlineParams, OutlineState>({
	type: 'remotion/outline',
	label: 'outline()',
	documentationLink: 'https://www.remotion.dev/docs/effects/outline',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `outline-${r.width}-${r.color}-${r.opacity}-${r.sourceOpacity}-${r.backgroundColor}-${r.displacement}-${r.displacementFrequency}-${r.displacementSeed}-${r.simplification}-${r.mode}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('outline effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, OUTLINE_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, OUTLINE_FS);
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
			uColor: gl.getUniformLocation(program, 'uColor'),
			uBackgroundColor: gl.getUniformLocation(program, 'uBackgroundColor'),
			uWidth: gl.getUniformLocation(program, 'uWidth'),
			uOpacity: gl.getUniformLocation(program, 'uOpacity'),
			uSourceOpacity: gl.getUniformLocation(program, 'uSourceOpacity'),
			uDisplacement: gl.getUniformLocation(program, 'uDisplacement'),
			uDisplacementFrequency: gl.getUniformLocation(
				program,
				'uDisplacementFrequency',
			),
			uDisplacementSeed: gl.getUniformLocation(program, 'uDisplacementSeed'),
			uSimplification: gl.getUniformLocation(program, 'uSimplification'),
			uMode: gl.getUniformLocation(program, 'uMode'),
			colorCtx,
			cachedColorStr: '',
			cachedColorRgba: [255, 255, 255, 255],
			cachedBackgroundColorStr: '',
			cachedBackgroundColorRgba: [0, 0, 0, 0],
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture} = state;

		if (state.cachedColorStr !== r.color) {
			state.cachedColorStr = r.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
		}

		if (state.cachedBackgroundColorStr !== r.backgroundColor) {
			state.cachedBackgroundColorStr = r.backgroundColor;
			state.cachedBackgroundColorRgba = parseColorRgba(
				state.colorCtx,
				r.backgroundColor,
			);
		}

		const [cr, cg, cb, ca] = state.cachedColorRgba;
		const caNormalized = ca / 255;
		const [br, bg, bb, ba] = state.cachedBackgroundColorRgba;
		const baNormalized = ba / 255;

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
		if (state.uColor)
			gl.uniform4f(
				state.uColor,
				(cr / 255) * caNormalized,
				(cg / 255) * caNormalized,
				(cb / 255) * caNormalized,
				caNormalized,
			);
		if (state.uBackgroundColor)
			gl.uniform4f(
				state.uBackgroundColor,
				(br / 255) * baNormalized,
				(bg / 255) * baNormalized,
				(bb / 255) * baNormalized,
				baNormalized,
			);
		if (state.uWidth) gl.uniform1f(state.uWidth, r.width);
		if (state.uOpacity) gl.uniform1f(state.uOpacity, r.opacity);
		if (state.uSourceOpacity)
			gl.uniform1f(state.uSourceOpacity, r.sourceOpacity);
		if (state.uDisplacement) gl.uniform1f(state.uDisplacement, r.displacement);
		if (state.uDisplacementFrequency)
			gl.uniform1f(state.uDisplacementFrequency, r.displacementFrequency);
		if (state.uDisplacementSeed)
			gl.uniform1f(state.uDisplacementSeed, r.displacementSeed);
		if (state.uSimplification)
			gl.uniform1f(state.uSimplification, r.simplification);
		if (state.uMode) gl.uniform1i(state.uMode, MODE_INDEX[r.mode]);

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
	schema: outlineSchema,
	validateParams: validateOutlineParams,
});
