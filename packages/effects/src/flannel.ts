import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 0.7 as const;
const DEFAULT_SIZE = 96 as const;
const DEFAULT_SOFTNESS = 0.18 as const;
const DEFAULT_BASE_COLOR = '#b51f2e' as const;
const DEFAULT_STRIPE_COLOR = '#16233f' as const;

const flannelSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	size: {
		type: 'number',
		min: 1,
		max: 500,
		step: 1,
		default: DEFAULT_SIZE,
		description: 'Pattern size',
		hiddenFromList: false,
	},
	softness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SOFTNESS,
		description: 'Softness',
		hiddenFromList: false,
	},
	baseColor: {
		type: 'color',
		default: DEFAULT_BASE_COLOR,
		description: 'Base color',
	},
	stripeColor: {
		type: 'color',
		default: DEFAULT_STRIPE_COLOR,
		description: 'Stripe color',
	},
} as const satisfies InteractivitySchema;

export type FlannelParams = {
	/** Strength of the flannel treatment from `0` to `1`. Defaults to `0.7`. */
	readonly amount?: number;
	/** Width of one plaid repeat in pixels. Defaults to `96`. */
	readonly size?: number;
	/** Edge softness of the woven stripes from `0` to `1`. Defaults to `0.18`. */
	readonly softness?: number;
	/** Main fabric color. Defaults to `#b51f2e`. */
	readonly baseColor?: string;
	/** Color of the crossing stripes. Defaults to `#16233f`. */
	readonly stripeColor?: string;
};

type FlannelResolved = Required<FlannelParams>;

type FlannelState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uSize: WebGLUniformLocation | null;
	readonly uSoftness: WebGLUniformLocation | null;
	readonly uBaseColor: WebGLUniformLocation | null;
	readonly uStripeColor: WebGLUniformLocation | null;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedBaseColor: string;
	cachedBaseColorRgba: ParsedColorRgba;
	cachedStripeColor: string;
	cachedStripeColorRgba: ParsedColorRgba;
};

const resolve = (params: FlannelParams): FlannelResolved => ({
	amount: params.amount ?? DEFAULT_AMOUNT,
	size: params.size ?? DEFAULT_SIZE,
	softness: params.softness ?? DEFAULT_SOFTNESS,
	baseColor: params.baseColor ?? DEFAULT_BASE_COLOR,
	stripeColor: params.stripeColor ?? DEFAULT_STRIPE_COLOR,
});

const validateFlannelParams = (params: FlannelParams): void => {
	assertEffectParamsObject(params, 'Flannel');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.size, 'size');
	assertOptionalFiniteNumber(params.softness, 'softness');
	assertOptionalColor(params.baseColor, 'baseColor');
	assertOptionalColor(params.stripeColor, 'stripeColor');

	const resolved = resolve(params);
	validateUnitInterval(resolved.amount, 'amount');
	validateUnitInterval(resolved.softness, 'softness');
	if (resolved.size <= 0) {
		throw new TypeError(
			`"size" must be greater than 0, but got ${JSON.stringify(resolved.size)}`,
		);
	}
};

const FLANNEL_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FLANNEL_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uSize;
uniform float uSoftness;
uniform vec4 uBaseColor;
uniform vec4 uStripeColor;

float stripe(float coordinate, float center, float width, float softness) {
	float distanceFromCenter = abs(fract(coordinate) - center);
	float halfWidth = width * 0.5;
	return 1.0 - smoothstep(halfWidth, halfWidth + softness, distanceFromCenter);
}

