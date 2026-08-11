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
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_FIRST_COLOR = '#ff1a0a' as const;
const DEFAULT_SECOND_COLOR = '#050505' as const;
const DEFAULT_SPACING = 62 as const;
const DEFAULT_SCALE = 300 as const;
const DEFAULT_COMPLEXITY = 0 as const;
const DEFAULT_SMOOTHNESS = 1 as const;
const DEFAULT_SEED = 4 as const;
const DEFAULT_OFFSET_X = 13.4 as const;
const DEFAULT_OFFSET_Y = 0 as const;
const DEFAULT_PHASE = 3.23 as const;

export const liquidContoursSchema = {
	firstColor: {
		type: 'color',
		default: DEFAULT_FIRST_COLOR,
		description: 'First color',
	},
	secondColor: {
		type: 'color',
		default: DEFAULT_SECOND_COLOR,
		description: 'Second color',
	},
	spacing: {
		type: 'number',
		min: 2,
		max: 300,
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
		description: 'Edge smoothness',
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
	phase: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_PHASE,
		description: 'Phase',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type LiquidContoursParams = {
	/** First alternating band color. Defaults to `#ff1a0a`. */
	readonly firstColor?: string;
	/** Second alternating band color. Defaults to `#050505`. */
	readonly secondColor?: string;
	/** Width of a pair of bands in pixels. Defaults to `62`. */
	readonly spacing?: number;
	/** Size of the generated shapes in pixels. Defaults to `300`. */
	readonly scale?: number;
	/** Amount of small-scale detail from `0` to `1`. Defaults to `0`. */
	readonly complexity?: number;
	/** Edge softness from `0` to `1`. Defaults to `1`. */
	readonly smoothness?: number;
	/** Deterministic seed. Defaults to `4`. */
	readonly seed?: number;
	/** Horizontal pattern offset in pixels. Defaults to `13.4`. */
	readonly offsetX?: number;
	/** Vertical pattern offset in pixels. Defaults to `0`. */
	readonly offsetY?: number;
	/** Shifts the alternating bands. Defaults to `3.23`. */
	readonly phase?: number;
};

type LiquidContoursResolved = Required<LiquidContoursParams>;

type LiquidContoursState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly colorCtx: CanvasRenderingContext2D;
	readonly uniforms: {
		readonly uResolution: WebGLUniformLocation | null;
		readonly uFirstColor: WebGLUniformLocation | null;
		readonly uSecondColor: WebGLUniformLocation | null;
		readonly uSpacing: WebGLUniformLocation | null;
		readonly uScale: WebGLUniformLocation | null;
		readonly uComplexity: WebGLUniformLocation | null;
		readonly uSmoothness: WebGLUniformLocation | null;
		readonly uSeed: WebGLUniformLocation | null;
		readonly uOffset: WebGLUniformLocation | null;
		readonly uPhase: WebGLUniformLocation | null;
	};
	cachedFirstColor: string;
	cachedFirstColorRgba: ParsedColorRgba;
	cachedSecondColor: string;
	cachedSecondColorRgba: ParsedColorRgba;
};

const resolve = (params: LiquidContoursParams): LiquidContoursResolved => ({
	firstColor: params.firstColor ?? DEFAULT_FIRST_COLOR,
	secondColor: params.secondColor ?? DEFAULT_SECOND_COLOR,
	spacing: params.spacing ?? DEFAULT_SPACING,
	scale: params.scale ?? DEFAULT_SCALE,
	complexity: params.complexity ?? DEFAULT_COMPLEXITY,
	smoothness: params.smoothness ?? DEFAULT_SMOOTHNESS,
	seed: params.seed ?? DEFAULT_SEED,
	offsetX: params.offsetX ?? DEFAULT_OFFSET_X,
	offsetY: params.offsetY ?? DEFAULT_OFFSET_Y,
	phase: params.phase ?? DEFAULT_PHASE,
});

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateLiquidContoursParams = (params: LiquidContoursParams): void => {
	assertEffectParamsObject(params, 'Liquid contours');
	assertOptionalColor(params.firstColor, 'firstColor');
	assertOptionalColor(params.secondColor, 'secondColor');
	assertOptionalFiniteNumber(params.spacing, 'spacing');
	assertOptionalFiniteNumber(params.scale, 'scale');
	assertOptionalFiniteNumber(params.complexity, 'complexity');
	assertOptionalFiniteNumber(params.smoothness, 'smoothness');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalFiniteNumber(params.phase, 'phase');

	const r = resolve(params);
	validatePositive(r.spacing, 'spacing');
	validatePositive(r.scale, 'scale');
	validateUnitInterval(r.complexity, 'complexity');
	validateUnitInterval(r.smoothness, 'smoothness');
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

uniform vec2 uResolution;
uniform vec4 uFirstColor;
uniform vec4 uSecondColor;
uniform float uSpacing;
uniform float uScale;
uniform float uComplexity;
uniform float uSmoothness;
uniform float uSeed;
uniform vec2 uOffset;
uniform float uPhase;

float hash(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 33.33 + uSeed * 0.013);
	return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
	return mix(
		mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
		mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), u.x),
		u.y
	);
}

float fbm(vec2 p) {
	float value = 0.0;
	float amplitude = 0.5;
	float total = 0.0;
	float persistence = mix(0.2, 0.58, uComplexity);
	mat2 rotate = mat2(0.80, 0.60, -0.60, 0.80);

	for (int i = 0; i < 5; i++) {
		float octave = float(i) / 4.0;
		float detail = mix(0.45, 1.0, uComplexity);
		float octaveWeight = mix(1.0, 1.0 - smoothstep(0.4, 1.0, octave), 1.0 - detail);
		value += amplitude * octaveWeight * valueNoise(p);
		total += amplitude * octaveWeight;
		p = rotate * p * 2.03 + vec2(13.17, 7.31);
		amplitude *= persistence;
	}

	return value / total;
}

