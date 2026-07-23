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
	assertRequiredColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_COLORS = ['#dff4ff', '#7cc6ff'] as const;
const DEFAULT_CELL_SIZE = 80 as const;
const DEFAULT_GAP = 0 as const;
const DEFAULT_ANGLE = 0 as const;
const DEFAULT_OFFSET_X = 0 as const;
const DEFAULT_OFFSET_Y = 0 as const;
const DEFAULT_MASK_TO_SOURCE_ALPHA = false as const;

export const checkerboardSchema = {
	colors: {
		type: 'array',
		item: {
			type: 'color',
		},
		default: DEFAULT_COLORS,
		minLength: 2,
		newItemDefault: '#ff0000',
		description: 'Colors',
		keyframable: false,
	},
	cellSize: {
		type: 'number',
		min: 0.1,
		max: 800,
		step: 0.1,
		default: DEFAULT_CELL_SIZE,
		description: 'Cell size',
		hiddenFromList: false,
	},
	gap: {
		type: 'number',
		min: 0,
		max: 400,
		step: 0.1,
		default: DEFAULT_GAP,
		description: 'Gap',
		hiddenFromList: false,
	},
	angle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ANGLE,
		description: 'Angle',
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
	maskToSourceAlpha: {
		type: 'boolean',
		default: DEFAULT_MASK_TO_SOURCE_ALPHA,
		description: 'Mask to source alpha',
	},
} as const satisfies InteractivitySchema;

export type CheckerboardParams = {
	/** Checker colors, assigned cyclically. Same semantics as lines(). */
	readonly colors?: readonly string[];
	/** Size of each square cell in pixels. */
	readonly cellSize?: number;
	/** Transparent gap in pixels between cells. Same as lines(). */
	readonly gap?: number;
	/** Rotates the full pattern in degrees. Same as lines(). */
	readonly angle?: number;
	/** Horizontal offset in pixels. Animate to scroll the cells. */
	readonly offsetX?: number;
	/** Vertical offset in pixels. Animate to scroll the cells. */
	readonly offsetY?: number;
	/** Masks the generated checkerboard pattern to the source alpha channel. Defaults to `false`. */
	readonly maskToSourceAlpha?: boolean;
};

type CheckerboardResolved = {
	colors: readonly string[];
	cellSize: number;
	spacing: number;
	angle: number;
	offsetX: number;
	offsetY: number;
	maskToSourceAlpha: boolean;
};

type CheckerboardState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly paletteTexture: WebGLTexture;
	readonly colorCtx: CanvasRenderingContext2D;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uPalette: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uNumColors: WebGLUniformLocation | null;
		readonly uCellSize: WebGLUniformLocation | null;
		readonly uSpacing: WebGLUniformLocation | null;
		readonly uAngle: WebGLUniformLocation | null;
		readonly uOffset: WebGLUniformLocation | null;
		readonly uMaskToSourceAlpha: WebGLUniformLocation | null;
	};
	cachedPaletteKey: string;
	palettePixelData: Uint8Array;
};

