import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_ANGLE = 30 as const;
const DEFAULT_HALO_SIGMA = 200 as const;
const DEFAULT_CORE_SIGMA = 65 as const;
const DEFAULT_HALO_INTENSITY = 0.3 as const;
const DEFAULT_CORE_INTENSITY = 0.4 as const;

const shineSchema = {
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	angle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ANGLE,
		description: 'Angle',
	},
	haloSigma: {
		type: 'number',
		min: 1,
		max: 500,
		step: 1,
		default: DEFAULT_HALO_SIGMA,
		description: 'Halo sigma',
		hiddenFromList: false,
	},
	coreSigma: {
		type: 'number',
		min: 1,
		max: 500,
		step: 1,
		default: DEFAULT_CORE_SIGMA,
		description: 'Core sigma',
		hiddenFromList: false,
	},
	haloIntensity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_HALO_INTENSITY,
		description: 'Halo intensity',
		hiddenFromList: false,
	},
	coreIntensity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CORE_INTENSITY,
		description: 'Core intensity',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type ShineParams = {
	/** Position of the shine sweep from `0` to `1`. Defaults to `0.5`. */
	readonly progress?: number;
	/** Sweep direction in degrees. Defaults to `30`. */
	readonly angle?: number;
	/** Soft outer halo width in pixels. Defaults to `200`. */
	readonly haloSigma?: number;
	/** Bright core width in pixels. Defaults to `65`. */
	readonly coreSigma?: number;
	/** Peak halo brightness from `0` to `1`. Defaults to `0.3`. */
	readonly haloIntensity?: number;
	/** Peak core brightness from `0` to `1`. Defaults to `0.4`. */
	readonly coreIntensity?: number;
};

type ShineResolved = {
	readonly progress: number;
	readonly angle: number;
	readonly haloSigma: number;
	readonly coreSigma: number;
	readonly haloIntensity: number;
	readonly coreIntensity: number;
};

const resolve = (p: ShineParams): ShineResolved => ({
	progress: p.progress ?? DEFAULT_PROGRESS,
	angle: p.angle ?? DEFAULT_ANGLE,
	haloSigma: p.haloSigma ?? DEFAULT_HALO_SIGMA,
	coreSigma: p.coreSigma ?? DEFAULT_CORE_SIGMA,
	haloIntensity: p.haloIntensity ?? DEFAULT_HALO_INTENSITY,
	coreIntensity: p.coreIntensity ?? DEFAULT_CORE_INTENSITY,
});

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateShineParams = (params: ShineParams): void => {
	assertEffectParamsObject(params, 'Shine');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.haloSigma, 'haloSigma');
	assertOptionalFiniteNumber(params.coreSigma, 'coreSigma');
	assertOptionalFiniteNumber(params.haloIntensity, 'haloIntensity');
	assertOptionalFiniteNumber(params.coreIntensity, 'coreIntensity');

	const r = resolve(params);
	validateUnitInterval(r.progress, 'progress');
	validatePositive(r.haloSigma, 'haloSigma');
	validatePositive(r.coreSigma, 'coreSigma');
	validateUnitInterval(r.haloIntensity, 'haloIntensity');
	validateUnitInterval(r.coreIntensity, 'coreIntensity');
};

type ShineState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uBandNormal: WebGLUniformLocation | null;
	readonly uBandT: WebGLUniformLocation | null;
	readonly uHaloSigma: WebGLUniformLocation | null;
	readonly uCoreSigma: WebGLUniformLocation | null;
	readonly uHaloIntensity: WebGLUniformLocation | null;
	readonly uCoreIntensity: WebGLUniformLocation | null;
};

const SHINE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SHINE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec2 uBandNormal;
uniform float uBandT;
uniform float uHaloSigma;
uniform float uCoreSigma;
uniform float uHaloIntensity;
uniform float uCoreIntensity;

void main() {
	vec4 source = texture(uSource, vUv);
	vec2 px = vec2(vUv.x * uResolution.x, (1.0 - vUv.y) * uResolution.y);
	vec2 center = uResolution * 0.5;

	float dist = dot(px - center, uBandNormal) - uBandT;
	float halo = exp(-(dist * dist) / (uHaloSigma * uHaloSigma)) * uHaloIntensity;
	float core = exp(-(dist * dist) / (uCoreSigma * uCoreSigma)) * uCoreIntensity;
	float intensity = clamp(halo + core, 0.0, 1.0);

	vec3 finalPremult = source.rgb * (1.0 - intensity) + intensity * source.a;
	fragColor = vec4(finalPremult, source.a);
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
		throw new Error(`Shine shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Shine program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const shine = createEffect<ShineParams, ShineState>({
	type: 'dev.remotion.effects.shine',
	label: 'shine()',
	documentationLink: 'https://www.remotion.dev/docs/effects/shine',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `shine-${r.progress}-${r.angle}-${r.haloSigma}-${r.coreSigma}-${r.haloIntensity}-${r.coreIntensity}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('shine effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, SHINE_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, SHINE_FS);
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
			uBandNormal: gl.getUniformLocation(program, 'uBandNormal'),
			uBandT: gl.getUniformLocation(program, 'uBandT'),
			uHaloSigma: gl.getUniformLocation(program, 'uHaloSigma'),
			uCoreSigma: gl.getUniformLocation(program, 'uCoreSigma'),
			uHaloIntensity: gl.getUniformLocation(program, 'uHaloIntensity'),
			uCoreIntensity: gl.getUniformLocation(program, 'uCoreIntensity'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const angleRad = (r.angle * Math.PI) / 180;
		const bandNormalX = Math.cos(angleRad);
		const bandNormalY = -Math.sin(angleRad);
		const bboxProjection =
			Math.abs(bandNormalX) * width + Math.abs(bandNormalY) * height;
		const sweepHalfRange = bboxProjection / 2 + 3 * r.haloSigma;
		const bandT = -sweepHalfRange + r.progress * sweepHalfRange * 2;
		const {gl, program, vao, texture} = state;

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
		if (state.uBandNormal)
			gl.uniform2f(state.uBandNormal, bandNormalX, bandNormalY);
		if (state.uBandT) gl.uniform1f(state.uBandT, bandT);
		if (state.uHaloSigma) gl.uniform1f(state.uHaloSigma, r.haloSigma);
		if (state.uCoreSigma) gl.uniform1f(state.uCoreSigma, r.coreSigma);
		if (state.uHaloIntensity)
			gl.uniform1f(state.uHaloIntensity, r.haloIntensity);
		if (state.uCoreIntensity)
			gl.uniform1f(state.uCoreIntensity, r.coreIntensity);

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
	schema: shineSchema,
	validateParams: validateShineParams,
});
