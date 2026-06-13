import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const PAGE_TURN_DIRECTIONS = ['left', 'right', 'top', 'bottom'] as const;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_DIRECTION = 'left' as const;
const DEFAULT_FOLD_RADIUS = 0.18 as const;
const DEFAULT_SHADOW = 0.45 as const;
const DEFAULT_BACK_OPACITY = 0.35 as const;

export const pageTurnSchema = {
	progress: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	direction: {
		type: 'enum',
		variants: {
			left: {},
			right: {},
			top: {},
			bottom: {},
		},
		default: DEFAULT_DIRECTION,
		description: 'Direction',
	},
	foldRadius: {
		type: 'number',
		min: 0.02,
		max: 0.5,
		step: 0.01,
		default: DEFAULT_FOLD_RADIUS,
		description: 'Fold radius',
		hiddenFromList: false,
	},
	shadow: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SHADOW,
		description: 'Shadow',
		hiddenFromList: false,
	},
	backOpacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_BACK_OPACITY,
		description: 'Back opacity',
		hiddenFromList: false,
	},
} as const satisfies SequenceSchema;

export type PageTurnDirection = (typeof PAGE_TURN_DIRECTIONS)[number];

export type PageTurnParams = {
	/**
	 * Turn amount from 0 (flat source) to 1 (fully turned away).
	 * Defaults to `0.5`.
	 */
	readonly progress?: number;
	/** Edge that turns across the source. Defaults to `left`. */
	readonly direction?: PageTurnDirection;
	/**
	 * Width of the curled band as a fraction of the canvas. Defaults to `0.18`.
	 */
	readonly foldRadius?: number;
	/** Strength of the crease and back-face shading. Defaults to `0.45`. */
	readonly shadow?: number;
	/** Opacity of the dimmed back face of the page. Defaults to `0.35`. */
	readonly backOpacity?: number;
};

type PageTurnResolved = {
	progress: number;
	direction: PageTurnDirection;
	foldRadius: number;
	shadow: number;
	backOpacity: number;
};

type PageTurnState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uProgress: WebGLUniformLocation | null;
	readonly uDirection: WebGLUniformLocation | null;
	readonly uFoldRadius: WebGLUniformLocation | null;
	readonly uShadow: WebGLUniformLocation | null;
	readonly uBackOpacity: WebGLUniformLocation | null;
};

const formatEnum = (variants: readonly string[]): string => {
	return `${variants
		.slice(0, -1)
		.map((variant) => `"${variant}"`)
		.join(', ')} or "${variants[variants.length - 1]}"`;
};

const resolve = (p: PageTurnParams): PageTurnResolved => ({
	progress: p.progress ?? DEFAULT_PROGRESS,
	direction: p.direction ?? DEFAULT_DIRECTION,
	foldRadius: p.foldRadius ?? DEFAULT_FOLD_RADIUS,
	shadow: p.shadow ?? DEFAULT_SHADOW,
	backOpacity: p.backOpacity ?? DEFAULT_BACK_OPACITY,
});

const validateDirection = (direction: unknown): void => {
	if (direction === undefined) {
		return;
	}

	if (
		typeof direction !== 'string' ||
		!PAGE_TURN_DIRECTIONS.includes(direction as PageTurnDirection)
	) {
		throw new TypeError(
			`"direction" must be ${formatEnum(PAGE_TURN_DIRECTIONS)}, but got ${JSON.stringify(direction)}`,
		);
	}
};

const validatePageTurnParams = (params: PageTurnParams): void => {
	assertEffectParamsObject(params, 'Page turn');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.foldRadius, 'foldRadius');
	assertOptionalFiniteNumber(params.shadow, 'shadow');
	assertOptionalFiniteNumber(params.backOpacity, 'backOpacity');
	validateDirection(params.direction);

	validateUnitInterval(params.progress ?? DEFAULT_PROGRESS, 'progress');
	validateUnitInterval(params.shadow ?? DEFAULT_SHADOW, 'shadow');
	validateUnitInterval(
		params.backOpacity ?? DEFAULT_BACK_OPACITY,
		'backOpacity',
	);

	const foldRadius = params.foldRadius ?? DEFAULT_FOLD_RADIUS;
	if (foldRadius < 0.02) {
		throw new TypeError(
			`"foldRadius" must be >= 0.02, but got ${JSON.stringify(foldRadius)}`,
		);
	}

	if (foldRadius > 0.5) {
		throw new TypeError(
			`"foldRadius" must be <= 0.5, but got ${JSON.stringify(foldRadius)}`,
		);
	}
};

