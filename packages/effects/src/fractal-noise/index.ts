import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
	validateNonNegative,
} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
} from '../validate-effect-param.js';
import {FRACTAL_NOISE_FRAGMENT_SHADER} from './shader.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_FRACTAL_TYPE = 'basic' as const;
const DEFAULT_NOISE_TYPE = 'soft-linear' as const;
const DEFAULT_SCALE = 100 as const;
const DEFAULT_COMPLEXITY = 6 as const;
const DEFAULT_EVOLUTION = 0 as const;
const DEFAULT_CONTRAST = 1 as const;
const DEFAULT_BRIGHTNESS = 0 as const;
const DEFAULT_OFFSET_X = 0 as const;
const DEFAULT_OFFSET_Y = 0 as const;
const DEFAULT_SUB_INFLUENCE = 0.7 as const;
const DEFAULT_SUB_SCALING = 0.56 as const;
const DEFAULT_CYCLE_EVOLUTION = false as const;
const DEFAULT_CYCLE = 1 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_INVERT = false as const;
const DEFAULT_AMOUNT = 1 as const;

const FRACTAL_TYPES = [
	'basic',
	'turbulent-smooth',
	'turbulent-basic',
	'turbulent-sharp',
	'dynamic',
	'dynamic-twist',
	'dynamic-progressive',
	'max',
	'strings',
] as const;
const NOISE_TYPES = ['block', 'linear', 'soft-linear', 'spline'] as const;

