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

const WAVE_DIRECTIONS = ['horizontal', 'vertical'] as const;

const DEFAULT_COLORS = ['#dff4ff', '#7cc6ff'] as const;
const DEFAULT_DIRECTION = 'horizontal' as const;
const DEFAULT_THICKNESS = 40 as const;
const DEFAULT_GAP = 0 as const;
const DEFAULT_ANGLE = 0 as const;
const DEFAULT_OFFSET = 0 as const;
const DEFAULT_AMPLITUDE = 24 as const;
const DEFAULT_WAVELENGTH = 160 as const;
const DEFAULT_PHASE = 0 as const;
const DEFAULT_MASK_TO_SOURCE_ALPHA = false as const;

export const wavesSchema = {
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
	direction: {
		type: 'enum',
		variants: {
			horizontal: {},
			vertical: {},
		},
		default: DEFAULT_DIRECTION,
		description: 'Direction',
	},
	thickness: {
		type: 'number',
		min: 0.1,
		max: 400,
		step: 0.1,
		default: DEFAULT_THICKNESS,
		description: 'Thickness',
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
	offset: {
		type: 'number',
		step: 0.1,
		default: DEFAULT_OFFSET,
		description: 'Offset',
		hiddenFromList: false,
	},
	amplitude: {
		type: 'number',
		min: 0,
		max: 500,
		step: 0.1,
		default: DEFAULT_AMPLITUDE,
		description: 'Amplitude',
		hiddenFromList: false,
	},
	wavelength: {
		type: 'number',
		min: 1,
		max: 2000,
		step: 1,
		default: DEFAULT_WAVELENGTH,
		description: 'Wavelength',
		hiddenFromList: false,
	},
	phase: {
		type: 'number',
		min: -360,
		max: 360,
		step: 1,
		default: DEFAULT_PHASE,
		description: 'Phase',
		hiddenFromList: false,
	},
	maskToSourceAlpha: {
		type: 'boolean',
		default: DEFAULT_MASK_TO_SOURCE_ALPHA,
		description: 'Mask to source alpha',
	},
} as const satisfies InteractivitySchema;

export type WavesDirection = (typeof WAVE_DIRECTIONS)[number];

export type WavesParams = {
	/** Stripe colors, assigned cyclically. Defaults to light blue shades. */
	readonly colors?: readonly string[];
	/** Base band direction. Defaults to `horizontal`. */
	readonly direction?: WavesDirection;
	/** Thickness of each stripe in pixels. Defaults to `40`. */
	readonly thickness?: number;
	/** Transparent gap in pixels between each stripe. Defaults to `0`. */
	readonly gap?: number;
	/** Rotates the pattern in degrees. Defaults to `0`. */
	readonly angle?: number;
	/** Offset in pixels. Animate to scroll through the bands. Defaults to `0`. */
	readonly offset?: number;
	/** Wave displacement in pixels. Defaults to `24`. */
	readonly amplitude?: number;
	/** Distance in pixels before the wave repeats. Defaults to `160`. */
	readonly wavelength?: number;
	/** Wave phase in degrees. Defaults to `0`. */
	readonly phase?: number;
	/** Masks the generated wave pattern to the source alpha channel. Defaults to `false`. */
	readonly maskToSourceAlpha?: boolean;
};

type WavesResolved = {
	colors: readonly string[];
	direction: WavesDirection;
	thickness: number;
	spacing: number;
	angle: number;
	offset: number;
	amplitude: number;
	wavelength: number;
	phase: number;
	maskToSourceAlpha: boolean;
};

type WavesState = {
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
		readonly uDirection: WebGLUniformLocation | null;
		readonly uThickness: WebGLUniformLocation | null;
		readonly uSpacing: WebGLUniformLocation | null;
		readonly uAngle: WebGLUniformLocation | null;
		readonly uOffset: WebGLUniformLocation | null;
		readonly uAmplitude: WebGLUniformLocation | null;
		readonly uWavelength: WebGLUniformLocation | null;
		readonly uPhase: WebGLUniformLocation | null;
		readonly uMaskToSourceAlpha: WebGLUniformLocation | null;
	};
	cachedPaletteKey: string;
	palettePixelData: Uint8Array;
};

const resolve = (p: WavesParams): WavesResolved => {
	const thickness = p.thickness ?? DEFAULT_THICKNESS;
	const gap = p.gap ?? DEFAULT_GAP;

	return {
		colors: p.colors ?? DEFAULT_COLORS,
		direction: p.direction ?? DEFAULT_DIRECTION,
		thickness,
		spacing: thickness + gap,
		angle: p.angle ?? DEFAULT_ANGLE,
		offset: p.offset ?? DEFAULT_OFFSET,
		amplitude: p.amplitude ?? DEFAULT_AMPLITUDE,
		wavelength: p.wavelength ?? DEFAULT_WAVELENGTH,
		phase: p.phase ?? DEFAULT_PHASE,
		maskToSourceAlpha: p.maskToSourceAlpha ?? DEFAULT_MASK_TO_SOURCE_ALPHA,
	};
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

const validateDirection = (direction: unknown): void => {
	if (direction === undefined) {
		return;
	}

	if (
		typeof direction !== 'string' ||
		!WAVE_DIRECTIONS.includes(direction as WavesDirection)
	) {
		throw new TypeError(
			`"direction" must be ${formatEnum(WAVE_DIRECTIONS)}, but got ${JSON.stringify(direction)}`,
		);
	}
};

const validateWavesParams = (params: WavesParams): void => {
	assertEffectParamsObject(params, 'Waves');
	validateColors(params.colors);
	validateDirection(params.direction);
	assertOptionalFiniteNumber(params.thickness, 'thickness');
	assertOptionalFiniteNumber(params.gap, 'gap');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.offset, 'offset');
	assertOptionalFiniteNumber(params.amplitude, 'amplitude');
	assertOptionalFiniteNumber(params.wavelength, 'wavelength');
	assertOptionalFiniteNumber(params.phase, 'phase');
	assertOptionalBoolean(params.maskToSourceAlpha, 'maskToSourceAlpha');

	const thickness = params.thickness ?? DEFAULT_THICKNESS;
	const gap = params.gap ?? DEFAULT_GAP;
	const amplitude = params.amplitude ?? DEFAULT_AMPLITUDE;
	const wavelength = params.wavelength ?? DEFAULT_WAVELENGTH;

	validatePositive(thickness, 'thickness');
	validateNonNegative(gap, 'gap');
	validateNonNegative(amplitude, 'amplitude');
	validatePositive(wavelength, 'wavelength');
};

