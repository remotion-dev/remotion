import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_AMOUNT = 0.7 as const;
const DEFAULT_SIZE = 26 as const;
const DEFAULT_LINE_WIDTH = 7 as const;
const DEFAULT_DEPTH = 0.75 as const;
const DEFAULT_ANGLE = 0 as const;
const DEFAULT_LIGHT_ANGLE = 135 as const;
const DEFAULT_OFFSET = 0 as const;

export const embossSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
	size: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: DEFAULT_SIZE,
		description: 'Size',
		hiddenFromList: false,
	},
	lineWidth: {
		type: 'number',
		min: 0.1,
		max: 100,
		step: 0.1,
		default: DEFAULT_LINE_WIDTH,
		description: 'Line width',
		hiddenFromList: false,
	},
	depth: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_DEPTH,
		description: 'Depth',
		hiddenFromList: false,
	},
	angle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ANGLE,
		description: 'Angle',
	},
	lightAngle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_LIGHT_ANGLE,
		description: 'Light angle',
	},
	offset: {
		type: 'number',
		step: 0.1,
		default: DEFAULT_OFFSET,
		description: 'Offset',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type EmbossParams = {
	/** Strength of the relief shading from `0` to `1`. Defaults to `0.7`. */
	readonly amount?: number;
	/** Size of the repeated relief cells in pixels. Defaults to `26`. */
	readonly size?: number;
	/** Width of each raised dash in pixels. Defaults to `7`. */
	readonly lineWidth?: number;
	/** Height of the virtual relief from `0` to `1`. Defaults to `0.75`. */
	readonly depth?: number;
	/** Rotates the repeated relief pattern in degrees. Defaults to `0`. */
	readonly angle?: number;
	/** Direction of the virtual light in degrees. Defaults to `135`. */
	readonly lightAngle?: number;
	/** Offset in pixels. Animate this value to scroll the relief pattern. Defaults to `0`. */
	readonly offset?: number;
};

type EmbossResolved = {
	amount: number;
	size: number;
	lineWidth: number;
	depth: number;
	angle: number;
	lightAngle: number;
	offset: number;
};

type EmbossState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uAmount: WebGLUniformLocation | null;
		readonly uSize: WebGLUniformLocation | null;
		readonly uLineWidth: WebGLUniformLocation | null;
		readonly uDepth: WebGLUniformLocation | null;
		readonly uAngle: WebGLUniformLocation | null;
		readonly uLightAngle: WebGLUniformLocation | null;
		readonly uOffset: WebGLUniformLocation | null;
	};
};

const resolve = (p: EmbossParams): EmbossResolved => ({
	amount: p.amount ?? DEFAULT_AMOUNT,
	size: p.size ?? DEFAULT_SIZE,
	lineWidth: p.lineWidth ?? DEFAULT_LINE_WIDTH,
	depth: p.depth ?? DEFAULT_DEPTH,
	angle: p.angle ?? DEFAULT_ANGLE,
	lightAngle: p.lightAngle ?? DEFAULT_LIGHT_ANGLE,
	offset: p.offset ?? DEFAULT_OFFSET,
});

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateEmbossParams = (params: EmbossParams): void => {
	assertEffectParamsObject(params, 'Emboss');
	assertOptionalFiniteNumber(params.amount, 'amount');
	assertOptionalFiniteNumber(params.size, 'size');
	assertOptionalFiniteNumber(params.lineWidth, 'lineWidth');
	assertOptionalFiniteNumber(params.depth, 'depth');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.lightAngle, 'lightAngle');
	assertOptionalFiniteNumber(params.offset, 'offset');

	const r = resolve(params);
	validateUnitInterval(r.amount, 'amount');
	validatePositive(r.size, 'size');
	validatePositive(r.lineWidth, 'lineWidth');
	validateUnitInterval(r.depth, 'depth');
};

const EMBOSS_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const EMBOSS_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uAmount;
uniform float uSize;
uniform float uLineWidth;
uniform float uDepth;
uniform float uAngle;
uniform float uLightAngle;
uniform float uOffset;

mat2 rotation(float angle) {
	float c = cos(angle);
	float s = sin(angle);
	return mat2(c, -s, s, c);
}

