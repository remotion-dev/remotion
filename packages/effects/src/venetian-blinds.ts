import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const VENETIAN_BLINDS_DIRECTIONS = ['vertical', 'horizontal'] as const;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_DIRECTION = 'vertical' as const;
const DEFAULT_SLATS = 12 as const;

export type VenetianBlindsDirection =
	(typeof VENETIAN_BLINDS_DIRECTIONS)[number];

export const venetianBlindsSchema = {
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
			vertical: {},
			horizontal: {},
		},
		default: DEFAULT_DIRECTION,
		description: 'Direction',
	},
	slats: {
		type: 'number',
		min: 1,
		max: 100,
		step: 1,
		default: DEFAULT_SLATS,
		description: 'Slats',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type VenetianBlindsParams = {
	/** Reveal progress from `0` (hidden) to `1` (fully revealed). Defaults to `0.5`. */
	readonly progress?: number;
	/** Slat orientation. Defaults to `vertical`. */
	readonly direction?: VenetianBlindsDirection;
	/** Number of blinds across the source. Defaults to `12`. */
	readonly slats?: number;
};

type VenetianBlindsResolved = {
	readonly progress: number;
	readonly direction: VenetianBlindsDirection;
	readonly slats: number;
};

const formatEnum = (variants: readonly string[]): string => {
	if (variants.length === 2) {
		return `"${variants[0]}" or "${variants[1]}"`;
	}

	return `${variants
		.slice(0, -1)
		.map((variant) => `"${variant}"`)
		.join(', ')} or "${variants[variants.length - 1]}"`;
};

const assertOptionalEnum = <T extends string>(
	value: unknown,
	name: string,
	variants: readonly T[],
): void => {
	if (value === undefined) {
		return;
	}

	if (!variants.includes(value as T)) {
		throw new TypeError(
			`"${name}" must be ${formatEnum(variants)}, but got ${JSON.stringify(value)}`,
		);
	}
};

const resolve = (p: VenetianBlindsParams): VenetianBlindsResolved => ({
	progress: p.progress ?? DEFAULT_PROGRESS,
	direction: p.direction ?? DEFAULT_DIRECTION,
	slats: p.slats ?? DEFAULT_SLATS,
});

const validatePositiveInteger = (value: number, name: string): void => {
	if (!Number.isInteger(value)) {
		throw new TypeError(
			`"${name}" must be an integer, but got ${JSON.stringify(value)}`,
		);
	}

	if (value < 1) {
		throw new TypeError(
			`"${name}" must be >= 1, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateVenetianBlindsParams = (params: VenetianBlindsParams): void => {
	assertEffectParamsObject(params, 'Venetian blinds');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.slats, 'slats');
	assertOptionalEnum(params.direction, 'direction', VENETIAN_BLINDS_DIRECTIONS);

	const r = resolve(params);
	validateUnitInterval(r.progress, 'progress');
	validatePositiveInteger(r.slats, 'slats');
};

type VenetianBlindsState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uProgress: WebGLUniformLocation | null;
		readonly uDirection: WebGLUniformLocation | null;
		readonly uSlats: WebGLUniformLocation | null;
	};
};

const VENETIAN_BLINDS_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const VENETIAN_BLINDS_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uProgress;
uniform int uDirection;
uniform float uSlats;

float maskValue(float distanceToCenter, float progress) {
	float p = clamp(progress, 0.0, 1.0);

	if (p <= 0.000001) {
		return 0.0;
	}

	if (p >= 0.999999) {
		return 1.0;
	}

	return step(distanceToCenter, p);
}

void main() {
	vec4 source = texture(uSource, vUv);
	float axis = uDirection == 0 ? vUv.x : vUv.y;
	float local = fract(axis * max(uSlats, 1.0));
	float distanceToCenter = abs(local - 0.5) * 2.0;
	float mask = maskValue(distanceToCenter, uProgress);

	fragColor = vec4(source.rgb * mask, source.a * mask);
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
			`Venetian blinds shader compile failed: ${log ?? '(no log)'}`,
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
			`Venetian blinds program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

const setupVenetianBlinds = (
	target: HTMLCanvasElement,
): VenetianBlindsState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});

	if (!gl) {
		throw createWebGL2ContextError('venetian blinds effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, VENETIAN_BLINDS_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, VENETIAN_BLINDS_FS);
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
			uProgress: gl.getUniformLocation(program, 'uProgress'),
			uDirection: gl.getUniformLocation(program, 'uDirection'),
			uSlats: gl.getUniformLocation(program, 'uSlats'),
		},
	};
};

const directionToInt = (direction: VenetianBlindsDirection): number => {
	switch (direction) {
		case 'vertical':
			return 0;
		case 'horizontal':
			return 1;
		default: {
			const exhaustiveCheck: never = direction;
			return exhaustiveCheck;
		}
	}
};

export const venetianBlinds = createEffect<
	VenetianBlindsParams,
	VenetianBlindsState
>({
	type: 'dev.remotion.effects.venetianBlinds',
	label: 'venetianBlinds()',
	documentationLink: 'https://www.remotion.dev/docs/effects/venetian-blinds',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `venetian-blinds-${r.progress}-${r.direction}-${r.slats}`;
	},
	setup: (target) => setupVenetianBlinds(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, texture, uniforms, vao} = state;

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
		if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
		if (uniforms.uProgress) gl.uniform1f(uniforms.uProgress, r.progress);
		if (uniforms.uDirection)
			gl.uniform1i(uniforms.uDirection, directionToInt(r.direction));
		if (uniforms.uSlats) gl.uniform1f(uniforms.uSlats, r.slats);

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
	schema: venetianBlindsSchema,
	validateParams: validateVenetianBlindsParams,
});
