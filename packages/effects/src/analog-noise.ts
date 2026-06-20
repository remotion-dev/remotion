import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateSignedUnitInterval,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_PHASE = 0 as const;
const DEFAULT_AMOUNT = 0.35 as const;
const DEFAULT_DENSITY = 0.5 as const;
const DEFAULT_BRIGHTNESS = 0 as const;
const DEFAULT_SEED = 0 as const;

const analogNoiseSchema = {
	phase: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PHASE,
		description: 'Phase',
		hiddenFromList: false,
	},
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	density: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_DENSITY,
		description: 'Density',
		hiddenFromList: false,
	},
	brightness: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: DEFAULT_BRIGHTNESS,
		description: 'Brightness',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		step: 1,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
} as const satisfies SequenceSchema;

export type AnalogNoiseParams = {
	/** Animation phase. Values outside `0` to `1` wrap around. Defaults to `0`. */
	readonly phase?: number;
	/** Strength of the analog noise from `0` to `1`. Defaults to `0.35`. */
	readonly amount?: number;
	/** Density of the interference marks from `0` to `1`. Defaults to `0.5`. */
	readonly density?: number;
	/** Bias from dark marks at `-1` to bright marks at `1`. Defaults to `0`. */
	readonly brightness?: number;
	/** Seed for the random interference pattern. Defaults to `0`. */
	readonly seed?: number;
};

type AnalogNoiseResolved = {
	phase: number;
	amount: number;
	density: number;
	brightness: number;
	seed: number;
};

type AnalogNoiseState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uDensity: WebGLUniformLocation | null;
	readonly uBrightness: WebGLUniformLocation | null;
	readonly uPhase: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
};

const resolve = (p: AnalogNoiseParams): AnalogNoiseResolved => ({
	phase: p.phase ?? DEFAULT_PHASE,
	amount: p.amount ?? DEFAULT_AMOUNT,
	density: p.density ?? DEFAULT_DENSITY,
	brightness: p.brightness ?? DEFAULT_BRIGHTNESS,
	seed: p.seed ?? DEFAULT_SEED,
});

const validateAnalogNoiseParams = (params: AnalogNoiseParams): void => {
	assertEffectParamsObject(params, 'Analog noise');
	assertOptionalFiniteNumber(params.phase, 'phase');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.density, 'density');
	assertOptionalFiniteNumber(params.brightness, 'brightness');
	assertOptionalFiniteNumber(params.seed, 'seed');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validateUnitInterval(r.density, 'density');
	validateSignedUnitInterval(r.brightness, 'brightness');
};

const ANALOG_NOISE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const ANALOG_NOISE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uAmount;
uniform float uDensity;
uniform float uBrightness;
uniform float uPhase;
uniform float uSeed;

float random(vec2 co) {
	vec3 p3 = fract(vec3(co.xyx) * 0.1031 + uSeed * 0.0973);
	p3 += dot(p3, p3.yzx + 33.33);
	return fract((p3.x + p3.y) * p3.z);
}

float applyBrightnessBias(float signal, float brightness) {
	if (brightness >= 0.0) {
		return mix(signal, abs(signal), brightness);
	}

	return mix(signal, -abs(signal), -brightness);
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	if (uAmount <= 0.0 || uDensity <= 0.0) {
		fragColor = texColor;
		return;
	}

	float phase = fract(uPhase);
	float rowHeight = mix(48.0, 6.0, uDensity);
	float row = floor((gl_FragCoord.y + phase * 180.0) / rowHeight);
	float rowRand = random(vec2(row, floor(phase * 97.0)));
	float activeRow = step(1.0 - mix(0.08, 0.55, uDensity), rowRand);

	float localY = fract((gl_FragCoord.y + phase * 180.0) / rowHeight);
	float stripe = smoothstep(0.0, 0.18, localY) * (1.0 - smoothstep(0.72, 1.0, localY));

	float segmentWidth = mix(180.0, 18.0, uDensity);
	float segment = floor((gl_FragCoord.x + phase * 260.0) / segmentWidth);
	float segmentNoise = random(vec2(segment, row + 17.0));
	float dash = smoothstep(0.2, 1.0, segmentNoise);

	float fine = random(vec2(floor(gl_FragCoord.x / 6.0), row + phase * 23.0));
	float signal = applyBrightnessBias((fine - 0.5) * 2.0, uBrightness);
	float mask = activeRow * stripe * mix(0.25, 1.0, dash);

	vec3 rgb = texColor.rgb / alpha;
	rgb = clamp(rgb + vec3(signal * mask * uAmount), 0.0, 1.0);
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
		throw new Error(`Analog noise shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Analog noise program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupAnalogNoise = (target: HTMLCanvasElement): AnalogNoiseState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('analog noise effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, ANALOG_NOISE_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, ANALOG_NOISE_FS);
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
		uDensity: gl.getUniformLocation(program, 'uDensity'),
		uBrightness: gl.getUniformLocation(program, 'uBrightness'),
		uPhase: gl.getUniformLocation(program, 'uPhase'),
		uSeed: gl.getUniformLocation(program, 'uSeed'),
	};
};

export const analogNoise = createEffect<AnalogNoiseParams, AnalogNoiseState>({
	type: 'remotion/analog-noise',
	label: 'analogNoise()',
	documentationLink: 'https://www.remotion.dev/docs/effects/analog-noise',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `analog-noise-${r.phase}-${r.amount}-${r.density}-${r.brightness}-${r.seed}`;
	},
	setup: (target) => setupAnalogNoise(target),
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
		if (state.uDensity) gl.uniform1f(state.uDensity, r.density);
		if (state.uBrightness) gl.uniform1f(state.uBrightness, r.brightness);
		if (state.uPhase) gl.uniform1f(state.uPhase, r.phase);
		if (state.uSeed) gl.uniform1f(state.uSeed, r.seed);

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
	schema: analogNoiseSchema,
	validateParams: validateAnalogNoiseParams,
});
