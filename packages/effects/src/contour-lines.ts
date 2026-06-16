import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	validateUnitInterval,
	type ParsedColorRgba,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_LINE_COLOR = '#ffffff' as const;
const DEFAULT_LINE_WIDTH = 1.5 as const;
const DEFAULT_SPACING = 36 as const;
const DEFAULT_SCALE = 220 as const;
const DEFAULT_COMPLEXITY = 0.65 as const;
const DEFAULT_SMOOTHNESS = 0.55 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_OFFSET_X = 0 as const;
const DEFAULT_OFFSET_Y = 0 as const;
const DEFAULT_OPACITY = 1 as const;
const DEFAULT_MASK_TO_SOURCE_ALPHA = false as const;

export const contourLinesSchema = {
	lineColor: {
		type: 'color',
		default: DEFAULT_LINE_COLOR,
		description: 'Line color',
	},
	lineWidth: {
		type: 'number',
		min: 0.1,
		max: 20,
		step: 0.1,
		default: DEFAULT_LINE_WIDTH,
		description: 'Line width',
		hiddenFromList: false,
	},
	spacing: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: DEFAULT_SPACING,
		description: 'Spacing',
		hiddenFromList: false,
	},
	scale: {
		type: 'number',
		min: 20,
		max: 1000,
		step: 1,
		default: DEFAULT_SCALE,
		description: 'Scale',
		hiddenFromList: false,
	},
	complexity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_COMPLEXITY,
		description: 'Complexity',
		hiddenFromList: false,
	},
	smoothness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SMOOTHNESS,
		description: 'Smoothness',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		step: 1,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	offsetX: {
		type: 'number',
		step: 0.1,
		default: DEFAULT_OFFSET_X,
		description: 'Offset X',
		hiddenFromList: false,
	},
	offsetY: {
		type: 'number',
		step: 0.1,
		default: DEFAULT_OFFSET_Y,
		description: 'Offset Y',
		hiddenFromList: false,
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
	maskToSourceAlpha: {
		type: 'boolean',
		default: DEFAULT_MASK_TO_SOURCE_ALPHA,
		description: 'Mask to source alpha',
	},
} as const satisfies InteractivitySchema;

export type ContourLinesParams = {
	/** Color of the contour lines. Defaults to `#ffffff`. */
	readonly lineColor?: string;
	/** Width of each contour line in pixels. Defaults to `1.5`. */
	readonly lineWidth?: number;
	/** Distance between contour height levels in pixels. Defaults to `36`. */
	readonly spacing?: number;
	/** Size of the generated terrain features in pixels. Defaults to `220`. */
	readonly scale?: number;
	/** Amount of terrain detail from `0` to `1`. Defaults to `0.65`. */
	readonly complexity?: number;
	/** Smooths the contour curves from `0` to `1`. Defaults to `0.55`. */
	readonly smoothness?: number;
	/** Deterministic seed for the contour field. Defaults to `0`. */
	readonly seed?: number;
	/** Horizontal offset in pixels. Defaults to `0`. */
	readonly offsetX?: number;
	/** Vertical offset in pixels. Defaults to `0`. */
	readonly offsetY?: number;
	/** Multiplies the alpha channel of `lineColor`. Defaults to `1`. */
	readonly opacity?: number;
	/** Masks the generated contour lines to the source alpha channel. Defaults to `false`. */
	readonly maskToSourceAlpha?: boolean;
};

type ContourLinesResolved = {
	lineColor: string;
	lineWidth: number;
	spacing: number;
	scale: number;
	complexity: number;
	smoothness: number;
	seed: number;
	offsetX: number;
	offsetY: number;
	opacity: number;
	maskToSourceAlpha: boolean;
};

type ContourLinesState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly colorCtx: CanvasRenderingContext2D;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uLineColor: WebGLUniformLocation | null;
		readonly uLineWidth: WebGLUniformLocation | null;
		readonly uSpacing: WebGLUniformLocation | null;
		readonly uScale: WebGLUniformLocation | null;
		readonly uComplexity: WebGLUniformLocation | null;
		readonly uSmoothness: WebGLUniformLocation | null;
		readonly uSeed: WebGLUniformLocation | null;
		readonly uOffset: WebGLUniformLocation | null;
		readonly uOpacity: WebGLUniformLocation | null;
		readonly uMaskToSourceAlpha: WebGLUniformLocation | null;
	};
	cachedLineColor: string;
	cachedLineColorRgba: ParsedColorRgba;
};