const PAGE_TURN_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const PAGE_TURN_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uProgress;
uniform int uDirection;
uniform float uFoldRadius;
uniform float uShadow;
uniform float uBackOpacity;

const float PI = 3.141592653589793;

float toTurnAxis(vec2 uv) {
	if (uDirection == 0) return 1.0 - uv.x;
	if (uDirection == 1) return uv.x;
	if (uDirection == 2) return 1.0 - uv.y;
	return uv.y;
}

vec2 fromTurnAxis(vec2 uv, float axis, float cross) {
	if (uDirection == 0) return vec2(1.0 - axis, cross);
	if (uDirection == 1) return vec2(axis, cross);
	if (uDirection == 2) return vec2(cross, 1.0 - axis);
	return vec2(cross, axis);
}

float toCrossAxis(vec2 uv) {
	if (uDirection < 2) return uv.y;
	return uv.x;
}

void main() {
	float axis = toTurnAxis(vUv);
	float cross = toCrossAxis(vUv);
	float progress = clamp(uProgress, 0.0, 1.0);
	float radius = clamp(uFoldRadius, 0.02, 0.5);
	float start = progress - radius;
	float end = progress;

	if (axis >= end) {
		fragColor = texture(uSource, vUv);
		return;
	}

	if (axis <= start) {
		fragColor = vec4(0.0);
		return;
	}

	float t = clamp((axis - start) / max(radius, 0.0001), 0.0, 1.0);
	float bend = sin(t * PI * 0.5);
	float sourceAxis = end + (1.0 - bend) * radius;
	float crossWarp = (0.5 - cross) * sin(t * PI) * radius * 0.14;
	vec2 sampleUv = fromTurnAxis(vUv, sourceAxis, cross + crossWarp);

	if (
		sampleUv.x < 0.0 || sampleUv.x > 1.0 ||
		sampleUv.y < 0.0 || sampleUv.y > 1.0
	) {
		fragColor = vec4(0.0);
		return;
	}

	vec4 color = texture(uSource, sampleUv);
	float crease = 1.0 - smoothstep(0.0, 0.18, t);
	float rim = 1.0 - smoothstep(0.82, 1.0, t);
	float backMix = 1.0 - smoothstep(0.15, 0.92, t);
	float shade = 1.0 - uShadow * (0.58 * crease + 0.28 * (1.0 - rim));

	vec3 rgb = color.a > 0.001 ? color.rgb / color.a : vec3(0.0);
	vec3 backRgb = mix(rgb, vec3(dot(rgb, vec3(0.299, 0.587, 0.114))), 0.35);
	vec3 shaded = mix(rgb, backRgb, backMix) * shade;
	float alpha = color.a * mix(1.0, uBackOpacity, backMix);

	fragColor = vec4(shaded * alpha, alpha);
}
`;

const DIRECTION_INDEX: Record<PageTurnDirection, number> = {
	left: 0,
	right: 1,
	top: 2,
	bottom: 3,
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
		throw new Error(`Page turn shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Page turn program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const pageTurn = createEffect<PageTurnParams, PageTurnState>({
	type: 'remotion/page-turn',
	label: 'pageTurn()',
	documentationLink: 'https://www.remotion.dev/docs/effects/page-turn',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `page-turn-${r.progress}-${r.direction}-${r.foldRadius}-${r.shadow}-${r.backOpacity}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('page turn effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, PAGE_TURN_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, PAGE_TURN_FS);
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
			uProgress: gl.getUniformLocation(program, 'uProgress'),
			uDirection: gl.getUniformLocation(program, 'uDirection'),
			uFoldRadius: gl.getUniformLocation(program, 'uFoldRadius'),
			uShadow: gl.getUniformLocation(program, 'uShadow'),
			uBackOpacity: gl.getUniformLocation(program, 'uBackOpacity'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, texture, vao} = state;

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
		if (state.uProgress) gl.uniform1f(state.uProgress, r.progress);
		if (state.uDirection)
			gl.uniform1i(state.uDirection, DIRECTION_INDEX[r.direction]);
		if (state.uFoldRadius) gl.uniform1f(state.uFoldRadius, r.foldRadius);
		if (state.uShadow) gl.uniform1f(state.uShadow, r.shadow);
		if (state.uBackOpacity) gl.uniform1f(state.uBackOpacity, r.backOpacity);

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
	schema: pageTurnSchema,
	validateParams: validatePageTurnParams,
});
