import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_TIME = 0 as const;
const DEFAULT_SPEED = 1 as const;
const DEFAULT_ZOOM = 6 as const;
const DEFAULT_ITERATIONS = 12 as const;
const DEFAULT_SAMPLE_GAP = 0.095 as const;
const DEFAULT_TANGENT_FORCE = 0.75 as const;
const DEFAULT_GRADIENT_FORCE = 0.15 as const;
const DEFAULT_COLOR_PHASE = 3.11 as const;
const DEFAULT_COLOR_RANGE = 0.75 as const;
const DEFAULT_COLOR_BIAS = 0.5 as const;
const DEFAULT_COLOR_A = '#ff0038' as const;
const DEFAULT_COLOR_B = '#0047ff' as const;
const DEFAULT_BRIGHTNESS = 1 as const;
const DEFAULT_BACKGROUND_COLOR = '#000000' as const;
const DEFAULT_OPACITY = 1 as const;
const DEFAULT_MODE = 'blend' as const;

const MODES = ['blend', 'alpha-mask'] as const;

const metallicSwirlSchema = {
	time: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_TIME,
		description: 'Time',
		hiddenFromList: false,
	},
	speed: {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.01,
		default: DEFAULT_SPEED,
		description: 'Speed',
		hiddenFromList: false,
	},
	zoom: {
		type: 'number',
		min: 0.01,
		max: 50,
		step: 0.01,
		default: DEFAULT_ZOOM,
		description: 'Zoom',
		hiddenFromList: false,
	},
	iterations: {
		type: 'number',
		min: 1,
		max: 12,
		step: 1,
		default: DEFAULT_ITERATIONS,
		description: 'Iterations',
		hiddenFromList: false,
	},
	sampleGap: {
		type: 'number',
		min: 0.0001,
		max: 1,
		step: 0.001,
		default: DEFAULT_SAMPLE_GAP,
		description: 'Sample gap',
		hiddenFromList: false,
	},
	tangentForce: {
		type: 'number',
		min: -5,
		max: 5,
		step: 0.01,
		default: DEFAULT_TANGENT_FORCE,
		description: 'Tangent force',
		hiddenFromList: false,
	},
	gradientForce: {
		type: 'number',
		min: -5,
		max: 5,
		step: 0.01,
		default: DEFAULT_GRADIENT_FORCE,
		description: 'Gradient force',
		hiddenFromList: false,
	},
	colorPhaseR: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_COLOR_PHASE,
		description: 'Color phase R',
		hiddenFromList: false,
	},
	colorPhaseG: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_COLOR_PHASE,
		description: 'Color phase G',
		hiddenFromList: false,
	},
	colorPhaseB: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_COLOR_PHASE,
		description: 'Color phase B',
		hiddenFromList: false,
	},
	colorRange: {
		type: 'number',
		min: 0,
		max: 2,
		step: 0.01,
		default: DEFAULT_COLOR_RANGE,
		description: 'Color range',
		hiddenFromList: false,
	},
	colorBias: {
		type: 'number',
		min: 0,
		max: 2,
		step: 0.01,
		default: DEFAULT_COLOR_BIAS,
		description: 'Color bias',
		hiddenFromList: false,
	},
	colorA: {
		type: 'color',
		default: DEFAULT_COLOR_A,
		description: 'Color A',
	},
	colorB: {
		type: 'color',
		default: DEFAULT_COLOR_B,
		description: 'Color B',
	},
	brightness: {
		type: 'number',
		min: 0,
		max: 5,
		step: 0.01,
		default: DEFAULT_BRIGHTNESS,
		description: 'Brightness',
		hiddenFromList: false,
	},
	backgroundColor: {
		type: 'color',
		default: DEFAULT_BACKGROUND_COLOR,
		description: 'Background color',
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
	mode: {
		type: 'enum',
		variants: {
			blend: {},
			'alpha-mask': {},
		},
		default: DEFAULT_MODE,
		description: 'Mode',
	},
} as const satisfies InteractivitySchema;

type MetallicSwirlMode = (typeof MODES)[number];

export type MetallicSwirlParams = {
	readonly time?: number;
	readonly speed?: number;
	readonly zoom?: number;
	readonly iterations?: number;
	readonly sampleGap?: number;
	readonly tangentForce?: number;
	readonly gradientForce?: number;
	readonly colorPhaseR?: number;
	readonly colorPhaseG?: number;
	readonly colorPhaseB?: number;
	readonly colorRange?: number;
	readonly colorBias?: number;
	readonly colorA?: string;
	readonly colorB?: string;
	readonly brightness?: number;
	readonly backgroundColor?: string;
	readonly opacity?: number;
	readonly mode?: MetallicSwirlMode;
};