const resolve = (p: ContourLinesParams): ContourLinesResolved => ({
	lineColor: p.lineColor ?? DEFAULT_LINE_COLOR,
	lineWidth: p.lineWidth ?? DEFAULT_LINE_WIDTH,
	spacing: p.spacing ?? DEFAULT_SPACING,
	scale: p.scale ?? DEFAULT_SCALE,
	complexity: p.complexity ?? DEFAULT_COMPLEXITY,
	smoothness: p.smoothness ?? DEFAULT_SMOOTHNESS,
	seed: p.seed ?? DEFAULT_SEED,
	offsetX: p.offsetX ?? DEFAULT_OFFSET_X,
	offsetY: p.offsetY ?? DEFAULT_OFFSET_Y,
	opacity: p.opacity ?? DEFAULT_OPACITY,
	maskToSourceAlpha: p.maskToSourceAlpha ?? DEFAULT_MASK_TO_SOURCE_ALPHA,
});

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateContourLinesParams = (params: ContourLinesParams): void => {
	assertEffectParamsObject(params, 'Contour lines');
	assertOptionalColor(params.lineColor, 'lineColor');
	assertOptionalFiniteNumber(params.lineWidth, 'lineWidth');
	assertOptionalFiniteNumber(params.spacing, 'spacing');
	assertOptionalFiniteNumber(params.scale, 'scale');
	assertOptionalFiniteNumber(params.complexity, 'complexity');
	assertOptionalFiniteNumber(params.smoothness, 'smoothness');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalFiniteNumber(params.opacity, 'opacity');
	assertOptionalBoolean(params.maskToSourceAlpha, 'maskToSourceAlpha');

	const r = resolve(params);
	validatePositive(r.lineWidth, 'lineWidth');
	validatePositive(r.spacing, 'spacing');
	validatePositive(r.scale, 'scale');
	validateUnitInterval(r.complexity, 'complexity');
	validateUnitInterval(r.smoothness, 'smoothness');
	validateUnitInterval(r.opacity, 'opacity');
};

const CONTOUR_LINES_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const CONTOUR_LINES_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec4 uLineColor;
uniform float uLineWidth;
uniform float uSpacing;
uniform float uScale;
uniform float uComplexity;
uniform float uSmoothness;
uniform float uSeed;
uniform vec2 uOffset;
uniform float uOpacity;
uniform bool uMaskToSourceAlpha;

