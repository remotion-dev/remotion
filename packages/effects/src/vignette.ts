import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateUnitInterval,
} from './color-utils.js';
import {publicUvToShaderUv} from './uv-coordinate.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const VIGNETTE_MODES = ['color', 'alpha'] as const;

const DEFAULT_AMOUNT = 0.5 as const;
const DEFAULT_RADIUS = 0.65 as const;
const DEFAULT_FEATHER = 0.35 as const;
const DEFAULT_ROUNDNESS = 1 as const;
const DEFAULT_COLOR = '#000000' as const;
const DEFAULT_MODE = 'color' as const;
const DEFAULT_CENTER = [0.5, 0.5] as const;

export const vignetteSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	radius: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_RADIUS,
		description: 'Radius',
		hiddenFromList: false,
	},
	feather: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_FEATHER,
		description: 'Feather',
		hiddenFromList: false,
	},
	roundness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_ROUNDNESS,
		description: 'Roundness',
		hiddenFromList: false,
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
	mode: {
		type: 'enum',
		default: DEFAULT_MODE,
		description: 'Mode',
		variants: {
			color: {},
			alpha: {},
		},
	},
	center: {
		type: 'uv-coordinate',
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
	},
} as const satisfies InteractivitySchema;

export type VignetteMode = (typeof VIGNETTE_MODES)[number];
export type VignetteCenter = readonly [number, number];

export type VignetteParams = {
	/** Strength of the vignette from `0` to `1`. Defaults to `0.5`. */
	readonly amount?: number;
	/** Size of the unaffected center from `0` to `1`. Defaults to `0.65`. */
	readonly radius?: number;
	/** Softness of the vignette edge from `0` to `1`. Defaults to `0.35`. */
	readonly feather?: number;
	/** Shape from rectangular (`0`) to elliptical (`1`). Defaults to `1`. */
	readonly roundness?: number;
	/** Color blended into the edges in `color` mode. Defaults to black. */
	readonly color?: string;
	/** `color` blends a color into the edges, `alpha` fades edges transparent. Defaults to `color`. */
	readonly mode?: VignetteMode;
	/** Center of the vignette in UV coordinates. Defaults to `[0.5, 0.5]`. */
	readonly center?: VignetteCenter;
};

type VignetteResolved = {
	amount: number;
	radius: number;
	feather: number;
	roundness: number;
	color: string;
	mode: VignetteMode;
	center: VignetteCenter;
};

type VignetteState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uAmount: WebGLUniformLocation | null;
		readonly uRadius: WebGLUniformLocation | null;
		readonly uFeather: WebGLUniformLocation | null;
		readonly uRoundness: WebGLUniformLocation | null;
		readonly uColor: WebGLUniformLocation | null;
		readonly uMode: WebGLUniformLocation | null;
		readonly uCenter: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedColorRgba: ParsedColorRgba;
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

	if (!variants.includes(value as T)) {
		throw new TypeError(
			`"${name}" must be ${formatEnum(variants)}, but got ${JSON.stringify(value)}`,
		);
	}
};

const resolve = (p: VignetteParams): VignetteResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	radius: p.radius ?? DEFAULT_RADIUS,
	feather: p.feather ?? DEFAULT_FEATHER,
	roundness: p.roundness ?? DEFAULT_ROUNDNESS,
	color: p.color ?? DEFAULT_COLOR,
	mode: p.mode ?? DEFAULT_MODE,
	center: [...(p.center ?? DEFAULT_CENTER)] as VignetteCenter,
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

const validateVignetteParams = (params: VignetteParams): void => {
	assertEffectParamsObject(params, 'Vignette');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.radius, 'radius');
	assertOptionalFiniteNumber(params.feather, 'feather');
	assertOptionalFiniteNumber(params.roundness, 'roundness');
	assertOptionalColor(params.color, 'color');
	assertOptionalEnum(params.mode, 'mode', VIGNETTE_MODES);
	assertOptionalUvCoordinate(params.center, 'center');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validateUnitInterval(r.radius, 'radius');
	validateUnitInterval(r.feather, 'feather');
	validateUnitInterval(r.roundness, 'roundness');
};