void main() {
	vec2 position = vUv * uResolution + uOffset;
	vec2 p = position / max(uScale, 0.001) + vec2(uSeed * 0.137, uSeed * 0.193);
	vec2 warp = vec2(fbm(p + vec2(5.2, 1.3)), fbm(p + vec2(1.7, 9.2))) - 0.5;
	mat2 roundRotation = mat2(0.7071, 0.7071, -0.7071, 0.7071);
	float roundedField = mix(
		valueNoise(p * 0.9),
		valueNoise(roundRotation * p * 0.78 + vec2(8.3, 2.7)),
		0.45
	);
	float detailedField = fbm(p + warp * mix(0.35, 1.8, uComplexity));
	float detailMix = smoothstep(0.0, 1.0, uComplexity);
	float field = mix(roundedField, detailedField, detailMix);
	float levels = max(max(uResolution.x, uResolution.y) / max(uSpacing, 0.001), 1.0);
	float wave = sin((field * levels + uPhase) * 6.28318530718);
	float edgeWidth = fwidth(wave) * mix(0.15, 1.4, uSmoothness);
	float selector = smoothstep(-edgeWidth, edgeWidth, wave);
	vec4 color = mix(uFirstColor, uSecondColor, selector);
	fragColor = vec4(color.rgb * color.a, color.a);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) throw new Error('Failed to create WebGL shader');
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(
			`Liquid contours shader compile failed: ${log ?? '(no log)'}`,
		);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	if (!program) throw new Error('Failed to create WebGL program');
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(
			`Liquid contours program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

const setup = (target: HTMLCanvasElement): LiquidContoursState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) throw createWebGL2ContextError('liquid contours effect');
	const program = createProgram(gl);
	const vao = gl.createVertexArray();
	if (!vao) throw new Error('Failed to create WebGL vertex array');
	gl.bindVertexArray(vao);
	const vbo = gl.createBuffer();
	if (!vbo) throw new Error('Failed to create WebGL buffer');
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
	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx)
		throw new Error('Failed to acquire 2D context for color parsing');
	return {
		gl,
		program,
		vao,
		vbo,
		colorCtx,
		uniforms: {
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uFirstColor: gl.getUniformLocation(program, 'uFirstColor'),
			uSecondColor: gl.getUniformLocation(program, 'uSecondColor'),
			uSpacing: gl.getUniformLocation(program, 'uSpacing'),
			uScale: gl.getUniformLocation(program, 'uScale'),
			uComplexity: gl.getUniformLocation(program, 'uComplexity'),
			uSmoothness: gl.getUniformLocation(program, 'uSmoothness'),
			uSeed: gl.getUniformLocation(program, 'uSeed'),
			uOffset: gl.getUniformLocation(program, 'uOffset'),
			uPhase: gl.getUniformLocation(program, 'uPhase'),
		},
		cachedFirstColor: '',
		cachedFirstColorRgba: [255, 26, 10, 255],
		cachedSecondColor: '',
		cachedSecondColorRgba: [5, 5, 5, 255],
	};
};

const normalized = (
	color: ParsedColorRgba,
): readonly [number, number, number, number] => [
	color[0] / 255,
	color[1] / 255,
	color[2] / 255,
	color[3] / 255,
];

export const liquidContours = createEffect<
	LiquidContoursParams,
	LiquidContoursState
>({
	type: 'dev.remotion.effects.liquidContours',
	label: 'liquidContours()',
	documentationLink: 'https://www.remotion.dev/docs/effects/liquid-contours',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `liquid-contours-${r.firstColor}-${r.secondColor}-${r.spacing}-${r.scale}-${r.complexity}-${r.smoothness}-${r.seed}-${r.offsetX}-${r.offsetY}-${r.phase}`;
	},
	setup,
	apply: ({width, height, params, state}) => {
		const r = resolve(params);
		if (state.cachedFirstColor !== r.firstColor) {
			state.cachedFirstColor = r.firstColor;
			state.cachedFirstColorRgba = parseColorRgba(state.colorCtx, r.firstColor);
		}

		if (state.cachedSecondColor !== r.secondColor) {
			state.cachedSecondColor = r.secondColor;
			state.cachedSecondColorRgba = parseColorRgba(
				state.colorCtx,
				r.secondColor,
			);
		}

		const first = normalized(state.cachedFirstColorRgba);
		const second = normalized(state.cachedSecondColorRgba);
		const {gl, program, vao, uniforms} = state;
		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);
		if (uniforms.uResolution) gl.uniform2f(uniforms.uResolution, width, height);
		if (uniforms.uFirstColor) gl.uniform4f(uniforms.uFirstColor, ...first);
		if (uniforms.uSecondColor) gl.uniform4f(uniforms.uSecondColor, ...second);
		if (uniforms.uSpacing) gl.uniform1f(uniforms.uSpacing, r.spacing);
		if (uniforms.uScale) gl.uniform1f(uniforms.uScale, r.scale);
		if (uniforms.uComplexity) gl.uniform1f(uniforms.uComplexity, r.complexity);
		if (uniforms.uSmoothness) gl.uniform1f(uniforms.uSmoothness, r.smoothness);
		if (uniforms.uSeed) gl.uniform1f(uniforms.uSeed, r.seed);
		if (uniforms.uOffset) gl.uniform2f(uniforms.uOffset, r.offsetX, r.offsetY);
		if (uniforms.uPhase) gl.uniform1f(uniforms.uPhase, r.phase);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo}) => {
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: liquidContoursSchema,
	validateParams: validateLiquidContoursParams,
});