float hash(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33 + uSeed * 0.013);
	return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));

	return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
	float value = 0.0;
	float amplitude = 0.5;
	float totalAmplitude = 0.0;
	float persistence = mix(0.18, 0.58, clamp(uComplexity, 0.0, 1.0));
	float smoothness = clamp(uSmoothness, 0.0, 1.0);
	mat2 rotate = mat2(0.80, 0.60, -0.60, 0.80);

	for (int i = 0; i < 5; i++) {
		float octave = float(i) / 4.0;
		float detailWeight = mix(
			1.0,
			1.0 - smoothstep(0.15, 1.0, octave),
			smoothness
		);
		value += amplitude * detailWeight * valueNoise(p);
		totalAmplitude += amplitude * detailWeight;
		p = rotate * p * 2.04 + vec2(13.17, 7.31);
		amplitude *= persistence;
	}

	return value / totalAmplitude;
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	vec2 pixelPosition = vUv * uResolution + uOffset;
	float scale = max(uScale, 0.001);
	vec2 p = pixelPosition / scale + vec2(uSeed * 0.137, uSeed * 0.193);

	float complexity = clamp(uComplexity, 0.0, 1.0);
	float smoothness = clamp(uSmoothness, 0.0, 1.0);
	vec2 warp = vec2(
		fbm(p + vec2(5.2, 1.3)),
		fbm(p + vec2(1.7, 9.2))
	) - 0.5;
	float terrain = fbm(p + warp * complexity * mix(2.8, 1.2, smoothness));

	float levels = max(
		max(uResolution.x, uResolution.y) / (max(uSpacing, 0.001) * 2.0),
		1.0
	);
	float contourPosition = terrain * levels;
	float contourFraction = fract(contourPosition);
	float distanceToContour = min(contourFraction, 1.0 - contourFraction);
	float derivative = max(fwidth(contourPosition), 0.0001);
	float halfLineWidth = max(uLineWidth, 0.001) * 0.5 * derivative;
	float coverage = 1.0 - smoothstep(
		halfLineWidth,
		halfLineWidth + derivative,
		distanceToContour
	);

	float lineAlpha = uLineColor.a * uOpacity * coverage;
	vec3 premultipliedLine = uLineColor.rgb * lineAlpha;

	if (uMaskToSourceAlpha) {
		fragColor = vec4(
			premultipliedLine * texColor.a + texColor.rgb * (1.0 - lineAlpha),
			texColor.a
		);
		return;
	}

	fragColor = vec4(
		premultipliedLine + texColor.rgb * (1.0 - lineAlpha),
		lineAlpha + texColor.a * (1.0 - lineAlpha)
	);
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
			`Contour lines shader compile failed: ${log ?? '(no log)'}`,
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
		throw new Error(`Contour lines program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createProgram = (
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram => {
	const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = linkProgram(gl, vs, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	return program;
};

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
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
	return texture;
};

const setupContourLines = (target: HTMLCanvasElement): ContourLinesState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('contour lines effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, CONTOUR_LINES_VS, CONTOUR_LINES_FS);

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
		sourceTexture: createTexture(gl),
		colorCtx,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uLineColor: gl.getUniformLocation(program, 'uLineColor'),
			uLineWidth: gl.getUniformLocation(program, 'uLineWidth'),
			uSpacing: gl.getUniformLocation(program, 'uSpacing'),
			uScale: gl.getUniformLocation(program, 'uScale'),
			uComplexity: gl.getUniformLocation(program, 'uComplexity'),
			uSmoothness: gl.getUniformLocation(program, 'uSmoothness'),
			uSeed: gl.getUniformLocation(program, 'uSeed'),
			uOffset: gl.getUniformLocation(program, 'uOffset'),
			uOpacity: gl.getUniformLocation(program, 'uOpacity'),
			uMaskToSourceAlpha: gl.getUniformLocation(program, 'uMaskToSourceAlpha'),
		},
		cachedLineColor: '',
		cachedLineColorRgba: [255, 255, 255, 255],
	};
};

export const contourLines = createEffect<ContourLinesParams, ContourLinesState>(
	{
		type: 'dev.remotion.effects.contourLines',
		label: 'contourLines()',
		documentationLink: 'https://www.remotion.dev/docs/effects/contour-lines',
		backend: 'webgl2',
		calculateKey: (params) => {
			const r = resolve(params);
			const maskSuffix = r.maskToSourceAlpha ? '-mask-to-source-alpha' : '';
			return `contour-lines-${r.lineColor}-${r.lineWidth}-${r.spacing}-${r.scale}-${r.complexity}-${r.smoothness}-${r.seed}-${r.offsetX}-${r.offsetY}-${r.opacity}${maskSuffix}`;
		},
		setup: (target) => setupContourLines(target),
		apply: ({source, width, height, params, state, flipSourceY}) => {
			const r = resolve(params);
			const {gl, program, sourceTexture, uniforms, vao} = state;

			if (state.cachedLineColor !== r.lineColor) {
				state.cachedLineColor = r.lineColor;
				state.cachedLineColorRgba = parseColorRgba(state.colorCtx, r.lineColor);
			}

			const [cr, cg, cb, ca] = state.cachedLineColorRgba;

			gl.viewport(0, 0, width, height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
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
			if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
			if (uniforms.uResolution)
				gl.uniform2f(uniforms.uResolution, width, height);
			if (uniforms.uLineColor) {
				gl.uniform4f(
					uniforms.uLineColor,
					cr / 255,
					cg / 255,
					cb / 255,
					ca / 255,
				);
			}

			if (uniforms.uLineWidth) gl.uniform1f(uniforms.uLineWidth, r.lineWidth);
			if (uniforms.uSpacing) gl.uniform1f(uniforms.uSpacing, r.spacing);
			if (uniforms.uScale) gl.uniform1f(uniforms.uScale, r.scale);
			if (uniforms.uComplexity)
				gl.uniform1f(uniforms.uComplexity, r.complexity);
			if (uniforms.uSmoothness)
				gl.uniform1f(uniforms.uSmoothness, r.smoothness);
			if (uniforms.uSeed) gl.uniform1f(uniforms.uSeed, r.seed);
			if (uniforms.uOffset)
				gl.uniform2f(uniforms.uOffset, r.offsetX, r.offsetY);
			if (uniforms.uOpacity) gl.uniform1f(uniforms.uOpacity, r.opacity);
			if (uniforms.uMaskToSourceAlpha)
				gl.uniform1i(uniforms.uMaskToSourceAlpha, r.maskToSourceAlpha ? 1 : 0);

			gl.bindVertexArray(vao);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			gl.bindVertexArray(null);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.useProgram(null);
		},
		cleanup: ({gl, program, vao, vbo, sourceTexture}) => {
			gl.deleteTexture(sourceTexture);
			gl.deleteBuffer(vbo);
			gl.deleteProgram(program);
			gl.deleteVertexArray(vao);
		},
		schema: contourLinesSchema,
		validateParams: validateContourLinesParams,
	},
);
