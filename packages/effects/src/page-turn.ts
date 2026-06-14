import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateUnitInterval,
} from './color-utils.js';
import {publicUvToShaderUv} from './uv-coordinate.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_FOLD_POSITION = [1, 1] as const;
const DEFAULT_ANGLE = 225 as const;
const DEFAULT_FOLD_RADIUS = 0.18 as const;
const DEFAULT_LIGHT_DIRECTION = 60 as const;
const DEFAULT_SHADOW = 0.45 as const;
const DEFAULT_BACK_OPACITY = 0.85 as const;
const DEFAULT_PAPER_COLOR = '#fff8dc' as const;

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
	foldPosition: {
		type: 'uv-coordinate',
		step: 0.01,
		default: DEFAULT_FOLD_POSITION,
		description: 'Fold position',
	},
	angle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ANGLE,
		description: 'Angle',
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
	lightDirection: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_LIGHT_DIRECTION,
		description: 'Light direction',
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
	paperColor: {
		type: 'color',
		default: DEFAULT_PAPER_COLOR,
		description: 'Paper color',
	},
} as const satisfies SequenceSchema;

export type PageTurnFoldPosition = readonly [number, number];

export type PageTurnParams = {
	/**
	 * Turn amount from 0 (flat source) to 1 (fully turned away).
	 * Defaults to `0.5`.
	 */
	readonly progress?: number;
	/**
	 * Point where the page starts folding, in UV coordinates.
	 * Defaults to `[1, 1]`.
	 */
	readonly foldPosition?: PageTurnFoldPosition;
	/** Direction of the turn in degrees. Defaults to `225`. */
	readonly angle?: number;
	/**
	 * Width of the curled band as a fraction of the canvas. Defaults to `0.18`.
	 */
	readonly foldRadius?: number;
	/** Direction of the light in degrees. Defaults to `60`. */
	readonly lightDirection?: number;
	/** Strength of the crease and back-face shading. Defaults to `0.45`. */
	readonly shadow?: number;
	/** Opacity of the dimmed back face of the page. Defaults to `0.85`. */
	readonly backOpacity?: number;
	/** Color of the paper back side. Defaults to `#fff8dc`. */
	readonly paperColor?: string;
};

type PageTurnResolved = {
	progress: number;
	foldPosition: PageTurnFoldPosition;
	angle: number;
	foldRadius: number;
	lightDirection: number;
	shadow: number;
	backOpacity: number;
	paperColor: string;
};

type PageTurnState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uProgress: WebGLUniformLocation | null;
	readonly uFoldPosition: WebGLUniformLocation | null;
	readonly uDirectionVector: WebGLUniformLocation | null;
	readonly uLightVector: WebGLUniformLocation | null;
	readonly uFoldRadius: WebGLUniformLocation | null;
	readonly uShadow: WebGLUniformLocation | null;
	readonly uBackOpacity: WebGLUniformLocation | null;
	readonly uPaperColor: WebGLUniformLocation | null;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedPaperColor: string;
	cachedPaperColorRgba: ParsedColorRgba;
};

const resolve = (p: PageTurnParams): PageTurnResolved => ({
	progress: p.progress ?? DEFAULT_PROGRESS,
	foldPosition: [
		...(p.foldPosition ?? DEFAULT_FOLD_POSITION),
	] as PageTurnFoldPosition,
	angle: p.angle ?? DEFAULT_ANGLE,
	foldRadius: p.foldRadius ?? DEFAULT_FOLD_RADIUS,
	lightDirection: p.lightDirection ?? DEFAULT_LIGHT_DIRECTION,
	shadow: p.shadow ?? DEFAULT_SHADOW,
	backOpacity: p.backOpacity ?? DEFAULT_BACK_OPACITY,
	paperColor: p.paperColor ?? DEFAULT_PAPER_COLOR,
});

const assertOptionalUvCoordinate = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		value.some((item) => typeof item !== 'number' || !Number.isFinite(item))
	) {
		throw new TypeError(`"${name}" must be a [number, number] tuple`);
	}
};

const validatePageTurnParams = (params: PageTurnParams): void => {
	assertEffectParamsObject(params, 'Page turn');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalUvCoordinate(params.foldPosition, 'foldPosition');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.foldRadius, 'foldRadius');
	assertOptionalFiniteNumber(params.lightDirection, 'lightDirection');
	assertOptionalFiniteNumber(params.shadow, 'shadow');
	assertOptionalFiniteNumber(params.backOpacity, 'backOpacity');
	assertOptionalColor(params.paperColor, 'paperColor');

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
uniform vec2 uFoldPosition;
uniform vec2 uDirectionVector;
uniform vec2 uLightVector;
uniform float uFoldRadius;
uniform float uShadow;
uniform float uBackOpacity;
uniform vec4 uPaperColor;

const float PI = 3.141592653589793;

vec2 rangeFromPosition(vec2 origin, vec2 v) {
	float a0 = dot(vec2(0.0, 0.0) - origin, v);
	float a1 = dot(vec2(1.0, 0.0) - origin, v);
	float a2 = dot(vec2(0.0, 1.0) - origin, v);
	float a3 = dot(vec2(1.0, 1.0) - origin, v);
	return vec2(
		min(min(a0, a1), min(a2, a3)),
		max(max(a0, a1), max(a2, a3))
	);
}

vec2 effectiveDirection() {
	vec2 range = rangeFromPosition(uFoldPosition, uDirectionVector);
	return range.y >= -range.x ? uDirectionVector : -uDirectionVector;
}

float toTurnAxis(vec2 uv) {
	vec2 dir = effectiveDirection();
	vec2 range = rangeFromPosition(uFoldPosition, dir);
	float rawAxis = dot(uv - uFoldPosition, dir);
	return rawAxis / max(range.y, 0.0001);
}

