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

const DEFAULT_AMOUNT = 0.55 as const;
const DEFAULT_SIZE = 5 as const;
const DEFAULT_ROUGHNESS = 0.7 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_COLOR = '#000000' as const;

const burlapSchema = {
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
		min: 0.1,
		max: 80,
		step: 0.1,
		default: DEFAULT_SIZE,
		description: 'Size',
		hiddenFromList: false,
	},
	roughness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_ROUGHNESS,
		description: 'Roughness',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		step: 1,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
} as const satisfies InteractivitySchema;

export type BurlapParams = {
	/** Strength of the woven texture from `0` to `1`. Defaults to `0.55`. */
	readonly amount?: number;
	/** Distance between weave strands in pixels. Defaults to `5`. */
	readonly size?: number;
	/** Irregularity of the fibers from `0` to `1`. Defaults to `0.7`. */
	readonly roughness?: number;
	/** Seed for the procedural fiber pattern. Defaults to `0`. */
	readonly seed?: number;
	/** Color of the darker weave fibers. Defaults to black. */
	readonly color?: string;
};

type BurlapResolved = {
	amount: number;
	size: number;
	roughness: number;
	seed: number;
	color: string;
};

type BurlapState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uSize: WebGLUniformLocation | null;
	readonly uRoughness: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
	readonly uColor: WebGLUniformLocation | null;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedColorRgba: ParsedColorRgba;
};

const resolve = (p: BurlapParams): BurlapResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	size: p.size ?? DEFAULT_SIZE,
	roughness: p.roughness ?? DEFAULT_ROUGHNESS,
	seed: p.seed ?? DEFAULT_SEED,
	color: p.color ?? DEFAULT_COLOR,
});

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateBurlapParams = (params: BurlapParams): void => {
	assertEffectParamsObject(params, 'Burlap');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.size, 'size');
	assertOptionalFiniteNumber(params.roughness, 'roughness');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalColor(params.color, 'color');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validatePositive(r.size, 'size');
	validateUnitInterval(r.roughness, 'roughness');
};

const BURLAP_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const BURLAP_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uSize;
uniform float uRoughness;
uniform float uSeed;
uniform vec4 uColor;

float hash21(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1871));
	p3 += dot(p3, p3.yzx + 19.19 + uSeed * 0.137);
	return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);

	float a = hash21(i);
	float b = hash21(i + vec2(1.0, 0.0));
	float c = hash21(i + vec2(0.0, 1.0));
	float d = hash21(i + vec2(1.0, 1.0));

	return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float strand(float value) {
	float centered = abs(fract(value) - 0.5);
	return 1.0 - smoothstep(0.2, 0.5, centered);
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	if (uAmount <= 0.0) {
		fragColor = texColor;
		return;
	}

	vec2 fragPos = vUv * uResolution;
	float strandSize = max(uSize, 0.001);
	vec2 weave = fragPos / strandSize;

	float rowJitter = (hash21(vec2(floor(weave.y), 13.17)) - 0.5) * uRoughness * 0.28;
	float columnJitter = (hash21(vec2(71.43, floor(weave.x))) - 0.5) * uRoughness * 0.28;
	float vertical = strand(weave.x + rowJitter);
	float horizontal = strand(weave.y + columnJitter);

	float cellParity = mod(floor(weave.x) + floor(weave.y), 2.0);
	float overUnder = mix(vertical, horizontal, cellParity);
	float ridge = max(max(vertical, horizontal) * 0.45, overUnder * 0.75);
	float gaps = (1.0 - vertical) * (1.0 - horizontal);

	float coarse = valueNoise(fragPos / (strandSize * 7.0) + vec2(uSeed * 1.7, uSeed * 0.6));
	float fine = valueNoise(fragPos / max(strandSize * 0.55, 0.5) + vec2(uSeed * 3.1, 4.7));
	float dashH = smoothstep(0.64, 0.98, hash21(floor(vec2(weave.x * 2.0, weave.y)) + 23.9)) * horizontal;
	float dashV = smoothstep(0.64, 0.98, hash21(floor(vec2(weave.x, weave.y * 2.0)) + 91.4)) * vertical;

	float texture = 0.0;
	texture += (ridge - 0.42) * 0.22;
	texture -= gaps * 0.18;
	texture += (coarse - 0.5) * 0.18 * uRoughness;
	texture += (fine - 0.5) * 0.16 * uRoughness;
	texture -= (dashH + dashV) * 0.08 * uRoughness;

	vec3 rgb = texColor.rgb / alpha;
	float darkFiber = clamp(-texture * 3.2 + gaps * 0.12 + (dashH + dashV) * 0.18, 0.0, 1.0);
	vec3 shaded = mix(rgb, uColor.rgb, darkFiber * uColor.a);
	vec3 textured = clamp(shaded * (1.0 + max(texture, 0.0) * 0.45), 0.0, 1.0);
	rgb = mix(rgb, textured, uAmount);

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
		throw new Error(`Burlap shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Burlap program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupBurlap = (target: HTMLCanvasElement): BurlapState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('burlap effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, BURLAP_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, BURLAP_FS);
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
		uAmount: gl.getUniformLocation(program, 'uAmount'),
		uSize: gl.getUniformLocation(program, 'uSize'),
		uRoughness: gl.getUniformLocation(program, 'uRoughness'),
		uSeed: gl.getUniformLocation(program, 'uSeed'),
		uColor: gl.getUniformLocation(program, 'uColor'),
		colorCtx,
		cachedColor: '',
		cachedColorRgba: [0, 0, 0, 255],
	};
};

const normalizedRgba = (
	color: ParsedColorRgba,
): readonly [number, number, number, number] => {
	return [color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255];
};

export const burlap = createEffect<BurlapParams, BurlapState>({
	type: 'dev.remotion.effects.burlap',
	label: 'burlap()',
	documentationLink: 'https://www.remotion.dev/docs/effects/burlap',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `burlap-${r.amount}-${r.size}-${r.roughness}-${r.seed}-${r.color}`;
	},
	setup: (target) => setupBurlap(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture} = state;
		if (state.cachedColor !== r.color) {
			state.cachedColor = r.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
		}

		const [red, green, blue, alpha] = normalizedRgba(state.cachedColorRgba);

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
		if (state.uAmount) gl.uniform1f(state.uAmount, r.amount);
		if (state.uSize) gl.uniform1f(state.uSize, r.size);
		if (state.uRoughness) gl.uniform1f(state.uRoughness, r.roughness);
		if (state.uSeed) gl.uniform1f(state.uSeed, r.seed);
		if (state.uColor) gl.uniform4f(state.uColor, red, green, blue, alpha);

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
	schema: burlapSchema,
	validateParams: validateBurlapParams,
});
