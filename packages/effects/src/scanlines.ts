import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 0.15 as const;
const DEFAULT_SPACING = 4 as const;
const DEFAULT_THICKNESS = 1 as const;
const DEFAULT_OFFSET = 0 as const;
const DEFAULT_PREMULTIPLY = false as const;

const scanlinesSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	spacing: {
		type: 'number',
		min: 0.1,
		max: 100,
		step: 0.1,
		default: DEFAULT_SPACING,
		description: 'Spacing',
		hiddenFromList: false,
	},
	thickness: {
		type: 'number',
		min: 0,
		max: 100,
		step: 0.1,
		default: DEFAULT_THICKNESS,
		description: 'Thickness',
		hiddenFromList: false,
	},
	offset: {
		type: 'number',
		step: 0.1,
		default: DEFAULT_OFFSET,
		description: 'Offset',
		hiddenFromList: false,
	},
	premultiply: {
		type: 'boolean',
		default: DEFAULT_PREMULTIPLY,
		description: 'Premultiply',
	},
} as const satisfies InteractivitySchema;

export type ScanlinesParams = {
	/** Strength of the scanline modulation from `0` to `1`. Defaults to `0.15`. */
	readonly amount?: number;
	/** Distance between scanlines in pixels. Defaults to `4`. */
	readonly spacing?: number;
	/** Thickness of each scanline in pixels. Defaults to `1`. */
	readonly thickness?: number;
	/** Vertical offset in pixels. Animate this value to scroll the scanlines. Defaults to `0`. */
	readonly offset?: number;
	/** Multiply the scanline contribution with the input colors before blending. Defaults to `false`. */
	readonly premultiply?: boolean;
};

type ScanlinesResolved = {
	amount: number;
	spacing: number;
	thickness: number;
	offset: number;
	premultiply: boolean;
};

type ScanlinesState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uSpacing: WebGLUniformLocation | null;
	readonly uThickness: WebGLUniformLocation | null;
	readonly uOffset: WebGLUniformLocation | null;
	readonly uPremultiply: WebGLUniformLocation | null;
};

const resolve = (p: ScanlinesParams): ScanlinesResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	spacing: p.spacing ?? DEFAULT_SPACING,
	thickness: p.thickness ?? DEFAULT_THICKNESS,
	offset: p.offset ?? DEFAULT_OFFSET,
	premultiply: p.premultiply ?? DEFAULT_PREMULTIPLY,
});

const assertOptionalBoolean = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (typeof value !== 'boolean') {
		throw new TypeError(
			`"${name}" must be a boolean, but got ${JSON.stringify(value)}`,
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

const validateScanlinesParams = (params: ScanlinesParams): void => {
	assertEffectParamsObject(params, 'Scanlines');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.spacing, 'spacing');
	assertOptionalFiniteNumber(params.thickness, 'thickness');
	assertOptionalFiniteNumber(params.offset, 'offset');
	assertOptionalBoolean(params.premultiply, 'premultiply');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validatePositive(r.spacing, 'spacing');
	validateNonNegative(r.thickness, 'thickness');
};

const SCANLINES_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SCANLINES_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAmount;
uniform float uSpacing;
uniform float uThickness;
uniform float uOffset;
uniform bool uPremultiply;

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	if (uAmount <= 0.0 || uThickness <= 0.0) {
		fragColor = texColor;
		return;
	}

	float spacing = max(uSpacing, 0.001);
	float thickness = min(uThickness, spacing);
	float halfThickness = thickness * 0.5;
	float position = mod(gl_FragCoord.y + uOffset, spacing);
	float distanceToLine = min(position, spacing - position);
	float line = 1.0 - smoothstep(halfThickness, halfThickness + 1.0, distanceToLine);
	float dutyCycle = thickness / spacing;
	float signal = line - dutyCycle;

	vec3 rgb = texColor.rgb / alpha;
	vec3 scanlineLayer = uPremultiply ? rgb * signal : vec3(signal);
	rgb = clamp(rgb + scanlineLayer * uAmount, 0.0, 1.0);
	fragColor = vec4(rgb * alpha, alpha);
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
		throw new Error(`Scanlines shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Scanlines program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupScanlines = (target: HTMLCanvasElement): ScanlinesState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('scanlines effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, SCANLINES_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, SCANLINES_FS);
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
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return {
		gl,
		program,
		vao,
		vbo,
		texture,
		uSource: gl.getUniformLocation(program, 'uSource'),
		uAmount: gl.getUniformLocation(program, 'uAmount'),
		uSpacing: gl.getUniformLocation(program, 'uSpacing'),
		uThickness: gl.getUniformLocation(program, 'uThickness'),
		uOffset: gl.getUniformLocation(program, 'uOffset'),
		uPremultiply: gl.getUniformLocation(program, 'uPremultiply'),
	};
};

export const scanlines = createEffect<ScanlinesParams, ScanlinesState>({
	type: 'dev.remotion.effects.scanlines',
	label: 'scanlines()',
	documentationLink: 'https://www.remotion.dev/docs/effects/scanlines',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `scanlines-${r.amount}-${r.spacing}-${r.thickness}-${r.offset}-${r.premultiply ? 1 : 0}`;
	},
	setup: (target) => setupScanlines(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, texture, vao} = state;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

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

		gl.useProgram(program);
		if (state.uSource) gl.uniform1i(state.uSource, 0);
		if (state.uAmount) gl.uniform1f(state.uAmount, r.amount);
		if (state.uSpacing) gl.uniform1f(state.uSpacing, r.spacing);
		if (state.uThickness) gl.uniform1f(state.uThickness, r.thickness);
		if (state.uOffset) gl.uniform1f(state.uOffset, r.offset);
		if (state.uPremultiply)
			gl.uniform1i(state.uPremultiply, r.premultiply ? 1 : 0);

		gl.bindVertexArray(vao);
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
	schema: scanlinesSchema,
	validateParams: validateScanlinesParams,
});