vec2 fromTurnAxis(float axis, float cross, vec2 dir, float axisSpan) {
	vec2 perpendicular = vec2(-dir.y, dir.x);
	return uFoldPosition + dir * (axis * axisSpan) + perpendicular * cross;
}

float toCrossAxis(vec2 uv, vec2 dir) {
	vec2 perpendicular = vec2(-dir.y, dir.x);
	return dot(uv - uFoldPosition, perpendicular);
}

void main() {
	vec2 dir = effectiveDirection();
	vec2 perpendicular = vec2(-dir.y, dir.x);
	vec2 axisRange = rangeFromPosition(uFoldPosition, dir);
	vec2 crossRange = rangeFromPosition(uFoldPosition, perpendicular);
	float axisSpan = max(axisRange.y, 0.0001);
	float axis = toTurnAxis(vUv);
	float cross = toCrossAxis(vUv, dir);
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
	float crossNormalized = (cross - crossRange.x) / max(crossRange.y - crossRange.x, 0.0001);
	float crossWarp = (0.5 - crossNormalized) * sin(t * PI) * radius * axisSpan * 0.14;
	vec2 sampleUv = fromTurnAxis(sourceAxis, cross + crossWarp, dir, axisSpan);

	if (
		sampleUv.x < 0.0 || sampleUv.x > 1.0 ||
		sampleUv.y < 0.0 || sampleUv.y > 1.0
	) {
		fragColor = vec4(0.0);
		return;
	}

	vec4 color = texture(uSource, sampleUv);
	float crease = 1.0 - smoothstep(0.0, 0.18, t);
	float rim = smoothstep(0.74, 1.0, t);
	float backMix = 1.0 - smoothstep(0.15, 0.92, t);
	float lightAgainstFold = dot(normalize(uLightVector), normalize(dir + perpendicular * 0.35));
	float diffuse = 0.82 + 0.18 * lightAgainstFold;
	float shade = diffuse - uShadow * (0.58 * crease + 0.22 * (1.0 - rim));
	float sheen = pow(max(0.0, 1.0 - abs(t - 0.38) / 0.12), 2.0);
	float glossyStreak = pow(max(0.0, 1.0 - abs(crossNormalized - (0.35 + t * 0.22)) / 0.08), 2.0);

	vec3 rgb = color.a > 0.001 ? color.rgb / color.a : vec3(0.0);
	vec3 paperRgb = uPaperColor.rgb;
	vec3 backRgb = mix(paperRgb, rgb, 0.55);
	vec3 shaded = mix(rgb, backRgb, backMix) * shade;
	shaded += vec3(1.0) * sheen * glossyStreak * (0.25 + 0.35 * backMix);
	shaded += paperRgb * crease * 0.18;
	float alpha = color.a * mix(1.0, uBackOpacity, backMix);

	fragColor = vec4(shaded * alpha, alpha);
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
		return `page-turn-${r.progress}-${r.foldPosition.join(':')}-${r.angle}-${r.foldRadius}-${r.lightDirection}-${r.shadow}-${r.backOpacity}-${r.paperColor}`;
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

		const colorCanvas = document.createElement('canvas');
		colorCanvas.width = 1;
		colorCanvas.height = 1;
		const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
		if (!colorCtx) {
			throw new Error('Failed to acquire 2D context for color parsing');
		}

		return {
			gl,
			program,
			vao,
			vbo,
			texture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uProgress: gl.getUniformLocation(program, 'uProgress'),
			uFoldPosition: gl.getUniformLocation(program, 'uFoldPosition'),
			uDirectionVector: gl.getUniformLocation(program, 'uDirectionVector'),
			uLightVector: gl.getUniformLocation(program, 'uLightVector'),
			uFoldRadius: gl.getUniformLocation(program, 'uFoldRadius'),
			uShadow: gl.getUniformLocation(program, 'uShadow'),
			uBackOpacity: gl.getUniformLocation(program, 'uBackOpacity'),
			uPaperColor: gl.getUniformLocation(program, 'uPaperColor'),
			colorCtx,
			cachedPaperColor: '',
			cachedPaperColorRgba: [255, 248, 220, 255],
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, texture, vao} = state;
		if (state.cachedPaperColor !== r.paperColor) {
			state.cachedPaperColor = r.paperColor;
			state.cachedPaperColorRgba = parseColorRgba(state.colorCtx, r.paperColor);
		}

		const [paperR, paperG, paperB, paperA] = state.cachedPaperColorRgba;
		const [foldX, foldY] = publicUvToShaderUv(r.foldPosition);

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
		if (state.uFoldPosition) gl.uniform2f(state.uFoldPosition, foldX, foldY);
		if (state.uDirectionVector) {
			const radians = (r.angle * Math.PI) / 180;
			gl.uniform2f(
				state.uDirectionVector,
				Math.cos(radians),
				-Math.sin(radians),
			);
		}

		if (state.uLightVector) {
			const radians = (r.lightDirection * Math.PI) / 180;
			gl.uniform2f(state.uLightVector, Math.cos(radians), -Math.sin(radians));
		}

		if (state.uFoldRadius) gl.uniform1f(state.uFoldRadius, r.foldRadius);
		if (state.uShadow) gl.uniform1f(state.uShadow, r.shadow);
		if (state.uBackOpacity) gl.uniform1f(state.uBackOpacity, r.backOpacity);
		if (state.uPaperColor)
			gl.uniform4f(
				state.uPaperColor,
				paperR / 255,
				paperG / 255,
				paperB / 255,
				paperA / 255,
			);

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