const fractalNoiseSchema = {
	fractalType: {
		type: 'enum',
		variants: {
			basic: {},
			'turbulent-smooth': {},
			'turbulent-basic': {},
			'turbulent-sharp': {},
			dynamic: {},
			'dynamic-twist': {},
			'dynamic-progressive': {},
			max: {},
			strings: {},
		},
		default: DEFAULT_FRACTAL_TYPE,
		description: 'Fractal type',
	},
	noiseType: {
		type: 'enum',
		variants: {
			block: {},
			linear: {},
			'soft-linear': {},
			spline: {},
		},
		default: DEFAULT_NOISE_TYPE,
		description: 'Noise type',
	},
	scale: {
		type: 'number',
		min: 1,
		max: 1000,
		step: 1,
		default: DEFAULT_SCALE,
		description: 'Scale',
		hiddenFromList: false,
	},
	complexity: {
		type: 'number',
		min: 1,
		max: 20,
		step: 0.1,
		default: DEFAULT_COMPLEXITY,
		description: 'Complexity',
		hiddenFromList: false,
	},
	evolution: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_EVOLUTION,
		description: 'Evolution',
	},
	contrast: {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.01,
		default: DEFAULT_CONTRAST,
		description: 'Contrast',
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
	offsetX: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET_X,
		description: 'Offset X',
		hiddenFromList: false,
	},
	offsetY: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET_Y,
		description: 'Offset Y',
		hiddenFromList: false,
	},
	subInfluence: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SUB_INFLUENCE,
		description: 'Sub influence',
		hiddenFromList: false,
	},
	subScaling: {
		type: 'number',
		min: 0.1,
		max: 1,
		step: 0.01,
		default: DEFAULT_SUB_SCALING,
		description: 'Sub scaling',
		hiddenFromList: false,
	},
	cycleEvolution: {
		type: 'boolean',
		default: DEFAULT_CYCLE_EVOLUTION,
		description: 'Cycle evolution',
	},
	cycle: {
		type: 'number',
		min: 1,
		max: 100,
		step: 1,
		integer: true,
		default: DEFAULT_CYCLE,
		description: 'Cycle length',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		min: 0,
		max: 4294967295,
		step: 1,
		integer: true,
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	invert: {
		type: 'boolean',
		default: DEFAULT_INVERT,
		description: 'Invert',
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
} as const satisfies InteractivitySchema;

export type FractalNoiseParams = {
	/** Texture shape. Defaults to `basic`. */
	readonly fractalType?: (typeof FRACTAL_TYPES)[number];
	/** Lattice interpolation. Defaults to `soft-linear`. */
	readonly noiseType?: (typeof NOISE_TYPES)[number];
	/** Size of the largest noise cells in pixels. Defaults to `100`. */
	readonly scale?: number;
	/** Number of noise layers, including fractional layers, from `1` to `20`. Defaults to `6`. */
	readonly complexity?: number;
	/** Evolution in degrees. Animate to morph the texture. Defaults to `0`. */
	readonly evolution?: number;
	/** Contrast multiplier around mid-gray. Defaults to `1`. */
	readonly contrast?: number;
	/** Brightness added after contrast. Defaults to `0`. */
	readonly brightness?: number;
	/** Horizontal texture translation in pixels. Defaults to `0`. */
	readonly offsetX?: number;
	/** Vertical texture translation in pixels. Defaults to `0`. */
	readonly offsetY?: number;
	/** Relative strength of each successive layer, from `0` to `1`. Defaults to `0.7`. */
	readonly subInfluence?: number;
	/** Relative cell size of each successive layer, from `0.1` to `1`. Defaults to `0.56`. */
	readonly subScaling?: number;
	/** Loop evolution after `cycle` revolutions. Defaults to `false`. */
	readonly cycleEvolution?: boolean;
	/** Loop length in whole revolutions. Defaults to `1`. */
	readonly cycle?: number;
	/** Unsigned 32-bit integer seed for a repeatable texture. Defaults to `0`. */
	readonly seed?: number;
	/** Invert the generated grayscale values. Defaults to `false`. */
	readonly invert?: boolean;
	/** Mix with the source from `0` (unchanged) to `1` (noise only). Defaults to `1`. */
	readonly amount?: number;
};

type FractalNoiseResolved = Required<FractalNoiseParams>;

const resolve = (params: FractalNoiseParams): FractalNoiseResolved => ({
	fractalType: params.fractalType ?? DEFAULT_FRACTAL_TYPE,
	noiseType: params.noiseType ?? DEFAULT_NOISE_TYPE,
	scale: params.scale ?? DEFAULT_SCALE,
	complexity: params.complexity ?? DEFAULT_COMPLEXITY,
	evolution: params.evolution ?? DEFAULT_EVOLUTION,
	contrast: params.contrast ?? DEFAULT_CONTRAST,
	brightness: params.brightness ?? DEFAULT_BRIGHTNESS,
	offsetX: params.offsetX ?? DEFAULT_OFFSET_X,
	offsetY: params.offsetY ?? DEFAULT_OFFSET_Y,
	subInfluence: params.subInfluence ?? DEFAULT_SUB_INFLUENCE,
	subScaling: params.subScaling ?? DEFAULT_SUB_SCALING,
	cycleEvolution: params.cycleEvolution ?? DEFAULT_CYCLE_EVOLUTION,
	cycle: params.cycle ?? DEFAULT_CYCLE,
	seed: params.seed ?? DEFAULT_SEED,
	invert: params.invert ?? DEFAULT_INVERT,
	amount: params.amount ?? DEFAULT_AMOUNT,
});

const validateFractalNoiseParams = (params: FractalNoiseParams): void => {
	assertEffectParamsObject(params, 'Fractal noise');
	assertOptionalFiniteNumber(params.scale, 'scale');
	assertOptionalFiniteNumber(params.complexity, 'complexity');
	assertOptionalFiniteNumber(params.evolution, 'evolution');
	assertOptionalFiniteNumber(params.contrast, 'contrast');
	assertOptionalFiniteNumber(params.brightness, 'brightness');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalFiniteNumber(params.subInfluence, 'subInfluence');
	assertOptionalFiniteNumber(params.subScaling, 'subScaling');
	assertOptionalBoolean(params.cycleEvolution, 'cycleEvolution');
	assertOptionalFiniteNumber(params.cycle, 'cycle');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalBoolean(params.invert, 'invert');
	assertOptionalFiniteNumber(params.amount, 'amount');
	const r = resolve(params);
	if (
		params.fractalType !== undefined &&
		!FRACTAL_TYPES.includes(params.fractalType)
	) {
		throw new TypeError(
			'Invalid fractalType: ' + JSON.stringify(params.fractalType),
		);
	}

	if (
		params.noiseType !== undefined &&
		!NOISE_TYPES.includes(params.noiseType)
	) {
		throw new TypeError(
			'Invalid noiseType: ' + JSON.stringify(params.noiseType),
		);
	}

	if (r.scale < 1) throw new TypeError('"scale" must be at least 1');
	if (r.complexity < 1 || r.complexity > 20)
		throw new TypeError('"complexity" must be between 1 and 20');
	if (r.subScaling < 0.1 || r.subScaling > 1)
		throw new TypeError('"subScaling" must be between 0.1 and 1');
	if (!Number.isInteger(r.cycle) || r.cycle < 1 || r.cycle > 65535)
		throw new TypeError('"cycle" must be an integer between 1 and 65535');
	if (!Number.isInteger(r.seed) || r.seed < 0 || r.seed > 4294967295)
		throw new TypeError('"seed" must be an unsigned 32-bit integer');
	validateNonNegative(r.contrast, 'contrast');
	validateUnitInterval(r.subInfluence, 'subInfluence');
	validateUnitInterval(r.amount, 'amount');
};

type FractalNoiseState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uOffset: WebGLUniformLocation | null;
	readonly uFractalType: WebGLUniformLocation | null;
	readonly uNoiseType: WebGLUniformLocation | null;
	readonly uScale: WebGLUniformLocation | null;
	readonly uComplexity: WebGLUniformLocation | null;
	readonly uEvolution: WebGLUniformLocation | null;
	readonly uContrast: WebGLUniformLocation | null;
	readonly uBrightness: WebGLUniformLocation | null;
	readonly uSubInfluence: WebGLUniformLocation | null;
	readonly uSubScaling: WebGLUniformLocation | null;
	readonly uCycleEvolution: WebGLUniformLocation | null;
	readonly uCycle: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
	readonly uInvert: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
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
		throw new Error(`FractalNoise shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`FractalNoise program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupFractalNoise = (target: HTMLCanvasElement): FractalNoiseState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('fractal noise effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = compileShader(
		gl,
		gl.FRAGMENT_SHADER,
		FRACTAL_NOISE_FRAGMENT_SHADER,
	);
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
		uResolution: gl.getUniformLocation(program, 'uResolution'),
		uOffset: gl.getUniformLocation(program, 'uOffset'),
		uFractalType: gl.getUniformLocation(program, 'uFractalType'),
		uNoiseType: gl.getUniformLocation(program, 'uNoiseType'),
		uScale: gl.getUniformLocation(program, 'uScale'),
		uComplexity: gl.getUniformLocation(program, 'uComplexity'),
		uEvolution: gl.getUniformLocation(program, 'uEvolution'),
		uContrast: gl.getUniformLocation(program, 'uContrast'),
		uBrightness: gl.getUniformLocation(program, 'uBrightness'),
		uSubInfluence: gl.getUniformLocation(program, 'uSubInfluence'),
		uSubScaling: gl.getUniformLocation(program, 'uSubScaling'),
		uCycleEvolution: gl.getUniformLocation(program, 'uCycleEvolution'),
		uCycle: gl.getUniformLocation(program, 'uCycle'),
		uSeed: gl.getUniformLocation(program, 'uSeed'),
		uInvert: gl.getUniformLocation(program, 'uInvert'),
		uAmount: gl.getUniformLocation(program, 'uAmount'),
	};
};

