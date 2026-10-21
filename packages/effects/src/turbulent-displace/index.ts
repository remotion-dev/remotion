import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {assertOptionalFiniteNumber} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
	assertRequiredFiniteNumber,
} from '../validate-effect-param.js';
import {TURBULENT_DISPLACE_FRAGMENT_SHADER} from './shader.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_DISPLACEMENT = 'turbulent' as const;
const DEFAULT_AMOUNT = 50 as const;
const DEFAULT_SIZE = 100 as const;
const DEFAULT_OFFSET = [0.5, 0.5] as const;
const DEFAULT_COMPLEXITY = 1 as const;
const DEFAULT_EVOLUTION = 0 as const;
const DEFAULT_CYCLE_EVOLUTION = false as const;
const DEFAULT_CYCLE = 1 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_PINNING = 'all' as const;
const DISPLACEMENT_MODES = [
	'turbulent',
	'bulge',
	'twist',
	'turbulent-smoother',
	'bulge-smoother',
	'twist-smoother',
	'vertical',
	'horizontal',
	'cross',
] as const;
const PINNING_MODES = [
	'none',
	'all',
	'horizontal',
	'vertical',
	'left',
	'top',
	'right',
	'bottom',
	'all-locked',
	'horizontal-locked',
	'vertical-locked',
	'left-locked',
	'top-locked',
	'right-locked',
	'bottom-locked',
] as const;