const VIGNETTE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const VIGNETTE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAmount;
uniform float uRadius;
uniform float uFeather;
uniform float uRoundness;
uniform vec4 uColor;
uniform int uMode;
uniform vec2 uCenter;

float vignetteMask() {
	vec2 centered = abs(vUv - uCenter) * 2.0;
	float rectangleDistance = max(centered.x, centered.y);
	float ellipseDistance = length(centered);
	float distanceFromCenter = mix(rectangleDistance, ellipseDistance, uRoundness);

	if (uFeather <= 0.0001) {
		return distanceFromCenter >= uRadius ? uAmount : 0.0;
	}

	return smoothstep(uRadius, uRadius + uFeather, distanceFromCenter) * uAmount;
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;
	float mask = vignetteMask();

	if (uMode == 1) {
		float outputAlpha = alpha * (1.0 - mask);
		fragColor = vec4(texColor.rgb * (1.0 - mask), outputAlpha);
		return;
	}

	float overlayAlpha = mask * uColor.a;
	vec3 outputRgb = uColor.rgb * overlayAlpha + texColor.rgb * (1.0 - overlayAlpha);
	float outputAlpha = overlayAlpha + alpha * (1.0 - overlayAlpha);
	fragColor = vec4(outputRgb, outputAlpha);
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
		throw new Error(`Vignette shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Vignette program link failed: ${log ?? '(no log)'}`);
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

const createRgbaTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
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

const setupVignette = (target: HTMLCanvasElement): VignetteState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('vignette effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, VIGNETTE_VS, VIGNETTE_FS);
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

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

	gl.bindVertexArray(null);

	const textureSource = createRgbaTexture(gl);
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
		textureSource,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uAmount: gl.getUniformLocation(program, 'uAmount'),
			uRadius: gl.getUniformLocation(program, 'uRadius'),
			uFeather: gl.getUniformLocation(program, 'uFeather'),
			uRoundness: gl.getUniformLocation(program, 'uRoundness'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uMode: gl.getUniformLocation(program, 'uMode'),
			uCenter: gl.getUniformLocation(program, 'uCenter'),
		},
		colorCtx,
		cachedColor: '',
		cachedColorRgba: [0, 0, 0, 255],
	};
};

const getParsedColor = (
	state: VignetteState,
	resolved: VignetteResolved,
): ParsedColorRgba => {
	if (state.cachedColor !== resolved.color) {
		state.cachedColor = resolved.color;
		state.cachedColorRgba = parseColorRgba(state.colorCtx, resolved.color);
	}

	return state.cachedColorRgba;
};

const normalizedRgba = (
	color: ParsedColorRgba,
): readonly [number, number, number, number] => {
	return [color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255];
};

export const vignette = createEffect<VignetteParams, VignetteState>({
	type: 'dev.remotion.effects.vignette',
	label: 'vignette()',
	documentationLink: 'https://www.remotion.dev/docs/effects/vignette',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `vignette-${r.amount}-${r.radius}-${r.feather}-${r.roundness}-${r.color}-${r.mode}-${r.center.join(':')}`;
	},
	setup: (target) => setupVignette(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const color = getParsedColor(state, r);
		const [red, green, blue, alpha] = normalizedRgba(color);
		const {gl, program, textureSource, uniforms, vao} = state;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textureSource);
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
		if (uniforms.uAmount) gl.uniform1f(uniforms.uAmount, r.amount);
		if (uniforms.uRadius) gl.uniform1f(uniforms.uRadius, r.radius);
		if (uniforms.uFeather) gl.uniform1f(uniforms.uFeather, r.feather);
		if (uniforms.uRoundness) gl.uniform1f(uniforms.uRoundness, r.roundness);
		if (uniforms.uColor) gl.uniform4f(uniforms.uColor, red, green, blue, alpha);
		if (uniforms.uMode)
			gl.uniform1i(uniforms.uMode, r.mode === 'alpha' ? 1 : 0);
		if (uniforms.uCenter) {
			const shaderCenter = publicUvToShaderUv(r.center);
			gl.uniform2f(uniforms.uCenter, shaderCenter[0], shaderCenter[1]);
		}

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, textureSource}) => {
		gl.deleteTexture(textureSource);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: vignetteSchema,
	validateParams: validateVignetteParams,
});
