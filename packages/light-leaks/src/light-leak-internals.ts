import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_SEED = 0 as const;
const DEFAULT_HUE_SHIFT = 0 as const;
const DEFAULT_PROGRESS = 0.5 as const;

export const lightLeakEffectSchema = {
	seed: {
		type: 'number',
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	hueShift: {
		type: 'number',
		min: 0,
		max: 360,
		default: DEFAULT_HUE_SHIFT,
		description: 'Hue Shift',
		hiddenFromList: false,
	},
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type LightLeakEffectParams = {
	readonly seed?: number;
	readonly hueShift?: number;
	/** Evolve/retract phase from 0 (start) to 1 (end). Defaults to 0.5. */
	readonly progress?: number;
};

type LightLeakResolved = {
	seed: number;
	hueShift: number;
	progress: number;
};

const resolve = (p: LightLeakEffectParams): LightLeakResolved => ({
	seed: p.seed ?? DEFAULT_SEED,
	hueShift: p.hueShift ?? DEFAULT_HUE_SHIFT,
	progress: p.progress ?? DEFAULT_PROGRESS,
});

const assertEffectParamsObject = (
	params: unknown,
	effectLabel: string,
): void => {
	if (params === null || typeof params !== 'object') {
		throw new TypeError(
			`${effectLabel} effect requires a parameters object, but got ${JSON.stringify(params)}`,
		);
	}
};

const assertOptionalFiniteNumber = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new TypeError(
			`"${name}" must be a finite number, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateUnitInterval = (value: number, name: string): void => {
	if (value < 0) {
		throw new TypeError(
			`"${name}" must be >= 0, but got ${JSON.stringify(value)}`,
		);
	}

	if (value > 1) {
		throw new TypeError(
			`"${name}" must be <= 1, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateLightLeakParams = (params: LightLeakEffectParams): void => {
	assertEffectParamsObject(params, 'lightLeak()');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalFiniteNumber(params.hueShift, 'hueShift');
	assertOptionalFiniteNumber(params.progress, 'progress');

	const {hueShift, progress} = resolve(params);
	if (hueShift < 0) {
		throw new TypeError(`"hueShift" must be >= 0, but got ${hueShift}`);
	}

	if (hueShift > 360) {
		throw new TypeError(`"hueShift" must be <= 360, but got ${hueShift}`);
	}

	validateUnitInterval(progress, 'progress');
};

const LIGHT_LEAK_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const LIGHT_LEAK_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float evolveProgress;
uniform float retractProgress;
uniform float seed;
uniform float retractSeed;
uniform float hueShift;
uniform vec2 resolution;

const float Pi = 3.14159;

vec3 computePattern(vec2 uv, float s, float t) {
	vec2 p = uv * 0.8;
	p += vec2(sin(s * 1.61803) * 5.0, cos(s * 2.71828) * 5.0);

	for (int i = 1; i < 5; i++) {
		vec2 newp = p;
		float fi = float(i);
		float phase = s * 0.7 * fi;
		newp.x += 0.6 / fi * cos(fi * p.y + t * 0.7 + 0.3 * fi + phase) + 20.0;
		newp.y += 0.6 / fi * cos(fi * p.x + t * 0.7 + 0.3 * float(i + 10) + phase) - 20.0 + 15.0;
		p = newp;
	}

	float v1 = 0.5 * sin(2.0 * p.x) + 0.5;
	float v2 = 0.5 * sin(2.0 * p.y) + 0.5;
	float blend = sin(p.x + p.y) * 0.5 + 0.5;
	float brightness = v1 * 0.5 + v2 * 0.5;
	float patternValue = brightness * 0.6 + blend * 0.4;

	return vec3(brightness, blend, patternValue);
}

void main() {
	float refScale = 1.92;
	vec2 uv = (gl_FragCoord.xy / resolution) * vec2(refScale, refScale * resolution.y / resolution.x);

	vec3 patA = computePattern(uv, seed, evolveProgress * Pi);
	float threshA = 1.0 - evolveProgress;
	float revealAlpha = smoothstep(threshA, threshA + 0.3, patA.z);

	vec2 maxUv = vec2(refScale, refScale * resolution.y / resolution.x);
	vec2 retractUv = maxUv - uv;
	vec3 patB = computePattern(retractUv, retractSeed, retractProgress * Pi);
	float threshB = 1.0 - retractProgress;
	float eraseAlpha = smoothstep(threshB, threshB + 0.3, patB.z);

	float alpha = revealAlpha * (1.0 - eraseAlpha);

	vec3 yellow = vec3(1.0, 0.85, 0.2);
	vec3 orange = vec3(1.0, 0.5, 0.05);
	vec3 col = mix(yellow, orange, patA.y);
	col *= 0.6 + 0.6 * patA.x;

	float angle = hueShift * Pi / 180.0;
	float cosA = cos(angle);
	float sinA = sin(angle);
	mat3 hueRot = mat3(
		cosA + (1.0 - cosA) / 3.0,
		(1.0 - cosA) / 3.0 - sinA * 0.57735,
		(1.0 - cosA) / 3.0 + sinA * 0.57735,
		(1.0 - cosA) / 3.0 + sinA * 0.57735,
		cosA + (1.0 - cosA) / 3.0,
		(1.0 - cosA) / 3.0 - sinA * 0.57735,
		(1.0 - cosA) / 3.0 - sinA * 0.57735,
		(1.0 - cosA) / 3.0 + sinA * 0.57735,
		cosA + (1.0 - cosA) / 3.0
	);
	col = clamp(hueRot * col, 0.0, 1.0);

	vec4 src = texture(uSource, vUv);
	vec4 leakPm = vec4(col * alpha, alpha);
	fragColor = leakPm + src * (1.0 - alpha);
}
`;

type LightLeakGlState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uEvolveProgress: WebGLUniformLocation | null;
	uRetractProgress: WebGLUniformLocation | null;
	uSeed: WebGLUniformLocation | null;
	uRetractSeed: WebGLUniformLocation | null;
	uHueShift: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
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
		throw new Error(`Light leak shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Light leak program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const lightLeak = createEffect<LightLeakEffectParams, LightLeakGlState>({
	type: 'dev.remotion.lightLeaks.lightLeak',
	label: 'lightLeak()',
	documentationLink:
		'https://www.remotion.dev/docs/light-leaks/light-leak-effect',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `light-leak-${r.seed}-${r.hueShift}-${r.progress}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('light leak effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, LIGHT_LEAK_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, LIGHT_LEAK_FS);
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
		gl.bindTexture(gl.TEXTURE_2D, null);

		return {
			gl,
			program,
			vao,
			vbo,
			texture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uEvolveProgress: gl.getUniformLocation(program, 'evolveProgress'),
			uRetractProgress: gl.getUniformLocation(program, 'retractProgress'),
			uSeed: gl.getUniformLocation(program, 'seed'),
			uRetractSeed: gl.getUniformLocation(program, 'retractSeed'),
			uHueShift: gl.getUniformLocation(program, 'hueShift'),
			uResolution: gl.getUniformLocation(program, 'resolution'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const evolveProgress = Math.min(1, r.progress * 2);
		const retractProgress = Math.max(0, r.progress * 2 - 1);

		const {
			gl,
			program,
			vao,
			texture,
			uSource,
			uEvolveProgress,
			uRetractProgress,
			uSeed,
			uRetractSeed,
			uHueShift,
			uResolution,
		} = state;

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		if (uSource) gl.uniform1i(uSource, 0);
		if (uEvolveProgress) gl.uniform1f(uEvolveProgress, evolveProgress);
		if (uRetractProgress) gl.uniform1f(uRetractProgress, retractProgress);
		if (uSeed) gl.uniform1f(uSeed, r.seed);
		if (uRetractSeed) gl.uniform1f(uRetractSeed, r.seed + 42);
		if (uHueShift) gl.uniform1f(uHueShift, r.hueShift);
		if (uResolution) gl.uniform2f(uResolution, width, height);

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
	schema: lightLeakEffectSchema,
	validateParams: validateLightLeakParams,
});

/**
 * Experimental internals for the light leak canvas effect pipeline.
 */
export const LightLeakInternals = {
	lightLeak,
} as const;
