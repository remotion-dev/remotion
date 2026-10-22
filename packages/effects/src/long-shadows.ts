import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_LENGTH = 240 as const;
const DEFAULT_ANGLE = 45 as const;
const DEFAULT_COLOR = '#777777' as const;
const DEFAULT_OPACITY = 1 as const;

const longShadowsSchema = {
	length: {
		type: 'number',
		min: 0,
		max: 1000,
		step: 1,
		default: DEFAULT_LENGTH,
		description: 'Length',
		hiddenFromList: false,
	},
	angle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_ANGLE,
		description: 'Angle',
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
	opacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_OPACITY,
		description: 'Opacity',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type LongShadowsParams = {
	/** Length of the shadow in pixels. Defaults to `240`. */
	readonly length?: number;
	/** Clockwise angle in degrees, with `0` pointing right. Defaults to `45`. */
	readonly angle?: number;
	/** CSS color of the shadow. Defaults to `'#777777'`. */
	readonly color?: string;
	/** Shadow opacity from `0` to `1`. Defaults to `1`. */
	readonly opacity?: number;
};

const resolve = (params: LongShadowsParams) => ({
	length: params.length ?? DEFAULT_LENGTH,
	angle: params.angle ?? DEFAULT_ANGLE,
	color: params.color ?? DEFAULT_COLOR,
	opacity: params.opacity ?? DEFAULT_OPACITY,
});

const validateLongShadowsParams = (params: LongShadowsParams): void => {
	assertEffectParamsObject(params, 'Long shadows');
	assertOptionalFiniteNumber(params.length, 'length');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.opacity, 'opacity');
	assertOptionalColor(params.color, 'color');
	const resolved = resolve(params);
	validateNonNegative(resolved.length, 'length');
	validateUnitInterval(resolved.opacity, 'opacity');
};

