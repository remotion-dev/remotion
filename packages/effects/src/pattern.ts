import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_SCALE = 0.1 as const;
const DEFAULT_CROP = 0 as const;
const DEFAULT_GAP = 0 as const;
const DEFAULT_OFFSET = 0 as const;
const DEFAULT_OFFSET_EVERY = 0 as const;
const DEFAULT_ORIGIN = [0, 0] as const;
const DEFAULT_WRAP = true as const;

const patternSchema = {
	scale: {
		type: 'number',
		min: 0.001,
		max: 2,
		step: 0.01,
		default: DEFAULT_SCALE,
		description: 'Scale',
		hiddenFromList: false,
	},
	cropLeft: {
		type: 'number',
		step: 1,
		default: DEFAULT_CROP,
		description: 'Crop left',
		hiddenFromList: false,
	},
	cropTop: {
		type: 'number',
		step: 1,
		default: DEFAULT_CROP,
		description: 'Crop top',
		hiddenFromList: false,
	},
	cropRight: {
		type: 'number',
		step: 1,
		default: DEFAULT_CROP,
		description: 'Crop right',
		hiddenFromList: false,
	},
	cropBottom: {
		type: 'number',
		step: 1,
		default: DEFAULT_CROP,
		description: 'Crop bottom',
		hiddenFromList: false,
	},
	gapX: {
		type: 'number',
		step: 1,
		default: DEFAULT_GAP,
		description: 'Gap X',
		hiddenFromList: false,
	},
	gapY: {
		type: 'number',
		step: 1,
		default: DEFAULT_GAP,
		description: 'Gap Y',
		hiddenFromList: false,
	},
	offsetU: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_OFFSET,
		description: 'Offset U',
		hiddenFromList: false,
	},
	offsetV: {
		type: 'number',
		step: 0.01,
		default: DEFAULT_OFFSET,
		description: 'Offset V',
		hiddenFromList: false,
	},
	rowOffset: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET,
		description: 'Row offset',
		hiddenFromList: false,
	},
	rowOffsetEvery: {
		type: 'number',
		min: 0,
		step: 1,
		default: DEFAULT_OFFSET_EVERY,
		description: 'Row offset every',
		hiddenFromList: false,
	},
	columnOffset: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET,
		description: 'Column offset',
		hiddenFromList: false,
	},
	columnOffsetEvery: {
		type: 'number',
		min: 0,
		step: 1,
		default: DEFAULT_OFFSET_EVERY,
		description: 'Column offset every',
		hiddenFromList: false,
	},
	origin: {
		type: 'uv-coordinate',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_ORIGIN,
		description: 'Origin',
	},
	wrap: {
		type: 'boolean',
		default: DEFAULT_WRAP,
		description: 'Wrap',
	},
} as const satisfies InteractivitySchema;

export type PatternOrigin = readonly [number, number];

export type PatternParams = {
	/** Scale of each repeated tile. Defaults to `0.1`. */
	readonly scale?: number;
	/** Crops the source before it is scaled into the repeated tile. */
	readonly cropLeft?: number;
	readonly cropTop?: number;
	readonly cropRight?: number;
	readonly cropBottom?: number;
	/** Horizontal space between tiles in pixels. Defaults to `0`. */
	readonly gapX?: number;
	/** Vertical space between tiles in pixels. Defaults to `0`. */
	readonly gapY?: number;
	/** Horizontal pattern offset in UV coordinates. Defaults to `0`. */
	readonly offsetU?: number;
	/** Vertical pattern offset in UV coordinates. Defaults to `0`. */
	readonly offsetV?: number;
	/** Horizontal offset added per row in pixels. Defaults to `0`. */
	readonly rowOffset?: number;
	/** Number of rows after which `rowOffset` repeats. Defaults to `0`, meaning it never repeats. */
	readonly rowOffsetEvery?: number;
	/** Vertical offset added per column in pixels. Defaults to `0`. */
	readonly columnOffset?: number;
	/** Number of columns after which `columnOffset` repeats. Defaults to `0`, meaning it never repeats. */
	readonly columnOffsetEvery?: number;
	/** Pattern origin in UV coordinates. Defaults to `[0, 0]`. */
	readonly origin?: PatternOrigin;
	/** Whether tiles before the origin are rendered. Defaults to `true`. */
	readonly wrap?: boolean;
};

type PatternResolved = {
	scale: number;
	cropLeft: number;
	cropTop: number;
	cropRight: number;
	cropBottom: number;
	gapX: number;
	gapY: number;
	offsetU: number;
	offsetV: number;
	rowOffset: number;
	rowOffsetEvery: number;
	columnOffset: number;
	columnOffsetEvery: number;
	origin: PatternOrigin;
	wrap: boolean;
};

