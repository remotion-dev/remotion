import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const TEAR_DIRECTIONS = ['top-to-bottom', 'bottom-to-top'] as const;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_GAP = 160 as const;
const DEFAULT_JAGGEDNESS = 80 as const;
const DEFAULT_FREQUENCY = 6 as const;
const DEFAULT_SEED = 0 as const;
const DEFAULT_CENTER = 0.5 as const;
const DEFAULT_ROTATION = 6 as const;
const DEFAULT_DIRECTION = 'top-to-bottom' as const;
const MAX_GAP = 2000 as const;
const MAX_JAGGEDNESS = 1000 as const;
const MAX_FREQUENCY = 100 as const;
const MAX_ROTATION = 45 as const;

export type TearDirection = (typeof TEAR_DIRECTIONS)[number];

const tearSchema = {
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	gap: {
		type: 'number',
		min: 0,
		max: MAX_GAP,
		step: 1,
		default: DEFAULT_GAP,
		description: 'Gap',
		hiddenFromList: false,
	},
	jaggedness: {
		type: 'number',
		min: 0,
		max: MAX_JAGGEDNESS,
		step: 1,
		default: DEFAULT_JAGGEDNESS,
		description: 'Jaggedness',
		hiddenFromList: false,
	},
	frequency: {
		type: 'number',
		min: 1,
		max: MAX_FREQUENCY,
		step: 1,
		default: DEFAULT_FREQUENCY,
		description: 'Frequency',
		hiddenFromList: false,
	},
	seed: {
		type: 'number',
		default: DEFAULT_SEED,
		description: 'Seed',
		hiddenFromList: false,
	},
	center: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_CENTER,
		description: 'Center',
		hiddenFromList: false,
	},
	rotation: {
		type: 'number',
		min: -MAX_ROTATION,
		max: MAX_ROTATION,
		step: 0.1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
		hiddenFromList: false,
	},
	direction: {
		type: 'enum',
		variants: {
			'top-to-bottom': {},
			'bottom-to-top': {},
		},
		default: DEFAULT_DIRECTION,
		description: 'Direction',
	},
} as const satisfies InteractivitySchema;

export type TearParams = {
	/** How far the rip has traveled through the source, from `0` to `1`. Defaults to `0.5`. */
	readonly progress?: number;
	/** Distance between the two pieces in pixels at full progress. Defaults to `160`. */
	readonly gap?: number;
	/** Maximum horizontal variation of the torn edge in pixels. Defaults to `80`. */
	readonly jaggedness?: number;
	/** Number of large edge segments from top to bottom. Defaults to `6`. */
	readonly frequency?: number;
	/** Seed for the torn edge shape. Defaults to `0`. */
	readonly seed?: number;
	/** Horizontal tear position from `0` to `1`. Defaults to `0.5`. */
	readonly center?: number;
	/** Outward rotation of each torn side in degrees. Defaults to `6`. */
	readonly rotation?: number;
	/** Direction in which the rip travels. Defaults to `top-to-bottom`. */
	readonly direction?: TearDirection;
};

type TearResolved = {
	readonly progress: number;
	readonly gap: number;
	readonly jaggedness: number;
	readonly frequency: number;
	readonly seed: number;
	readonly center: number;
	readonly rotation: number;
	readonly direction: TearDirection;
};

type TearState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uProgress: WebGLUniformLocation | null;
	readonly uGap: WebGLUniformLocation | null;
	readonly uJaggedness: WebGLUniformLocation | null;
	readonly uFrequency: WebGLUniformLocation | null;
	readonly uSeed: WebGLUniformLocation | null;
	readonly uCenter: WebGLUniformLocation | null;
	readonly uRotation: WebGLUniformLocation | null;
	readonly uDirection: WebGLUniformLocation | null;
};