type MetallicSwirlResolved = {
	time: number;
	speed: number;
	zoom: number;
	iterations: number;
	sampleGap: number;
	tangentForce: number;
	gradientForce: number;
	colorPhaseR: number;
	colorPhaseG: number;
	colorPhaseB: number;
	colorRange: number;
	colorBias: number;
	colorA: string;
	colorB: string;
	brightness: number;
	backgroundColor: string;
	opacity: number;
	mode: MetallicSwirlMode;
};

type Rgb = readonly [number, number, number];

type MetallicSwirlState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uTime: WebGLUniformLocation | null;
	uSpeed: WebGLUniformLocation | null;
	uZoom: WebGLUniformLocation | null;
	uIterations: WebGLUniformLocation | null;
	uSampleGap: WebGLUniformLocation | null;
	uTangentForce: WebGLUniformLocation | null;
	uGradientForce: WebGLUniformLocation | null;
	uColorPhase: WebGLUniformLocation | null;
	uColorRange: WebGLUniformLocation | null;
	uColorBias: WebGLUniformLocation | null;
	uColorA: WebGLUniformLocation | null;
	uColorB: WebGLUniformLocation | null;
	uBrightness: WebGLUniformLocation | null;
	uBackgroundColor: WebGLUniformLocation | null;
	uOpacity: WebGLUniformLocation | null;
	uMode: WebGLUniformLocation | null;
};

const resolve = (params: MetallicSwirlParams): MetallicSwirlResolved => ({
	time: params.time ?? DEFAULT_TIME,
	speed: params.speed ?? DEFAULT_SPEED,
	zoom: params.zoom ?? DEFAULT_ZOOM,
	iterations: params.iterations ?? DEFAULT_ITERATIONS,
	sampleGap: params.sampleGap ?? DEFAULT_SAMPLE_GAP,
	tangentForce: params.tangentForce ?? DEFAULT_TANGENT_FORCE,
	gradientForce: params.gradientForce ?? DEFAULT_GRADIENT_FORCE,
	colorPhaseR: params.colorPhaseR ?? DEFAULT_COLOR_PHASE,
	colorPhaseG: params.colorPhaseG ?? DEFAULT_COLOR_PHASE,
	colorPhaseB: params.colorPhaseB ?? DEFAULT_COLOR_PHASE,
	colorRange: params.colorRange ?? DEFAULT_COLOR_RANGE,
	colorBias: params.colorBias ?? DEFAULT_COLOR_BIAS,
	colorA: params.colorA ?? DEFAULT_COLOR_A,
	colorB: params.colorB ?? DEFAULT_COLOR_B,
	brightness: params.brightness ?? DEFAULT_BRIGHTNESS,
	backgroundColor: params.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
	opacity: params.opacity ?? DEFAULT_OPACITY,
	mode: params.mode ?? DEFAULT_MODE,
});

const assertParamsObject = (
	params: MetallicSwirlParams,
	name: string,
): void => {
	if (params === null || typeof params !== 'object' || Array.isArray(params)) {
		throw new TypeError(`${name} params must be an object`);
	}
};

const assertOptionalFiniteNumber = (
	value: unknown,
	name: keyof MetallicSwirlParams,
): void => {
	if (value === undefined) {
		return;
	}

	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new TypeError(`"${name}" must be a finite number`);
	}
};

const validateRange = (
	value: number,
	name: keyof MetallicSwirlParams,
	min: number,
	max: number,
): void => {
	if (value < min || value > max) {
		throw new TypeError(`"${name}" must be between ${min} and ${max}`);
	}
};

const assertOptionalEnum = <T extends string>(
	value: unknown,
	name: keyof MetallicSwirlParams,
	variants: readonly T[],
): void => {
	if (value === undefined) {
		return;
	}

	if (typeof value !== 'string' || !variants.includes(value as T)) {
		throw new TypeError(`"${name}" must be one of ${variants.join(', ')}`);
	}
};

const parseHexColor = (hex: string, name: keyof MetallicSwirlParams): Rgb => {
	const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!match) {
		throw new TypeError(`"${name}" must be a hex color such as "#000000"`);
	}

	return [
		parseInt(match[1], 16) / 255,
		parseInt(match[2], 16) / 255,
		parseInt(match[3], 16) / 255,
	];
};

