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

const DEFAULT_WIDTH = 8 as const;
const DEFAULT_COLOR = '#ffffff' as const;
const DEFAULT_OPACITY = 1 as const;

export const outlineSchema = {
	width: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_WIDTH,
		description: 'Width',
		hiddenFromList: false,
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

export type OutlineParams = {
	/** Width of the outline in pixels. Defaults to `8`. */
	readonly width?: number;
	/** Color of the outline. Defaults to white. */
	readonly color?: string;
	/** Opacity of the outline from `0` to `1`. Defaults to `1`. */
	readonly opacity?: number;
};

type OutlineResolved = {
	readonly width: number;
	readonly color: string;
	readonly opacity: number;
};

type OutlineState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uTexelSize: WebGLUniformLocation | null;
		readonly uWidth: WebGLUniformLocation | null;
		readonly uColor: WebGLUniformLocation | null;
		readonly uOpacity: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedColorRgba: ParsedColorRgba;
};

const resolve = (params: OutlineParams): OutlineResolved => ({
	width: params.width ?? DEFAULT_WIDTH,
	color: params.color ?? DEFAULT_COLOR,
	opacity: params.opacity ?? DEFAULT_OPACITY,
});

const validateOutlineParams = (params: OutlineParams): void => {
	assertEffectParamsObject(params, 'Outline');
	assertOptionalFiniteNumber(params.width, 'width');
	assertOptionalColor(params.color, 'color');
	assertOptionalFiniteNumber(params.opacity, 'opacity');

	const resolved = resolve(params);
	validateNonNegative(resolved.width, 'width');
	validateUnitInterval(resolved.opacity, 'opacity');
};

const OUTLINE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const OUTLINE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uWidth;
uniform vec4 uColor;
uniform float uOpacity;

const float TAU = 6.283185307179586;
const int SAMPLE_DIRECTIONS = 32;
const int SAMPLE_RINGS = 3;

void main() {
	vec4 source = texture(uSource, vUv);

	if (uWidth <= 0.0 || uOpacity <= 0.0 || uColor.a <= 0.0) {
		fragColor = source;
		return;
	}

	float neighboringAlpha = 0.0;
	for (int ring = 1; ring <= SAMPLE_RINGS; ring++) {
		float distancePx = uWidth * float(ring) / float(SAMPLE_RINGS);
		for (int direction = 0; direction < SAMPLE_DIRECTIONS; direction++) {
			float angle = TAU * float(direction) / float(SAMPLE_DIRECTIONS);
			vec2 offset = vec2(cos(angle), sin(angle)) * distancePx * uTexelSize;
			neighboringAlpha = max(
				neighboringAlpha,
				texture(uSource, vUv + offset).a
			);
		}
	}

	float outlineAlpha = neighboringAlpha * uColor.a * uOpacity * (1.0 - source.a);
	vec3 outlineRgb = uColor.rgb * outlineAlpha;
	fragColor = vec4(source.rgb + outlineRgb, source.a + outlineAlpha);
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
		throw new Error(`Outline shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, OUTLINE_VS);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, OUTLINE_FS);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Outline program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupOutline = (target: HTMLCanvasElement): OutlineState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('outline effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl);
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

	const textureSource = gl.createTexture();
	if (!textureSource) {
		throw new Error('Failed to create WebGL texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
		textureSource,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uTexelSize: gl.getUniformLocation(program, 'uTexelSize'),
			uWidth: gl.getUniformLocation(program, 'uWidth'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uOpacity: gl.getUniformLocation(program, 'uOpacity'),
		},
		colorCtx,
		cachedColor: '',
		cachedColorRgba: [255, 255, 255, 255],
	};
};

export const outline = createEffect<OutlineParams, OutlineState>({
	type: 'remotion/outline',
	label: 'outline()',
	documentationLink: 'https://www.remotion.dev/docs/effects/outline',
	backend: 'webgl2',
	calculateKey: (params) => {
		const resolved = resolve(params);
		return `outline-${resolved.width}-${resolved.color}-${resolved.opacity}`;
	},
	setup: setupOutline,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);
		if (state.cachedColor !== resolved.color) {
			state.cachedColor = resolved.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, resolved.color);
		}

		const {gl, program, textureSource, uniforms, vao} = state;
		const [red, green, blue, alpha] = state.cachedColorRgba;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textureSource);
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
		if (uniforms.uTexelSize)
			gl.uniform2f(uniforms.uTexelSize, 1 / width, 1 / height);
		if (uniforms.uWidth) gl.uniform1f(uniforms.uWidth, resolved.width);
		if (uniforms.uColor)
			gl.uniform4f(
				uniforms.uColor,
				red / 255,
				green / 255,
				blue / 255,
				alpha / 255,
			);
		if (uniforms.uOpacity) gl.uniform1f(uniforms.uOpacity, resolved.opacity);

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, textureSource}) => {
		gl.deleteTexture(textureSource);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: outlineSchema,
	validateParams: validateOutlineParams,
});