type PatternState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uScale: WebGLUniformLocation | null;
		readonly uCrop: WebGLUniformLocation | null;
		readonly uGap: WebGLUniformLocation | null;
		readonly uOffset: WebGLUniformLocation | null;
		readonly uRowOffset: WebGLUniformLocation | null;
		readonly uColumnOffset: WebGLUniformLocation | null;
		readonly uOrigin: WebGLUniformLocation | null;
		readonly uWrap: WebGLUniformLocation | null;
	};
};

const resolve = (p: PatternParams): PatternResolved => ({
	scale: p.scale ?? DEFAULT_SCALE,
	cropLeft: p.cropLeft ?? DEFAULT_CROP,
	cropTop: p.cropTop ?? DEFAULT_CROP,
	cropRight: p.cropRight ?? DEFAULT_CROP,
	cropBottom: p.cropBottom ?? DEFAULT_CROP,
	gapX: p.gapX ?? DEFAULT_GAP,
	gapY: p.gapY ?? DEFAULT_GAP,
	offsetU: p.offsetU ?? DEFAULT_OFFSET,
	offsetV: p.offsetV ?? DEFAULT_OFFSET,
	rowOffset: p.rowOffset ?? DEFAULT_OFFSET,
	rowOffsetEvery: p.rowOffsetEvery ?? DEFAULT_OFFSET_EVERY,
	columnOffset: p.columnOffset ?? DEFAULT_OFFSET,
	columnOffsetEvery: p.columnOffsetEvery ?? DEFAULT_OFFSET_EVERY,
	origin: [...(p.origin ?? DEFAULT_ORIGIN)] as PatternOrigin,
	wrap: p.wrap ?? DEFAULT_WRAP,
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

const assertOptionalInteger = (value: unknown, name: string): void => {
	if (value === undefined) {
		return;
	}

	if (!Number.isInteger(value)) {
		throw new TypeError(
			`"${name}" must be an integer, but got ${JSON.stringify(value)}`,
		);
	}
};

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(`"${name}" must be > 0`);
	}
};

const validateAtLeast = (value: number, min: number, name: string): void => {
	if (value < min) {
		throw new TypeError(
			`"${name}" must be >= ${min}, but got ${JSON.stringify(value)}`,
		);
	}
};

const validatePatternParams = (params: PatternParams): void => {
	assertEffectParamsObject(params, 'Pattern');
	assertOptionalFiniteNumber(params.scale, 'scale');
	assertOptionalFiniteNumber(params.cropLeft, 'cropLeft');
	assertOptionalFiniteNumber(params.cropTop, 'cropTop');
	assertOptionalFiniteNumber(params.cropRight, 'cropRight');
	assertOptionalFiniteNumber(params.cropBottom, 'cropBottom');
	assertOptionalFiniteNumber(params.gapX, 'gapX');
	assertOptionalFiniteNumber(params.gapY, 'gapY');
	assertOptionalFiniteNumber(params.offsetU, 'offsetU');
	assertOptionalFiniteNumber(params.offsetV, 'offsetV');
	assertOptionalFiniteNumber(params.rowOffset, 'rowOffset');
	assertOptionalFiniteNumber(params.rowOffsetEvery, 'rowOffsetEvery');
	assertOptionalFiniteNumber(params.columnOffset, 'columnOffset');
	assertOptionalFiniteNumber(params.columnOffsetEvery, 'columnOffsetEvery');
	assertOptionalUvCoordinate(params.origin, 'origin');
	assertOptionalBoolean(params.wrap, 'wrap');
	assertOptionalInteger(params.rowOffsetEvery, 'rowOffsetEvery');
	assertOptionalInteger(params.columnOffsetEvery, 'columnOffsetEvery');

	const r = resolve(params);
	validatePositive(r.scale, 'scale');
	validateAtLeast(r.rowOffsetEvery, 0, 'rowOffsetEvery');
	validateAtLeast(r.columnOffsetEvery, 0, 'columnOffsetEvery');
	validateUnitInterval(r.origin[0], 'origin[0]');
	validateUnitInterval(r.origin[1], 'origin[1]');
};

const PATTERN_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const PATTERN_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uScale;
uniform vec4 uCrop;
uniform vec2 uGap;
uniform vec2 uOffset;
uniform vec2 uRowOffset;
uniform vec2 uColumnOffset;
uniform vec2 uOrigin;
uniform bool uWrap;

float positiveModulo(float value, float modulo) {
	return mod(mod(value, modulo) + modulo, modulo);
}

float getPhase(float index, float every) {
	if (every == 0.0) {
		return index;
	}

	return positiveModulo(index, every);
}