float roundedBoxSdf(vec2 p, vec2 halfSize, float radius) {
	vec2 q = abs(p) - halfSize + vec2(radius);
	return length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

float reliefHeight(vec2 fragPos) {
	float size = max(uSize, 0.001);
	float lineWidth = clamp(uLineWidth, 0.001, size * 0.85);
	vec2 pos = rotation(uAngle) * (fragPos - uResolution * 0.5);
	pos.x += uOffset;

	vec2 cell = floor(pos / size);
	vec2 local = (fract(pos / size) - 0.5) * size;
	float alternate = mod(cell.x + cell.y, 2.0);
	float dashAngle = mix(0.78539816339, -0.78539816339, step(0.5, alternate));
	vec2 dash = rotation(dashAngle) * local;

	float sdf = roundedBoxSdf(
		dash,
		vec2(size * 0.36, lineWidth * 0.5),
		lineWidth * 0.5
	);

	return 1.0 - smoothstep(-1.0, 1.0, sdf);
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	if (uAmount <= 0.0 || uDepth <= 0.0) {
		fragColor = texColor;
		return;
	}

	vec2 fragPos = vUv * uResolution;
	float h = reliefHeight(fragPos);
	float hLeft = reliefHeight(fragPos - vec2(1.0, 0.0));
	float hRight = reliefHeight(fragPos + vec2(1.0, 0.0));
	float hDown = reliefHeight(fragPos - vec2(0.0, 1.0));
	float hUp = reliefHeight(fragPos + vec2(0.0, 1.0));

	vec3 normal = normalize(vec3(
		(hLeft - hRight) * uDepth * 3.8,
		(hDown - hUp) * uDepth * 3.8,
		1.0
	));
	vec3 light = normalize(vec3(cos(uLightAngle), sin(uLightAngle), 0.7));
	float lit = dot(normal, light);

	float bevel = (lit - 0.64) * 0.72 * uDepth;
	float plateau = (h - 0.5) * 0.08 * uDepth;
	float edge = min(
		abs(hRight - hLeft) + abs(hUp - hDown),
		1.0
	);

	vec3 rgb = texColor.rgb / alpha;
	vec3 shaded = clamp(rgb + bevel + plateau - edge * 0.035 * uDepth, 0.0, 1.0);
	rgb = mix(rgb, shaded, uAmount);

	fragColor = vec4(rgb * alpha, alpha);
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
		throw new Error(`Emboss shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Emboss program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupEmboss = (target: HTMLCanvasElement): EmbossState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('emboss effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, EMBOSS_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, EMBOSS_FS);
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
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uAmount: gl.getUniformLocation(program, 'uAmount'),
			uSize: gl.getUniformLocation(program, 'uSize'),
			uLineWidth: gl.getUniformLocation(program, 'uLineWidth'),
			uDepth: gl.getUniformLocation(program, 'uDepth'),
			uAngle: gl.getUniformLocation(program, 'uAngle'),
			uLightAngle: gl.getUniformLocation(program, 'uLightAngle'),
			uOffset: gl.getUniformLocation(program, 'uOffset'),
		},
	};
};

const degreesToRadians = (degrees: number): number => {
	return (degrees * Math.PI) / 180;
};

export const emboss = createEffect<EmbossParams, EmbossState>({
	type: 'dev.remotion.effects.emboss',
	label: 'emboss()',
	documentationLink: 'https://www.remotion.dev/docs/effects/emboss',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `emboss-${r.amount}-${r.size}-${r.lineWidth}-${r.depth}-${r.angle}-${r.lightAngle}-${r.offset}`;
	},
	setup: (target) => setupEmboss(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture, uniforms} = state;

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

		if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
		if (uniforms.uResolution) gl.uniform2f(uniforms.uResolution, width, height);
		if (uniforms.uAmount) gl.uniform1f(uniforms.uAmount, r.amount);
		if (uniforms.uSize) gl.uniform1f(uniforms.uSize, r.size);
		if (uniforms.uLineWidth) gl.uniform1f(uniforms.uLineWidth, r.lineWidth);
		if (uniforms.uDepth) gl.uniform1f(uniforms.uDepth, r.depth);
		if (uniforms.uAngle) {
			gl.uniform1f(uniforms.uAngle, degreesToRadians(r.angle));
		}

		if (uniforms.uLightAngle) {
			gl.uniform1f(uniforms.uLightAngle, degreesToRadians(r.lightAngle));
		}

		if (uniforms.uOffset) gl.uniform1f(uniforms.uOffset, r.offset);

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
	schema: embossSchema,
	validateParams: validateEmbossParams,
});