export const fractalNoise = createEffect<FractalNoiseParams, FractalNoiseState>(
	{
		type: 'remotion/fractal-noise',
		label: 'fractalNoise()',
		documentationLink: 'https://www.remotion.dev/docs/effects/fractal-noise',
		backend: 'webgl2',
		calculateKey: (params) => {
			const r = resolve(params);
			return `fractal-noise-${JSON.stringify(r)}`;
		},
		setup: (target) => setupFractalNoise(target),
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
			if (state.uResolution) gl.uniform2f(state.uResolution, width, height);
			if (state.uOffset) gl.uniform2f(state.uOffset, r.offsetX, r.offsetY);
			if (state.uFractalType)
				gl.uniform1i(state.uFractalType, FRACTAL_TYPES.indexOf(r.fractalType));
			if (state.uNoiseType)
				gl.uniform1i(state.uNoiseType, NOISE_TYPES.indexOf(r.noiseType));
			if (state.uScale) gl.uniform1f(state.uScale, r.scale);
			if (state.uComplexity) gl.uniform1f(state.uComplexity, r.complexity);
			if (state.uEvolution) gl.uniform1f(state.uEvolution, r.evolution / 360);
			if (state.uContrast) gl.uniform1f(state.uContrast, r.contrast);
			if (state.uBrightness) gl.uniform1f(state.uBrightness, r.brightness);
			if (state.uSubInfluence)
				gl.uniform1f(state.uSubInfluence, r.subInfluence);
			if (state.uSubScaling) gl.uniform1f(state.uSubScaling, r.subScaling);
			if (state.uCycleEvolution)
				gl.uniform1i(state.uCycleEvolution, r.cycleEvolution ? 1 : 0);
			if (state.uCycle) gl.uniform1f(state.uCycle, r.cycle);
			if (state.uSeed) gl.uniform1ui(state.uSeed, r.seed);
			if (state.uInvert) gl.uniform1i(state.uInvert, r.invert ? 1 : 0);
			if (state.uAmount) gl.uniform1f(state.uAmount, r.amount);

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
		schema: fractalNoiseSchema,
		validateParams: validateFractalNoiseParams,
	},
);