const turbulentDisplaceSchema = {
	displacement: {
		type: 'enum',
		variants: {
			turbulent: {},
			bulge: {},
			twist: {},
			'turbulent-smoother': {},
			'bulge-smoother': {},
			'twist-smoother': {},
			vertical: {},
			horizontal: {},
			cross: {},
		},
		default: DEFAULT_DISPLACEMENT,
		description: 'Displacement',
	},
	amount: {
		type: 'number',
		min: -200,
		max: 200,
		step: 1,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	size: {
		type: 'number',
		min: 1,
		max: 1000,
		step: 1,
		default: DEFAULT_SIZE,
		description: 'Size',
		hiddenFromList: false,
	},
	offset: {
		type: 'uv-coordinate',
		step: 0.01,
		default: DEFAULT_OFFSET,
		description: 'Offset',
	},
	complexity: {
		type: 'number',
		min: 1,
		max: 10,
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
	pinning: {
		type: 'enum',
		variants: {
			none: {},
			all: {},
			horizontal: {},
			vertical: {},
			left: {},
			top: {},
			right: {},
			bottom: {},
			'all-locked': {},
			'horizontal-locked': {},
			'vertical-locked': {},
			'left-locked': {},
			'top-locked': {},
			'right-locked': {},
			'bottom-locked': {},
		},
		default: DEFAULT_PINNING,
		description: 'Pinning',
	},
} as const satisfies InteractivitySchema;

export type TurbulentDisplaceParams = {
	/** Distortion mode. Defaults to `turbulent`. */
	readonly displacement?: (typeof DISPLACEMENT_MODES)[number];
	/** Displacement strength in pixels. May be negative. Defaults to `50`. */
	readonly amount?: number;
	/** Size of the noise features in pixels. Must be at least `1`. Defaults to `100`. */
	readonly size?: number;
	/** Noise origin in UV coordinates. Defaults to `[0.5, 0.5]`. */
	readonly offset?: readonly [number, number];
	/** Number of noise layers, including fractional layers, from `1` to `10`. Defaults to `1`. */
	readonly complexity?: number;
	/** Noise evolution in degrees. Animate to morph the distortion. Defaults to `0`. */
	readonly evolution?: number;
	/** Loop the evolution after `cycle` revolutions. Defaults to `false`. */
	readonly cycleEvolution?: boolean;
	/** Loop length in whole revolutions. Defaults to `1`. */
	readonly cycle?: number;
	/** Unsigned 32-bit integer seed for repeatable distortion. Defaults to `0`. */
	readonly seed?: number;
	/** Edges kept in place. Locked modes also keep samples inside the source. Defaults to `all`. */
	readonly pinning?: (typeof PINNING_MODES)[number];
};

type TurbulentDisplaceResolved = Required<TurbulentDisplaceParams>;

const resolve = (
	params: TurbulentDisplaceParams,
): TurbulentDisplaceResolved => ({
	displacement: params.displacement ?? DEFAULT_DISPLACEMENT,
	amount: params.amount ?? DEFAULT_AMOUNT,
	size: params.size ?? DEFAULT_SIZE,
	offset: params.offset ?? DEFAULT_OFFSET,
	complexity: params.complexity ?? DEFAULT_COMPLEXITY,
	evolution: params.evolution ?? DEFAULT_EVOLUTION,
	cycleEvolution: params.cycleEvolution ?? DEFAULT_CYCLE_EVOLUTION,
	cycle: params.cycle ?? DEFAULT_CYCLE,
	seed: params.seed ?? DEFAULT_SEED,
	pinning: params.pinning ?? DEFAULT_PINNING,
});

const validateTurbulentDisplaceParams = (
	params: TurbulentDisplaceParams,
): void => {
	assertEffectParamsObject(params, 'Turbulent displace');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.size, 'size');
	assertOptionalFiniteNumber(params.complexity, 'complexity');
	assertOptionalFiniteNumber(params.evolution, 'evolution');
	assertOptionalBoolean(params.cycleEvolution, 'cycleEvolution');
	assertOptionalFiniteNumber(params.cycle, 'cycle');
	assertOptionalFiniteNumber(params.seed, 'seed');
	if (
		params.displacement !== undefined &&
		!DISPLACEMENT_MODES.includes(params.displacement)
	) {
		throw new TypeError(
			'Invalid displacement: ' + JSON.stringify(params.displacement),
		);
	}

	if (params.pinning !== undefined && !PINNING_MODES.includes(params.pinning)) {
		throw new TypeError('Invalid pinning: ' + JSON.stringify(params.pinning));
	}

	if (params.offset !== undefined) {
		if (!Array.isArray(params.offset) || params.offset.length !== 2)
			throw new TypeError('"offset" must be a two-number tuple');
		assertRequiredFiniteNumber(params.offset[0], 'offset[0]');
		assertRequiredFiniteNumber(params.offset[1], 'offset[1]');
	}

	const r = resolve(params);
	if (r.size < 1) throw new TypeError('"size" must be at least 1');
	if (r.complexity < 1 || r.complexity > 10)
		throw new TypeError('"complexity" must be between 1 and 10');
	if (!Number.isInteger(r.cycle) || r.cycle < 1 || r.cycle > 65535)
		throw new TypeError('"cycle" must be an integer between 1 and 65535');
	if (!Number.isInteger(r.seed) || r.seed < 0 || r.seed > 4294967295)
		throw new TypeError('"seed" must be an unsigned 32-bit integer');
};

type TurbulentDisplaceState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uDisplacement: WebGLUniformLocation | null;
	readonly uAmount: WebGLUniformLocation | null;
	readonly uSize: WebGLUniformLocation | null;
	readonly uOffset: WebGLUniformLocation | null;
	readonly uComplexity: WebGLUniformLocation | null;
	readonly uEvolution: WebGLUniformLocation | null;
	readonly uCycleEvolution: WebGLUniformLocation | null;
	readonly uCycle: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
	readonly uPinning: WebGLUniformLocation | null;
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
		throw new Error(
			`TurbulentDisplace shader compile failed: ${log ?? '(no log)'}`,
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
		throw new Error(
			`TurbulentDisplace program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

const setupTurbulentDisplace = (
	target: HTMLCanvasElement,
): TurbulentDisplaceState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('turbulent displace effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = compileShader(
		gl,
		gl.FRAGMENT_SHADER,
		TURBULENT_DISPLACE_FRAGMENT_SHADER,
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
		uDisplacement: gl.getUniformLocation(program, 'uDisplacement'),
		uAmount: gl.getUniformLocation(program, 'uAmount'),
		uSize: gl.getUniformLocation(program, 'uSize'),
		uOffset: gl.getUniformLocation(program, 'uOffset'),
		uComplexity: gl.getUniformLocation(program, 'uComplexity'),
		uEvolution: gl.getUniformLocation(program, 'uEvolution'),
		uCycleEvolution: gl.getUniformLocation(program, 'uCycleEvolution'),
		uCycle: gl.getUniformLocation(program, 'uCycle'),
		uSeed: gl.getUniformLocation(program, 'uSeed'),
		uPinning: gl.getUniformLocation(program, 'uPinning'),
	};
};

export const turbulentDisplace = createEffect<
	TurbulentDisplaceParams,
	TurbulentDisplaceState
>({
	type: 'remotion/turbulent-displace',
	label: 'turbulentDisplace()',
	documentationLink: 'https://www.remotion.dev/docs/effects/turbulent-displace',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `turbulent-displace-${JSON.stringify(r)}`;
	},
	setup: (target) => setupTurbulentDisplace(target),
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
		if (state.uDisplacement)
			gl.uniform1i(
				state.uDisplacement,
				DISPLACEMENT_MODES.indexOf(r.displacement),
			);
		if (state.uAmount) gl.uniform1f(state.uAmount, r.amount);
		if (state.uSize) gl.uniform1f(state.uSize, r.size);
		if (state.uOffset) gl.uniform2f(state.uOffset, r.offset[0], r.offset[1]);
		if (state.uComplexity) gl.uniform1f(state.uComplexity, r.complexity);
		if (state.uEvolution) gl.uniform1f(state.uEvolution, r.evolution / 360);
		if (state.uCycleEvolution)
			gl.uniform1i(state.uCycleEvolution, r.cycleEvolution ? 1 : 0);
		if (state.uCycle) gl.uniform1f(state.uCycle, r.cycle);
		if (state.uSeed) gl.uniform1ui(state.uSeed, r.seed);
		if (state.uPinning)
			gl.uniform1i(state.uPinning, PINNING_MODES.indexOf(r.pinning));

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
	schema: turbulentDisplaceSchema,
	validateParams: validateTurbulentDisplaceParams,
});