bool sampleCell(vec2 cell, vec2 fragPx, vec2 cropStart, vec2 tileSize, vec2 pitch, vec2 originPx, out vec4 color) {
	if (!uWrap && (cell.x < 0.0 || cell.y < 0.0)) {
		return false;
	}

	float rowPhase = getPhase(cell.y, uRowOffset.y);
	float columnPhase = getPhase(cell.x, uColumnOffset.y);
	vec2 stagger = vec2(rowPhase * uRowOffset.x, columnPhase * uColumnOffset.x);
	vec2 localPx = fragPx - originPx - stagger - cell * pitch;

	if (localPx.x < 0.0 || localPx.y < 0.0 || localPx.x >= tileSize.x || localPx.y >= tileSize.y) {
		return false;
	}

	vec2 sourcePx = cropStart + localPx / uScale;
	vec2 sourceUv = vec2(sourcePx.x / uResolution.x, 1.0 - sourcePx.y / uResolution.y);

	if (sourceUv.x < 0.0 || sourceUv.y < 0.0 || sourceUv.x > 1.0 || sourceUv.y > 1.0) {
		return false;
	}

	color = texture(uSource, sourceUv);
	return true;
}

void main() {
	vec2 cropStart = uCrop.xy;
	vec2 cropEnd = uResolution - uCrop.zw;
	vec2 cropSize = max(cropEnd - cropStart, vec2(0.001));
	vec2 tileSize = max(cropSize * uScale, vec2(0.001));
	vec2 pitch = max(tileSize + uGap, vec2(0.001));
	vec2 patternUv = vec2(vUv.x, 1.0 - vUv.y);
	vec2 originPx = (uOrigin + uOffset) * uResolution;
	vec2 fragPx = patternUv * uResolution;

	vec2 gridPx = fragPx - originPx;
	vec2 cell = floor(gridPx / pitch);

	for (int i = 0; i < 4; i++) {
		float rowPhase = getPhase(cell.y, uRowOffset.y);
		float columnPhase = getPhase(cell.x, uColumnOffset.y);
		vec2 stagger = vec2(rowPhase * uRowOffset.x, columnPhase * uColumnOffset.x);
		vec2 adjustedGridPx = fragPx - originPx - stagger;
		vec2 nextCell = floor(adjustedGridPx / pitch);

		if (all(equal(nextCell, cell))) {
			break;
		}

		cell = nextCell;
	}

	vec4 color = vec4(0.0);
	for (int y = -4; y <= 4; y++) {
		for (int x = -4; x <= 4; x++) {
			if (sampleCell(cell + vec2(float(x), float(y)), fragPx, cropStart, tileSize, pitch, originPx, color)) {
				fragColor = color;
				return;
			}
		}
	}

	fragColor = vec4(0.0);
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
		throw new Error(`Pattern shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Pattern program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const pattern = createEffect<PatternParams, PatternState>({
	type: 'dev.remotion.effects.pattern',
	label: 'pattern()',
	documentationLink: 'https://www.remotion.dev/docs/effects/pattern',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `pattern-${r.scale}-${r.cropLeft}-${r.cropTop}-${r.cropRight}-${r.cropBottom}-${r.gapX}-${r.gapY}-${r.offsetU}-${r.offsetV}-${r.rowOffset}-${r.rowOffsetEvery}-${r.columnOffset}-${r.columnOffsetEvery}-${r.origin[0]}-${r.origin[1]}-${r.wrap ? 1 : 0}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('pattern effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, PATTERN_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, PATTERN_FS);
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
			uniforms: {
				uSource: gl.getUniformLocation(program, 'uSource'),
				uResolution: gl.getUniformLocation(program, 'uResolution'),
				uScale: gl.getUniformLocation(program, 'uScale'),
				uCrop: gl.getUniformLocation(program, 'uCrop'),
				uGap: gl.getUniformLocation(program, 'uGap'),
				uOffset: gl.getUniformLocation(program, 'uOffset'),
				uRowOffset: gl.getUniformLocation(program, 'uRowOffset'),
				uColumnOffset: gl.getUniformLocation(program, 'uColumnOffset'),
				uOrigin: gl.getUniformLocation(program, 'uOrigin'),
				uWrap: gl.getUniformLocation(program, 'uWrap'),
			},
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture, uniforms} = state;

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

		if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
		if (uniforms.uResolution) gl.uniform2f(uniforms.uResolution, width, height);
		if (uniforms.uScale) gl.uniform1f(uniforms.uScale, r.scale);
		if (uniforms.uCrop)
			gl.uniform4f(
				uniforms.uCrop,
				r.cropLeft,
				r.cropTop,
				r.cropRight,
				r.cropBottom,
			);
		if (uniforms.uGap) gl.uniform2f(uniforms.uGap, r.gapX, r.gapY);
		if (uniforms.uOffset) gl.uniform2f(uniforms.uOffset, r.offsetU, r.offsetV);
		if (uniforms.uRowOffset)
			gl.uniform2f(uniforms.uRowOffset, r.rowOffset, r.rowOffsetEvery);
		if (uniforms.uColumnOffset)
			gl.uniform2f(uniforms.uColumnOffset, r.columnOffset, r.columnOffsetEvery);
		if (uniforms.uOrigin)
			gl.uniform2f(uniforms.uOrigin, r.origin[0], r.origin[1]);
		if (uniforms.uWrap) gl.uniform1i(uniforms.uWrap, r.wrap ? 1 : 0);

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
	schema: patternSchema,
	validateParams: validatePatternParams,
});