void main() {
	vec4 source = texture(uSource, vUv);
	if (source.a <= 0.001 || uAmount <= 0.0) {
		fragColor = source;
		return;
	}

	vec2 pixel = vUv * uResolution;
	vec2 plaid = pixel / max(uSize, 0.001);
	float edge = mix(0.002, 0.08, uSoftness);

	float verticalWide = stripe(plaid.x, 0.5, 0.34, edge);
	float horizontalWide = stripe(plaid.y, 0.5, 0.34, edge);
	float verticalFine = stripe(plaid.x * 2.0, 0.5, 0.07, edge * 0.5);
	float horizontalFine = stripe(plaid.y * 2.0, 0.5, 0.07, edge * 0.5);
	float bands = max(max(verticalWide, horizontalWide), max(verticalFine, horizontalFine) * 0.72);
	float crossing = max(verticalWide * horizontalWide, verticalFine * horizontalFine);

	float threadX = 0.5 + 0.5 * sin(pixel.x * 3.14159265);
	float threadY = 0.5 + 0.5 * sin(pixel.y * 3.14159265);
	float weave = (threadX - 0.5) * (threadY - 0.5) * 0.12;

	vec3 sourceRgb = source.rgb / source.a;
	float luminance = dot(sourceRgb, vec3(0.2126, 0.7152, 0.0722));
	vec3 plaidColor = mix(uBaseColor.rgb, uStripeColor.rgb, bands * uStripeColor.a);
	plaidColor = mix(plaidColor, uStripeColor.rgb * 0.72, crossing * uStripeColor.a);
	plaidColor *= mix(0.58, 1.18, luminance) + weave;
	vec3 result = mix(sourceRgb, clamp(plaidColor, 0.0, 1.0), uAmount);

	fragColor = vec4(result * source.a, source.a);
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
		throw new Error(`Flannel shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const setupFlannel = (target: HTMLCanvasElement): FlannelState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('flannel effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, FLANNEL_VS);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FLANNEL_FS);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Flannel program link failed: ${log ?? '(no log)'}`);
	}

	const vao = gl.createVertexArray();
	const vbo = gl.createBuffer();
	if (!vao || !vbo) {
		throw new Error('Failed to create WebGL geometry');
	}

	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);
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
		uAmount: gl.getUniformLocation(program, 'uAmount'),
		uSize: gl.getUniformLocation(program, 'uSize'),
		uSoftness: gl.getUniformLocation(program, 'uSoftness'),
		uBaseColor: gl.getUniformLocation(program, 'uBaseColor'),
		uStripeColor: gl.getUniformLocation(program, 'uStripeColor'),
		colorCtx,
		cachedBaseColor: '',
		cachedBaseColorRgba: [0, 0, 0, 255],
		cachedStripeColor: '',
		cachedStripeColorRgba: [0, 0, 0, 255],
	};
};

const normalizedRgba = (
	color: ParsedColorRgba,
): readonly [number, number, number, number] => [
	color[0] / 255,
	color[1] / 255,
	color[2] / 255,
	color[3] / 255,
];

export const flannel = createEffect<FlannelParams, FlannelState>({
	type: 'dev.remotion.effects.flannel',
	label: 'flannel()',
	documentationLink: 'https://www.remotion.dev/docs/effects/flannel',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `flannel-${resolved.amount}-${resolved.size}-${resolved.softness}-${resolved.baseColor}-${resolved.stripeColor}`;
	},
	setup: setupFlannel,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);
		if (state.cachedBaseColor !== resolved.baseColor) {
			state.cachedBaseColor = resolved.baseColor;
			state.cachedBaseColorRgba = parseColorRgba(
				state.colorCtx,
				resolved.baseColor,
			);
		}

		if (state.cachedStripeColor !== resolved.stripeColor) {
			state.cachedStripeColor = resolved.stripeColor;
			state.cachedStripeColorRgba = parseColorRgba(
				state.colorCtx,
				resolved.stripeColor,
			);
		}

		const base = normalizedRgba(state.cachedBaseColorRgba);
		const stripe = normalizedRgba(state.cachedStripeColorRgba);
		const {gl} = state;
		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(state.program);
		gl.bindVertexArray(state.vao);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, state.texture);
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
		if (state.uAmount) gl.uniform1f(state.uAmount, resolved.amount);
		if (state.uSize) gl.uniform1f(state.uSize, resolved.size);
		if (state.uSoftness) gl.uniform1f(state.uSoftness, resolved.softness);
		if (state.uBaseColor) gl.uniform4f(state.uBaseColor, ...base);
		if (state.uStripeColor) gl.uniform4f(state.uStripeColor, ...stripe);
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
	schema: flannelSchema,
	validateParams: validateFlannelParams,
});