const resolve = (params: TearParams): TearResolved => ({
	progress: params.progress ?? DEFAULT_PROGRESS,
	gap: params.gap ?? DEFAULT_GAP,
	jaggedness: params.jaggedness ?? DEFAULT_JAGGEDNESS,
	frequency: params.frequency ?? DEFAULT_FREQUENCY,
	seed: params.seed ?? DEFAULT_SEED,
	center: params.center ?? DEFAULT_CENTER,
	rotation: params.rotation ?? DEFAULT_ROTATION,
	direction: params.direction ?? DEFAULT_DIRECTION,
});

const validateAtMost = (value: number, max: number, name: string): void => {
	if (value > max) {
		throw new TypeError(
			`"${name}" must be <= ${max}, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateTearParams = (params: TearParams): void => {
	assertEffectParamsObject(params, 'tear()');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.gap, 'gap');
	assertOptionalFiniteNumber(params.jaggedness, 'jaggedness');
	assertOptionalFiniteNumber(params.frequency, 'frequency');
	assertOptionalFiniteNumber(params.seed, 'seed');
	assertOptionalFiniteNumber(params.center, 'center');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	if (
		params.direction !== undefined &&
		!TEAR_DIRECTIONS.includes(params.direction)
	) {
		throw new TypeError(
			`"direction" must be "top-to-bottom" or "bottom-to-top", but got ${JSON.stringify(params.direction)}`,
		);
	}

	const resolved = resolve(params);
	validateUnitInterval(resolved.progress, 'progress');
	validateNonNegative(resolved.gap, 'gap');
	validateAtMost(resolved.gap, MAX_GAP, 'gap');
	validateNonNegative(resolved.jaggedness, 'jaggedness');
	validateAtMost(resolved.jaggedness, MAX_JAGGEDNESS, 'jaggedness');
	if (resolved.frequency < 1) {
		throw new TypeError(
			`"frequency" must be >= 1, but got ${JSON.stringify(resolved.frequency)}`,
		);
	}

	validateAtMost(resolved.frequency, MAX_FREQUENCY, 'frequency');
	validateUnitInterval(resolved.center, 'center');
	if (resolved.rotation < -MAX_ROTATION) {
		throw new TypeError(
			`"rotation" must be >= -${MAX_ROTATION}, but got ${JSON.stringify(resolved.rotation)}`,
		);
	}

	validateAtMost(resolved.rotation, MAX_ROTATION, 'rotation');
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
uniform float uProgress;
uniform float uGap;
uniform float uJaggedness;
uniform float uFrequency;
uniform float uSeed;
uniform float uCenter;
uniform float uRotation;
uniform int uDirection;

const float PI = 3.141592653589793;

float random(float value) {
	return fract(sin(value * 12.9898 + uSeed * 78.233) * 43758.5453);
}

float tearPosition(float y) {
	float segment = y * uFrequency;
	float segmentIndex = floor(segment);
	float segmentProgress = fract(segment);
	float from = random(segmentIndex) * 2.0 - 1.0;
	float to = random(segmentIndex + 1.0) * 2.0 - 1.0;
	float offset = mix(from, to, segmentProgress);
	return clamp(
		uCenter + offset * uJaggedness / max(uResolution.x, 1.0),
		0.0,
		1.0
	);
}

bool insideTexture(vec2 position) {
	return position.x >= 0.0 && position.x <= 1.0 &&
		position.y >= 0.0 && position.y <= 1.0;
}

vec4 sampleSource(vec2 position) {
	return texture(uSource, vec2(position.x, 1.0 - position.y));
}

vec2 inverseRotate(vec2 position, vec2 pivot, float angle) {
	float sine = sin(angle);
	float cosine = cos(angle);
	vec2 relative = position - pivot;
	return pivot + vec2(
		cosine * relative.x + sine * relative.y,
		-sine * relative.x + cosine * relative.y
	);
}

void main() {
	vec2 outputPosition = vec2(vUv.x, 1.0 - vUv.y);
	float outputTravel = uDirection == 0
		? outputPosition.y
		: 1.0 - outputPosition.y;
	if (uProgress <= 0.000001) {
		fragColor = texture(uSource, vUv);
		return;
	}

	float front = uDirection == 0 ? uProgress : 1.0 - uProgress;
	float openingProgress = smoothstep(0.85, 1.0, uProgress);
	float initialHalfGap = min(uGap * 0.5, 1.0);
	float halfGap = mix(initialHalfGap, uGap * 0.5, openingProgress) /
		max(uResolution.x, 1.0);
	float angle = openingProgress * uRotation * PI / 180.0;
	vec2 pivot = vec2(uCenter, front);

	vec2 leftPosition = inverseRotate(
		outputPosition + vec2(halfGap, 0.0),
		pivot,
		-angle
	);
	vec2 rightPosition = inverseRotate(
		outputPosition - vec2(halfGap, 0.0),
		pivot,
		angle
	);
	bool showLeft = insideTexture(leftPosition) &&
		leftPosition.x <= tearPosition(leftPosition.y);
	bool showRight = insideTexture(rightPosition) &&
		rightPosition.x > tearPosition(rightPosition.y);

	if (showLeft) {
		fragColor = sampleSource(leftPosition);
		return;
	}

	if (showRight) {
		fragColor = sampleSource(rightPosition);
		return;
	}

	fragColor = outputTravel <= uProgress
		? vec4(0.0)
		: sampleSource(outputPosition);
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
		throw new Error(`Tear shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const linkProgram = (
	gl: WebGL2RenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader,
): WebGLProgram => {
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Tear program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const tear = createEffect<TearParams, TearState>({
	type: 'remotion/tear',
	label: 'tear()',
	documentationLink: 'https://www.remotion.dev/docs/effects/tear',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `tear-${resolved.progress}-${resolved.gap}-${resolved.jaggedness}-${resolved.frequency}-${resolved.seed}-${resolved.center}-${resolved.rotation}-${resolved.direction}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('tear effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fragmentShader = compileShader(
			gl,
			gl.FRAGMENT_SHADER,
			FRAGMENT_SHADER,
		);
		const program = linkProgram(gl, vertexShader, fragmentShader);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		const vao = gl.createVertexArray();
		if (!vao) {
			throw new Error('Failed to create WebGL vertex array');
		}

		gl.bindVertexArray(vao);
		const vbo = gl.createBuffer();
		if (!vbo) {
			throw new Error('Failed to create WebGL buffer');
		}

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
			uProgress: gl.getUniformLocation(program, 'uProgress'),
			uGap: gl.getUniformLocation(program, 'uGap'),
			uJaggedness: gl.getUniformLocation(program, 'uJaggedness'),
			uFrequency: gl.getUniformLocation(program, 'uFrequency'),
			uSeed: gl.getUniformLocation(program, 'uSeed'),
			uCenter: gl.getUniformLocation(program, 'uCenter'),
			uRotation: gl.getUniformLocation(program, 'uRotation'),
			uDirection: gl.getUniformLocation(program, 'uDirection'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);
		const {
			gl,
			program,
			vao,
			texture,
			uSource,
			uResolution,
			uProgress,
			uGap,
			uJaggedness,
			uFrequency,
			uSeed,
			uCenter,
			uRotation,
			uDirection,
		} = state;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);
		gl.bindVertexArray(vao);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
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
		if (uResolution) gl.uniform2f(uResolution, width, height);
		if (uProgress) gl.uniform1f(uProgress, resolved.progress);
		if (uGap) gl.uniform1f(uGap, resolved.gap);
		if (uJaggedness) gl.uniform1f(uJaggedness, resolved.jaggedness);
		if (uFrequency) gl.uniform1f(uFrequency, resolved.frequency);
		if (uSeed) gl.uniform1f(uSeed, resolved.seed);
		if (uCenter) gl.uniform1f(uCenter, resolved.center);
		if (uRotation) gl.uniform1f(uRotation, resolved.rotation);
		if (uDirection)
			gl.uniform1i(uDirection, resolved.direction === 'top-to-bottom' ? 0 : 1);
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
	schema: tearSchema,
	validateParams: validateTearParams,
});