type LongShadowsState = {
	readonly gl: WebGL2RenderingContext;
	readonly extendProgram: WebGLProgram;
	readonly compositeProgram: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly shadowTextures: readonly [WebGLTexture, WebGLTexture];
	readonly framebuffer: WebGLFramebuffer;
	readonly extendSource: WebGLUniformLocation | null;
	readonly extendOffset: WebGLUniformLocation | null;
	readonly compositeSource: WebGLUniformLocation | null;
	readonly compositeShadow: WebGLUniformLocation | null;
	readonly compositeColor: WebGLUniformLocation | null;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedRgba: ParsedColorRgba;
	width: number;
	height: number;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const EXTEND_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uOffset;

float alphaAt(ivec2 pixel) {
	ivec2 size = textureSize(uSource, 0);
	if (any(lessThan(pixel, ivec2(0))) || any(greaterThanEqual(pixel, size))) {
		return 0.0;
	}
	return texelFetch(uSource, pixel, 0).a;
}

void main() {
	// Interpolate with transparent pixels outside the canvas instead of
	// clamping the border, which would stretch edge pixels into the shadow.
	vec2 pixel = (vUv - uOffset) * vec2(textureSize(uSource, 0)) - 0.5;
	ivec2 base = ivec2(floor(pixel));
	vec2 fraction = fract(pixel);
	float shifted = mix(
		mix(alphaAt(base), alphaAt(base + ivec2(1, 0)), fraction.x),
		mix(alphaAt(base + ivec2(0, 1)), alphaAt(base + ivec2(1, 1)), fraction.x),
		fraction.y
	);
	fragColor = vec4(0.0, 0.0, 0.0, max(texture(uSource, vUv).a, shifted));
}
`;

const COMPOSITE_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform sampler2D uShadow;
uniform vec4 uColor;

void main() {
	vec4 source = texture(uSource, vUv);
	float alpha = texture(uShadow, vUv).a * uColor.a;
	fragColor = source + vec4(uColor.rgb * alpha, alpha) * (1.0 - source.a);
}
`;

const createProgram = (
	gl: WebGL2RenderingContext,
	fragmentSource: string,
): WebGLProgram => {
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create long shadows program');
	}

	for (const [type, source] of [
		[gl.VERTEX_SHADER, VERTEX_SHADER],
		[gl.FRAGMENT_SHADER, fragmentSource],
	] as const) {
		const shader = gl.createShader(type);
		if (!shader) {
			gl.deleteProgram(program);
			throw new Error('Failed to create long shadows shader');
		}

		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const log = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			gl.deleteProgram(program);
			throw new Error(
				`Long shadows shader compile failed: ${log ?? '(no log)'}`,
			);
		}

		gl.attachShader(program, shader);
		gl.deleteShader(shader);
	}

	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Long shadows program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const longShadows = createEffect<LongShadowsParams, LongShadowsState>({
	type: 'remotion/long-shadows',
	label: 'longShadows()',
	documentationLink: 'https://www.remotion.dev/docs/effects/long-shadows',
	backend: 'webgl2',
	calculateKey: (params) => {
		const {length, angle, color, opacity} = resolve(params);
		return `long-shadows-${length}-${angle}-${color}-${opacity}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('long shadows effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		const extendProgram = createProgram(gl, EXTEND_SHADER);
		const compositeProgram = createProgram(gl, COMPOSITE_SHADER);
		const vao = gl.createVertexArray();
		const vbo = gl.createBuffer();
		const framebuffer = gl.createFramebuffer();
		if (!vao || !vbo || !framebuffer) {
			throw new Error('Failed to create long shadows buffers');
		}

		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
			gl.STATIC_DRAW,
		);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
		gl.bindVertexArray(null);

		const textures = [0, 1, 2].map(() => {
			const texture = gl.createTexture();
			if (!texture) {
				throw new Error('Failed to create long shadows texture');
			}

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			return texture;
		});
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
			extendProgram,
			compositeProgram,
			vao,
			vbo,
			framebuffer,
			sourceTexture: textures[0],
			shadowTextures: [textures[1], textures[2]],
			extendSource: gl.getUniformLocation(extendProgram, 'uSource'),
			extendOffset: gl.getUniformLocation(extendProgram, 'uOffset'),
			compositeSource: gl.getUniformLocation(compositeProgram, 'uSource'),
			compositeShadow: gl.getUniformLocation(compositeProgram, 'uShadow'),
			compositeColor: gl.getUniformLocation(compositeProgram, 'uColor'),
			colorCtx,
			cachedColor: '',
			cachedRgba: [0, 0, 0, 0],
			width: 0,
			height: 0,
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const {length, angle, color, opacity} = resolve(params);
		const {gl, sourceTexture, shadowTextures, framebuffer} = state;
		if (state.cachedColor !== color) {
			state.cachedRgba = parseColorRgba(state.colorCtx, color);
			state.cachedColor = color;
		}

		gl.viewport(0, 0, width, height);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		if (state.width !== width || state.height !== height) {
			for (const texture of shadowTextures) {
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					width,
					height,
					0,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					null,
				);
			}

			state.width = width;
			state.height = height;
		}

		gl.bindVertexArray(state.vao);
		gl.useProgram(state.extendProgram);
		gl.uniform1i(state.extendSource, 0);

		// No in-canvas source can cast farther than the canvas diagonal.
		const distance =
			opacity === 0 || state.cachedRgba[3] === 0
				? 0
				: Math.min(length, Math.hypot(width, height));
		const steps = Math.ceil(distance);
		const radians = ((angle % 360) * Math.PI) / 180;
		const stepLength = steps === 0 ? 0 : distance / steps;
		let shadow = sourceTexture;
		let covered = 0;
		let pass = 0;

		// Each pass extends the existing interval by up to its own size.
		// This covers every step with logarithmic passes, even for long shadows.
		while (covered < steps) {
			const extension = Math.min(covered + 1, steps - covered);
			const output = shadowTextures[pass % 2];
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D,
				output,
				0,
			);
			if (
				gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
			) {
				throw new Error('Long shadows framebuffer incomplete');
			}

			gl.bindTexture(gl.TEXTURE_2D, shadow);
			gl.uniform2f(
				state.extendOffset,
				(Math.cos(radians) * extension * stepLength) / width,
				(-Math.sin(radians) * extension * stepLength) / height,
			);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			shadow = output;
			covered += extension;
			pass++;
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.useProgram(state.compositeProgram);
		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, shadow);
		gl.uniform1i(state.compositeSource, 0);
		gl.uniform1i(state.compositeShadow, 1);
		const [r, g, b, a] = state.cachedRgba;
		gl.uniform4f(
			state.compositeColor,
			r / 255,
			g / 255,
			b / 255,
			length === 0 ? 0 : (a / 255) * opacity,
		);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({
		gl,
		extendProgram,
		compositeProgram,
		vao,
		vbo,
		framebuffer,
		sourceTexture,
		shadowTextures,
	}) => {
		gl.deleteProgram(extendProgram);
		gl.deleteProgram(compositeProgram);
		gl.deleteVertexArray(vao);
		gl.deleteBuffer(vbo);
		gl.deleteFramebuffer(framebuffer);
		gl.deleteTexture(sourceTexture);
		for (const texture of shadowTextures) {
			gl.deleteTexture(texture);
		}
	},
	schema: longShadowsSchema,
	validateParams: validateLongShadowsParams,
});
