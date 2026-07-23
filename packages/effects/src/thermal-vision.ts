import {Internals, type InteractivitySchema} from 'remotion';
import {
	assertOptionalFiniteNumber,
	colorAmountSchema,
	parseColorRgba,
	type ParsedColorRgba,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertRequiredColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 1 as const;
const DEFAULT_PALETTE = [
	'#020617',
	'#1238ff',
	'#00a6ff',
	'#00c853',
	'#d6f542',
	'#ffb000',
	'#ff2f00',
	'#ffffff',
] as const;

export const thermalVisionSchema = {
	amount: colorAmountSchema,
	palette: {
		type: 'array',
		item: {
			type: 'color',
		},
		default: DEFAULT_PALETTE,
		minLength: 2,
		newItemDefault: '#00c853',
		description: 'Palette',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

export type ThermalVisionParams = {
	/** Blend amount from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
	/** Color ramp used from dark to bright pixels. Defaults to a blue, green, yellow, red and white ramp. */
	readonly palette?: readonly string[];
};

type ThermalVisionResolved = {
	amount: number;
	palette: readonly string[];
};

type ThermalVisionState = {
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
		readonly uPaletteLength: WebGLUniformLocation | null;
		readonly uAmount: WebGLUniformLocation | null;
	};
	cachedPaletteKey: string;
	palettePixelData: Uint8Array;
};

const resolve = (p: ThermalVisionParams): ThermalVisionResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	palette: p.palette ?? DEFAULT_PALETTE,
});

const validatePalette = (palette: unknown): void => {
	if (palette === undefined) {
		return;
	}

	if (!Array.isArray(palette) || palette.length < 2) {
		throw new TypeError(
			`"palette" must be an array with at least 2 colors, but got ${JSON.stringify(palette)}`,
		);
	}

	for (let i = 0; i < palette.length; i++) {
		assertRequiredColor(palette[i], `palette[${i}]`);
	}
};

const validateThermalVisionParams = (params: ThermalVisionParams): void => {
	assertEffectParamsObject(params, 'Thermal vision');
	assertOptionalFiniteNumber(params.amount, 'amount');
	validatePalette(params.palette);

	const {amount} = resolve(params);
	validateUnitInterval(amount, 'amount');
};

const THERMAL_VISION_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const THERMAL_VISION_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform sampler2D uPalette;
uniform float uPaletteLength;
uniform float uAmount;

vec3 paletteColor(float luminance) {
	float length = max(uPaletteLength, 2.0);
	float texCoord = (clamp(luminance, 0.0, 1.0) * (length - 1.0) + 0.5) / length;
	return texture(uPalette, vec2(texCoord, 0.5)).rgb;
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 rgb = texColor.rgb / alpha;
	float luminance = dot(rgb, vec3(0.299, 0.587, 0.114));
	vec3 thermalRgb = paletteColor(luminance);
	vec3 mixedRgb = mix(rgb, thermalRgb, clamp(uAmount, 0.0, 1.0));

	fragColor = vec4(mixedRgb * alpha, alpha);
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
			`Thermal vision shader compile failed: ${log ?? '(no log)'}`,
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
		throw new Error(`Thermal vision program link failed: ${log ?? '(no log)'}`);
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

const setupThermalVision = (target: HTMLCanvasElement): ThermalVisionState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('thermal vision effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, THERMAL_VISION_VS, THERMAL_VISION_FS);

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
		paletteTexture: createTexture(gl, gl.LINEAR),
		colorCtx,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uPalette: gl.getUniformLocation(program, 'uPalette'),
			uPaletteLength: gl.getUniformLocation(program, 'uPaletteLength'),
			uAmount: gl.getUniformLocation(program, 'uAmount'),
		},
		cachedPaletteKey: '',
		palettePixelData: new Uint8Array(0),
	};
};

const updatePalette = (
	state: ThermalVisionState,
	palette: readonly string[],
): boolean => {
	const paletteKey = palette.join('|');
	const paletteDirty = state.cachedPaletteKey !== paletteKey;
	if (!paletteDirty) {
		return false;
	}

	state.cachedPaletteKey = paletteKey;
	const len = palette.length * 4;
	if (state.palettePixelData.length !== len) {
		state.palettePixelData = new Uint8Array(len);
	}

	const {palettePixelData} = state;
	for (let i = 0; i < palette.length; i++) {
		const color: ParsedColorRgba = parseColorRgba(state.colorCtx, palette[i]);
		palettePixelData[i * 4] = color[0];
		palettePixelData[i * 4 + 1] = color[1];
		palettePixelData[i * 4 + 2] = color[2];
		palettePixelData[i * 4 + 3] = color[3];
	}

	return true;
};

export const thermalVision = createEffect<
	ThermalVisionParams,
	ThermalVisionState
>({
	type: 'remotion/thermal-vision',
	label: 'thermalVision()',
	documentationLink: 'https://www.remotion.dev/docs/effects/thermal-vision',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `thermal-vision-${r.amount}-${r.palette.join('|')}`;
	},
	setup: (target) => setupThermalVision(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const paletteDirty = updatePalette(state, r.palette);
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
				r.palette.length,
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
		if (uniforms.uPaletteLength)
			gl.uniform1f(uniforms.uPaletteLength, r.palette.length);
		if (uniforms.uAmount) gl.uniform1f(uniforms.uAmount, r.amount);

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
	schema: thermalVisionSchema,
	validateParams: validateThermalVisionParams,
});
