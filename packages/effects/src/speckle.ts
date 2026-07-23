import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_DENSITY = 0.08 as const;
const DEFAULT_SIZE = 4 as const;
const DEFAULT_RANDOMNESS = 1 as const;

const speckleSchema = {
	density: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_DENSITY,
		description: 'Density',
		hiddenFromList: false,
	},
	size: {
		type: 'number',
		min: 0,
		max: 50,
		step: 0.1,
		default: DEFAULT_SIZE,
		description: 'Size',
		hiddenFromList: false,
	},
	randomness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_RANDOMNESS,
		description: 'Randomness',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type SpeckleParams = {
	/** Chance that a grid cell receives an alpha hole. Defaults to `0.08`. */
	readonly density?: number;
	/** Maximum speckle diameter in pixels. Defaults to `4`. */
	readonly size?: number;
	/** Amount of random position and size variation between 0 and 1. Defaults to `1`. */
	readonly randomness?: number;
};

type SpeckleResolved = {
	density: number;
	size: number;
	randomness: number;
};

const resolve = (p: SpeckleParams): SpeckleResolved => ({
	density: p.density ?? DEFAULT_DENSITY,
	size: p.size ?? DEFAULT_SIZE,
	randomness: p.randomness ?? DEFAULT_RANDOMNESS,
});

const validateSpeckleParams = (params: SpeckleParams): void => {
	assertEffectParamsObject(params, 'Speckle');
	assertOptionalFiniteNumber(params.density, 'density');
	assertOptionalFiniteNumber(params.size, 'size');
	assertOptionalFiniteNumber(params.randomness, 'randomness');

	const r = resolve(params);
	validateUnitInterval(r.density, 'density');
	validateNonNegative(r.size, 'size');
	validateUnitInterval(r.randomness, 'randomness');
};

const SPECKLE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SPECKLE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uDensity;
uniform float uSize;
uniform float uRandomness;

float hash21(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1871));
	p3 += dot(p3, p3.yzx + 19.19);
	return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
	return vec2(hash21(p + 17.13), hash21(p + 83.71));
}

void main() {
	vec4 color = texture(uSource, vUv);

	if (uDensity <= 0.0 || uSize <= 0.0) {
		fragColor = color;
		return;
	}

	vec2 fragPos = vUv * uResolution;
	float cellSize = max(uSize * 2.5, 1.0);
	vec2 baseCell = floor(fragPos / cellSize);
	float hole = 0.0;

	for (int y = -1; y <= 1; y++) {
		for (int x = -1; x <= 1; x++) {
			vec2 cell = baseCell + vec2(float(x), float(y));
			float chance = hash21(cell);

			if (chance <= uDensity) {
				vec2 randomOffset = (hash22(cell + 11.7) - 0.5) * uRandomness;
				vec2 center = (cell + 0.5 + randomOffset) * cellSize;
				float sizeVariation = mix(1.0, 0.35 + hash21(cell + 29.43) * 0.65, uRandomness);
				float radius = uSize * 0.5 * sizeVariation;
				float edge = min(1.0, max(radius * 0.5, 0.35));
				float coverage = 1.0 - smoothstep(radius - edge, radius + edge, length(fragPos - center));
				hole = max(hole, coverage);
			}
		}
	}

	fragColor = color * (1.0 - clamp(hole, 0.0, 1.0));
}
`;

type SpeckleState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uDensity: WebGLUniformLocation | null;
	uSize: WebGLUniformLocation | null;
	uRandomness: WebGLUniformLocation | null;
};

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
		throw new Error(`Speckle shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Speckle program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const speckle = createEffect<SpeckleParams, SpeckleState>({
	type: 'dev.remotion.effects.speckle',
	label: 'speckle()',
	documentationLink: 'https://www.remotion.dev/docs/effects/speckle',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `speckle-${r.density}-${r.size}-${r.randomness}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('speckle effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, SPECKLE_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, SPECKLE_FS);
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
			uDensity: gl.getUniformLocation(program, 'uDensity'),
			uSize: gl.getUniformLocation(program, 'uSize'),
			uRandomness: gl.getUniformLocation(program, 'uRandomness'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture} = state;

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
		if (state.uDensity) gl.uniform1f(state.uDensity, r.density);
		if (state.uSize) gl.uniform1f(state.uSize, r.size);
		if (state.uRandomness) gl.uniform1f(state.uRandomness, r.randomness);

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
	schema: speckleSchema,
	validateParams: validateSpeckleParams,
});