const resolve = (p: CheckerboardParams): CheckerboardResolved => {
	const cellSize = p.cellSize ?? DEFAULT_CELL_SIZE;
	const gap = p.gap ?? DEFAULT_GAP;

	return {
		colors: p.colors ?? DEFAULT_COLORS,
		cellSize,
		spacing: cellSize + gap,
		angle: p.angle ?? DEFAULT_ANGLE,
		offsetX: p.offsetX ?? DEFAULT_OFFSET_X,
		offsetY: p.offsetY ?? DEFAULT_OFFSET_Y,
		maskToSourceAlpha: p.maskToSourceAlpha ?? DEFAULT_MASK_TO_SOURCE_ALPHA,
	};
};

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateNonNegative = (value: number, name: string): void => {
	if (value < 0) {
		throw new TypeError(
			`"${name}" must be greater than or equal to 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateColors = (colors: unknown): void => {
	if (colors === undefined) {
		return;
	}

	if (!Array.isArray(colors) || colors.length < 2) {
		throw new TypeError(
			`"colors" must be an array with at least 2 colors, but got ${JSON.stringify(colors)}`,
		);
	}

	for (let i = 0; i < colors.length; i++) {
		assertRequiredColor(colors[i], `colors[${i}]`);
	}
};

const validateCheckerboardParams = (params: CheckerboardParams): void => {
	assertEffectParamsObject(params, 'Checkerboard');
	validateColors(params.colors);
	assertOptionalFiniteNumber(params.cellSize, 'cellSize');
	assertOptionalFiniteNumber(params.gap, 'gap');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalBoolean(params.maskToSourceAlpha, 'maskToSourceAlpha');

	const cellSize = params.cellSize ?? DEFAULT_CELL_SIZE;
	const gap = params.gap ?? DEFAULT_GAP;
	validatePositive(cellSize, 'cellSize');
	validateNonNegative(gap, 'gap');
};

const CHECKERBOARD_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const CHECKERBOARD_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform sampler2D uPalette;
uniform vec2 uResolution;
uniform float uNumColors;
uniform float uCellSize;
uniform float uSpacing;
uniform float uAngle;
uniform vec2 uOffset;
uniform bool uMaskToSourceAlpha;

void main() {
	vec4 texColor = texture(uSource, vUv);
	float cellSize = max(uCellSize, 0.001);
	float spacing = max(uSpacing, 0.001);
	vec2 centered = vUv * uResolution - uResolution * 0.5;
	float s = sin(uAngle);
	float c = cos(uAngle);
	vec2 rotated = vec2(
		centered.x * c - centered.y * s,
		centered.x * s + centered.y * c
	);
	vec2 position = rotated + uOffset;
	vec2 localPosition = mod(position, spacing);
	if (localPosition.x < 0.0) {
		localPosition.x += spacing;
	}
	if (localPosition.y < 0.0) {
		localPosition.y += spacing;
	}

	if (localPosition.x > cellSize || localPosition.y > cellSize) {
		fragColor = texColor;
		return;
	}

	vec2 cell = floor(position / spacing);
	float colorIndex = mod(cell.x + cell.y, uNumColors);
	if (colorIndex < 0.0) {
		colorIndex += uNumColors;
	}

	float texCoord = (colorIndex + 0.5) / uNumColors;
	vec4 checkerColor = texture(uPalette, vec2(texCoord, 0.5));
	float checkerAlpha = checkerColor.a;
	vec3 premultipliedChecker = checkerColor.rgb * checkerAlpha;

	if (uMaskToSourceAlpha) {
		fragColor = vec4(
			premultipliedChecker * texColor.a + texColor.rgb * (1.0 - checkerAlpha),
			texColor.a
		);
		return;
	}

	fragColor = vec4(
		premultipliedChecker + texColor.rgb * (1.0 - checkerAlpha),
		checkerAlpha + texColor.a * (1.0 - checkerAlpha)
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
		throw new Error(`Checkerboard shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Checkerboard program link failed: ${log ?? '(no log)'}`);
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

const createTexture = (
	gl: WebGL2RenderingContext,
	filter: number,
): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create WebGL texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const setupCheckerboard = (target: HTMLCanvasElement): CheckerboardState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('checkerboard effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, CHECKERBOARD_VS, CHECKERBOARD_FS);

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
		sourceTexture: createTexture(gl, gl.LINEAR),
		paletteTexture: createTexture(gl, gl.NEAREST),
		colorCtx,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uPalette: gl.getUniformLocation(program, 'uPalette'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uNumColors: gl.getUniformLocation(program, 'uNumColors'),
			uCellSize: gl.getUniformLocation(program, 'uCellSize'),
			uSpacing: gl.getUniformLocation(program, 'uSpacing'),
			uAngle: gl.getUniformLocation(program, 'uAngle'),
			uOffset: gl.getUniformLocation(program, 'uOffset'),
			uMaskToSourceAlpha: gl.getUniformLocation(program, 'uMaskToSourceAlpha'),
		},
		cachedPaletteKey: '',
		palettePixelData: new Uint8Array(0),
	};
};

const updatePalette = (
	state: CheckerboardState,
	colors: readonly string[],
): boolean => {
	const paletteKey = colors.join('|');
	const paletteDirty = state.cachedPaletteKey !== paletteKey;
	if (!paletteDirty) {
		return false;
	}

	state.cachedPaletteKey = paletteKey;
	const len = colors.length * 4;
	if (state.palettePixelData.length !== len) {
		state.palettePixelData = new Uint8Array(len);
	}

	const {palettePixelData} = state;
	for (let i = 0; i < colors.length; i++) {
		const color: ParsedColorRgba = parseColorRgba(state.colorCtx, colors[i]);
		palettePixelData[i * 4] = color[0];
		palettePixelData[i * 4 + 1] = color[1];
		palettePixelData[i * 4 + 2] = color[2];
		palettePixelData[i * 4 + 3] = color[3];
	}

	return true;
};

export const checkerboard = createEffect<CheckerboardParams, CheckerboardState>(
	{
		type: 'remotion/checkerboard',
		label: 'checkerboard()',
		documentationLink: 'https://www.remotion.dev/docs/effects/checkerboard',
		backend: 'webgl2',
		calculateKey: (params) => {
			const r = resolve(params);
			const maskSuffix = r.maskToSourceAlpha ? '-mask-to-source-alpha' : '';
			return `checkerboard-${r.colors.join('|')}-${r.cellSize}-${r.spacing}-${r.angle}-${r.offsetX}-${r.offsetY}${maskSuffix}`;
		},
		setup: (target) => setupCheckerboard(target),
		apply: ({source, width, height, params, state, flipSourceY}) => {
			const r = resolve(params);
			const paletteDirty = updatePalette(state, r.colors);
			const {gl, program, sourceTexture, paletteTexture, uniforms, vao} = state;

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

			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
			if (paletteDirty) {
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					r.colors.length,
					1,
					0,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					state.palettePixelData,
				);
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
			}

			gl.useProgram(program);
			if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
			if (uniforms.uPalette) gl.uniform1i(uniforms.uPalette, 1);
			if (uniforms.uResolution)
				gl.uniform2f(uniforms.uResolution, width, height);
			if (uniforms.uNumColors)
				gl.uniform1f(uniforms.uNumColors, r.colors.length);
			if (uniforms.uCellSize) gl.uniform1f(uniforms.uCellSize, r.cellSize);
			if (uniforms.uSpacing) gl.uniform1f(uniforms.uSpacing, r.spacing);
			if (uniforms.uAngle)
				gl.uniform1f(uniforms.uAngle, (r.angle * Math.PI) / 180);
			if (uniforms.uOffset)
				gl.uniform2f(uniforms.uOffset, r.offsetX, r.offsetY);
			if (uniforms.uMaskToSourceAlpha)
				gl.uniform1i(uniforms.uMaskToSourceAlpha, r.maskToSourceAlpha ? 1 : 0);

			gl.bindVertexArray(vao);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			gl.bindVertexArray(null);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.useProgram(null);
		},
		cleanup: ({gl, program, vao, vbo, sourceTexture, paletteTexture}) => {
			gl.deleteTexture(sourceTexture);
			gl.deleteTexture(paletteTexture);
			gl.deleteBuffer(vbo);
			gl.deleteProgram(program);
			gl.deleteVertexArray(vao);
		},
		schema: checkerboardSchema,
		validateParams: validateCheckerboardParams,
	},
);