const validateMetallicSwirlParams = (
	params: MetallicSwirlParams = {},
): void => {
	assertParamsObject(params, 'Metallic swirl');
	assertOptionalFiniteNumber(params.time, 'time');
	assertOptionalFiniteNumber(params.speed, 'speed');
	assertOptionalFiniteNumber(params.zoom, 'zoom');
	assertOptionalFiniteNumber(params.iterations, 'iterations');
	assertOptionalFiniteNumber(params.sampleGap, 'sampleGap');
	assertOptionalFiniteNumber(params.tangentForce, 'tangentForce');
	assertOptionalFiniteNumber(params.gradientForce, 'gradientForce');
	assertOptionalFiniteNumber(params.colorPhaseR, 'colorPhaseR');
	assertOptionalFiniteNumber(params.colorPhaseG, 'colorPhaseG');
	assertOptionalFiniteNumber(params.colorPhaseB, 'colorPhaseB');
	assertOptionalFiniteNumber(params.colorRange, 'colorRange');
	assertOptionalFiniteNumber(params.colorBias, 'colorBias');
	assertOptionalFiniteNumber(params.brightness, 'brightness');
	assertOptionalFiniteNumber(params.opacity, 'opacity');
	assertOptionalEnum(params.mode, 'mode', MODES);

	if (
		params.backgroundColor !== undefined &&
		typeof params.backgroundColor !== 'string'
	) {
		throw new TypeError('"backgroundColor" must be a string');
	}

	if (params.colorA !== undefined && typeof params.colorA !== 'string') {
		throw new TypeError('"colorA" must be a string');
	}

	if (params.colorB !== undefined && typeof params.colorB !== 'string') {
		throw new TypeError('"colorB" must be a string');
	}

	const resolved = resolve(params);
	validateRange(resolved.speed, 'speed', 0, 10);
	validateRange(resolved.zoom, 'zoom', 0.01, 50);
	validateRange(resolved.iterations, 'iterations', 1, 12);
	validateRange(resolved.sampleGap, 'sampleGap', 0.0001, 1);
	validateRange(resolved.colorRange, 'colorRange', 0, 2);
	validateRange(resolved.colorBias, 'colorBias', 0, 2);
	validateRange(resolved.brightness, 'brightness', 0, 5);
	validateRange(resolved.opacity, 'opacity', 0, 1);
	parseHexColor(resolved.backgroundColor, 'backgroundColor');
	parseHexColor(resolved.colorA, 'colorA');
	parseHexColor(resolved.colorB, 'colorB');
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uZoom;
uniform int uIterations;
uniform float uSampleGap;
uniform float uTangentForce;
uniform float uGradientForce;
uniform vec3 uColorPhase;
uniform float uColorRange;
uniform float uColorBias;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBrightness;
uniform vec3 uBackgroundColor;
uniform float uOpacity;
uniform int uMode;

float wave(vec2 p, float t) {
	return sin(p.x + sin(p.y + t * 0.1)) * sin(p.y * p.x * 0.1 + t * 0.2);
}

void main() {
	vec4 source = texture(uSource, vUv);
	vec3 sourceRgb = source.a > 0.001 ? source.rgb / source.a : vec3(0.0);

	vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
	vec2 p = (vUv - 0.5) * aspect * uZoom;
	float t = uTime * uSpeed;
	vec2 ep = vec2(uSampleGap, 0.0);
	vec2 flow = vec2(0.0);

	for (int i = 0; i < 12; i++) {
		if (i >= uIterations) {
			break;
		}

		float s0 = wave(p, t);
		float sx = wave(p + ep, t);
		float sy = wave(p + ep.yx, t);
		vec2 gradient = vec2(sx - s0, sy - s0) / ep.xx;
		vec2 tangent = vec2(-gradient.y, gradient.x);
		p += uTangentForce * tangent + gradient * uGradientForce;
		flow = tangent;
	}

	float value = flow.x - flow.y;
	float paletteMix = sin(value + uColorPhase.r) * 0.5 + 0.5;
	vec3 color = mix(uColorA, uColorB, paletteMix);
	color *= sin(uColorPhase + value) * uColorRange + uColorBias;
	color *= uBrightness;

	float luminance = dot(color, vec3(0.299, 0.587, 0.114));
	vec3 generated = mix(
		uBackgroundColor,
		color,
		clamp(luminance * 6.0, 0.0, 1.0)
	);
	vec3 result = uMode == 1 ? generated : mix(sourceRgb, generated, uOpacity);
	float alpha = uMode == 1 ? source.a * uOpacity : source.a;

	fragColor = vec4(result * alpha, alpha);
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
			`Metallic swirl shader compile failed: ${log ?? '(no log)'}`,
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
		throw new Error(`Metallic swirl program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const metallicSwirl = createEffect<
	MetallicSwirlParams,
	MetallicSwirlState
>({
	type: 'dev.remotion.brand.metallic-swirl',
	label: 'metallicSwirl()',
	documentationLink: null,
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return [
			'metallic-swirl',
			r.time,
			r.speed,
			r.zoom,
			r.iterations,
			r.sampleGap,
			r.tangentForce,
			r.gradientForce,
			r.colorPhaseR,
			r.colorPhaseG,
			r.colorPhaseB,
			r.colorRange,
			r.colorBias,
			r.colorA,
			r.colorB,
			r.brightness,
			r.backgroundColor,
			r.opacity,
			r.mode,
		].join('-');
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('metallic swirl effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
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

		return {
			gl,
			program,
			vao,
			vbo,
			texture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uTime: gl.getUniformLocation(program, 'uTime'),
			uSpeed: gl.getUniformLocation(program, 'uSpeed'),
			uZoom: gl.getUniformLocation(program, 'uZoom'),
			uIterations: gl.getUniformLocation(program, 'uIterations'),
			uSampleGap: gl.getUniformLocation(program, 'uSampleGap'),
			uTangentForce: gl.getUniformLocation(program, 'uTangentForce'),
			uGradientForce: gl.getUniformLocation(program, 'uGradientForce'),
			uColorPhase: gl.getUniformLocation(program, 'uColorPhase'),
			uColorRange: gl.getUniformLocation(program, 'uColorRange'),
			uColorBias: gl.getUniformLocation(program, 'uColorBias'),
			uColorA: gl.getUniformLocation(program, 'uColorA'),
			uColorB: gl.getUniformLocation(program, 'uColorB'),
			uBrightness: gl.getUniformLocation(program, 'uBrightness'),
			uBackgroundColor: gl.getUniformLocation(program, 'uBackgroundColor'),
			uOpacity: gl.getUniformLocation(program, 'uOpacity'),
			uMode: gl.getUniformLocation(program, 'uMode'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const [bgR, bgG, bgB] = parseHexColor(r.backgroundColor, 'backgroundColor');
		const [colorAR, colorAG, colorAB] = parseHexColor(r.colorA, 'colorA');
		const [colorBR, colorBG, colorBB] = parseHexColor(r.colorB, 'colorB');
		const {gl, program, vao, texture} = state;

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
		if (state.uTime) gl.uniform1f(state.uTime, r.time);
		if (state.uSpeed) gl.uniform1f(state.uSpeed, r.speed);
		if (state.uZoom) gl.uniform1f(state.uZoom, r.zoom);
		if (state.uIterations)
			gl.uniform1i(state.uIterations, Math.round(r.iterations));
		if (state.uSampleGap) gl.uniform1f(state.uSampleGap, r.sampleGap);
		if (state.uTangentForce) gl.uniform1f(state.uTangentForce, r.tangentForce);
		if (state.uGradientForce)
			gl.uniform1f(state.uGradientForce, r.gradientForce);
		if (state.uColorPhase) {
			gl.uniform3f(
				state.uColorPhase,
				r.colorPhaseR,
				r.colorPhaseG,
				r.colorPhaseB,
			);
		}

		if (state.uColorRange) gl.uniform1f(state.uColorRange, r.colorRange);
		if (state.uColorBias) gl.uniform1f(state.uColorBias, r.colorBias);
		if (state.uColorA) gl.uniform3f(state.uColorA, colorAR, colorAG, colorAB);
		if (state.uColorB) gl.uniform3f(state.uColorB, colorBR, colorBG, colorBB);
		if (state.uBrightness) gl.uniform1f(state.uBrightness, r.brightness);
		if (state.uBackgroundColor)
			gl.uniform3f(state.uBackgroundColor, bgR, bgG, bgB);
		if (state.uOpacity) gl.uniform1f(state.uOpacity, r.opacity);
		if (state.uMode) gl.uniform1i(state.uMode, r.mode === 'alpha-mask' ? 1 : 0);

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
	schema: metallicSwirlSchema,
	validateParams: validateMetallicSwirlParams,
});