const WAVES_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const WAVES_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform sampler2D uPalette;
uniform vec2 uResolution;
uniform float uNumColors;
uniform int uDirection;
uniform float uThickness;
uniform float uSpacing;
uniform float uAngle;
uniform float uOffset;
uniform float uAmplitude;
uniform float uWavelength;
uniform float uPhase;
uniform bool uMaskToSourceAlpha;

void main() {
	vec4 texColor = texture(uSource, vUv);
	float thickness = max(uThickness, 0.001);
	float spacing = max(uSpacing, 0.001);
	float cycle = spacing * uNumColors;
	vec2 centered = vUv * uResolution - uResolution * 0.5;
	float s = sin(uAngle);
	float c = cos(uAngle);
	vec2 rotated = vec2(
		centered.x * c - centered.y * s,
		centered.x * s + centered.y * c
	);
	float baseAxis = uDirection == 0 ? rotated.y : rotated.x;
	float waveAxis = uDirection == 0 ? rotated.x : rotated.y;
	float waveOffset =
		sin((waveAxis / max(uWavelength, 0.001)) * 6.283185307179586 + uPhase) *
		uAmplitude;
	float position = mod(baseAxis + waveOffset + uOffset, cycle);
	if (position < 0.0) {
		position += cycle;
	}

	float colorIndex = floor(position / spacing);
	float inStripe = mod(position, spacing);
	if (inStripe > thickness) {
		fragColor = texColor;
		return;
	}

	float texCoord = (colorIndex + 0.5) / uNumColors;
	vec4 lineColor = texture(uPalette, vec2(texCoord, 0.5));
	float lineAlpha = lineColor.a;
	vec3 premultipliedLine = lineColor.rgb * lineAlpha;

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
		throw new Error(`Waves shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Waves program link failed: ${log ?? '(no log)'}`);
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

const setupWaves = (target: HTMLCanvasElement): WavesState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('waves effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, WAVES_VS, WAVES_FS);

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
			uDirection: gl.getUniformLocation(program, 'uDirection'),
			uThickness: gl.getUniformLocation(program, 'uThickness'),
			uSpacing: gl.getUniformLocation(program, 'uSpacing'),
			uAngle: gl.getUniformLocation(program, 'uAngle'),
			uOffset: gl.getUniformLocation(program, 'uOffset'),
			uAmplitude: gl.getUniformLocation(program, 'uAmplitude'),
			uWavelength: gl.getUniformLocation(program, 'uWavelength'),
			uPhase: gl.getUniformLocation(program, 'uPhase'),
			uMaskToSourceAlpha: gl.getUniformLocation(program, 'uMaskToSourceAlpha'),
		},
		cachedPaletteKey: '',
		palettePixelData: new Uint8Array(0),
	};
};

const updatePalette = (
	state: WavesState,
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

export const waves = createEffect<WavesParams, WavesState>({
	type: 'dev.remotion.effects.waves',
	label: 'waves()',
	documentationLink: 'https://www.remotion.dev/docs/effects/waves',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		const maskSuffix = r.maskToSourceAlpha ? '-mask-to-source-alpha' : '';
		return `waves-${r.colors.join('|')}-${r.direction}-${r.thickness}-${r.spacing}-${r.angle}-${r.offset}-${r.amplitude}-${r.wavelength}-${r.phase}${maskSuffix}`;
	},
	setup: (target) => setupWaves(target),
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
		if (uniforms.uResolution) gl.uniform2f(uniforms.uResolution, width, height);
		if (uniforms.uNumColors) gl.uniform1f(uniforms.uNumColors, r.colors.length);
		if (uniforms.uDirection)
			gl.uniform1i(uniforms.uDirection, r.direction === 'horizontal' ? 0 : 1);
		if (uniforms.uThickness) gl.uniform1f(uniforms.uThickness, r.thickness);
		if (uniforms.uSpacing) gl.uniform1f(uniforms.uSpacing, r.spacing);
		if (uniforms.uAngle)
			gl.uniform1f(uniforms.uAngle, (r.angle * Math.PI) / 180);
		if (uniforms.uOffset) gl.uniform1f(uniforms.uOffset, r.offset);
		if (uniforms.uAmplitude) gl.uniform1f(uniforms.uAmplitude, r.amplitude);
		if (uniforms.uWavelength) gl.uniform1f(uniforms.uWavelength, r.wavelength);
		if (uniforms.uPhase)
			gl.uniform1f(uniforms.uPhase, (r.phase * Math.PI) / 180);
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
	schema: wavesSchema,
	validateParams: validateWavesParams,
});
