import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateNonNegative,
	validateUnitInterval,
} from './color-utils.js';
import {polygonizeAlpha} from './outline/polygonize-alpha.js';
import {
	assertOptionalBoolean,
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_WIDTH = 8 as const;
const DEFAULT_EDGE_SIMPLIFICATION = 0 as const;
const DEFAULT_COLOR = '#ffffff' as const;
const DEFAULT_OPACITY = 1 as const;
const DEFAULT_OUTLINE_ONLY = false as const;

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
	edgeSimplification: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_EDGE_SIMPLIFICATION,
		description: 'Edge simplification',
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
	outlineOnly: {
		type: 'boolean',
		default: DEFAULT_OUTLINE_ONLY,
		description: 'Outline only',
	},
} as const satisfies InteractivitySchema;

export type OutlineParams = {
	/** Width of the outline in pixels. Defaults to `8`. */
	readonly width?: number;
	/** Pixel tolerance used to simplify the alpha contour into straight edges. Defaults to `0`. */
	readonly edgeSimplification?: number;
	/** Color of the outline. Defaults to white. */
	readonly color?: string;
	/** Opacity of the outline from `0` to `1`. Defaults to `1`. */
	readonly opacity?: number;
	/** Whether to replace the source with a filled outline mask. Defaults to `false`. */
	readonly outlineOnly?: boolean;
};

type OutlineResolved = {
	readonly width: number;
	readonly edgeSimplification: number;
	readonly color: string;
	readonly opacity: number;
	readonly outlineOnly: boolean;
};

type OutlineState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly texturePolygonMask: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uPolygonMask: WebGLUniformLocation | null;
		readonly uUsePolygonMask: WebGLUniformLocation | null;
		readonly uTexelSize: WebGLUniformLocation | null;
		readonly uWidth: WebGLUniformLocation | null;
		readonly uColor: WebGLUniformLocation | null;
		readonly uOpacity: WebGLUniformLocation | null;
		readonly uOutlineOnly: WebGLUniformLocation | null;
	};
	readonly alphaCanvas: HTMLCanvasElement;
	readonly alphaCtx: CanvasRenderingContext2D;
	readonly polygonMaskCanvas: HTMLCanvasElement;
	readonly polygonMaskCtx: CanvasRenderingContext2D;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedColorRgba: ParsedColorRgba;
};

const resolve = (params: OutlineParams): OutlineResolved => ({
	width: params.width ?? DEFAULT_WIDTH,
	edgeSimplification: params.edgeSimplification ?? DEFAULT_EDGE_SIMPLIFICATION,
	color: params.color ?? DEFAULT_COLOR,
	opacity: params.opacity ?? DEFAULT_OPACITY,
	outlineOnly: params.outlineOnly ?? DEFAULT_OUTLINE_ONLY,
});

const validateOutlineParams = (params: OutlineParams): void => {
	assertEffectParamsObject(params, 'Outline');
	assertOptionalFiniteNumber(params.width, 'width');
	assertOptionalFiniteNumber(params.edgeSimplification, 'edgeSimplification');
	assertOptionalColor(params.color, 'color');
	assertOptionalFiniteNumber(params.opacity, 'opacity');
	assertOptionalBoolean(params.outlineOnly, 'outlineOnly');

	const resolved = resolve(params);
	validateNonNegative(resolved.width, 'width');
	validateNonNegative(resolved.edgeSimplification, 'edgeSimplification');
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
uniform sampler2D uPolygonMask;
uniform bool uUsePolygonMask;
uniform vec2 uTexelSize;
uniform float uWidth;
uniform vec4 uColor;
uniform float uOpacity;
uniform bool uOutlineOnly;

const float TAU = 6.283185307179586;
const int SAMPLE_DIRECTIONS = 32;
const int SAMPLE_RINGS = 3;

void main() {
	vec4 source = texture(uSource, vUv);

	if (uOpacity <= 0.0 || uColor.a <= 0.0) {
		fragColor = uOutlineOnly ? vec4(0.0) : source;
		return;
	}

	if (uWidth <= 0.0 && !uOutlineOnly) {
		fragColor = source;
		return;
	}

	float outlineMaskAlpha = 0.0;
	if (uUsePolygonMask) {
		outlineMaskAlpha = texture(uPolygonMask, vUv).a;
	} else if (uWidth > 0.0) {
		for (int ring = 1; ring <= SAMPLE_RINGS; ring++) {
			float distancePx = uWidth * float(ring) / float(SAMPLE_RINGS);
			for (int direction = 0; direction < SAMPLE_DIRECTIONS; direction++) {
				float angle = TAU * float(direction) / float(SAMPLE_DIRECTIONS);
				vec2 offset = vec2(cos(angle), sin(angle)) * distancePx * uTexelSize;
				outlineMaskAlpha = max(
					outlineMaskAlpha,
					texture(uSource, vUv + offset).a
				);
			}
		}
	}

	if (uOutlineOnly) {
		float filledAlpha = (
			uUsePolygonMask ? outlineMaskAlpha : max(source.a, outlineMaskAlpha)
		) * uColor.a * uOpacity;
		fragColor = vec4(uColor.rgb * filledAlpha, filledAlpha);
		return;
	}

	float outlineAlpha = outlineMaskAlpha * uColor.a * uOpacity * (1.0 - source.a);
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

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
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
	return texture;
};

const updatePolygonMask = ({
	source,
	width,
	height,
	simplification,
	outlineWidth,
	state,
}: {
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly simplification: number;
	readonly outlineWidth: number;
	readonly state: OutlineState;
}): void => {
	if (
		state.alphaCanvas.width !== width ||
		state.alphaCanvas.height !== height ||
		state.polygonMaskCanvas.width !== width ||
		state.polygonMaskCanvas.height !== height
	) {
		state.alphaCanvas.width = width;
		state.alphaCanvas.height = height;
		state.polygonMaskCanvas.width = width;
		state.polygonMaskCanvas.height = height;
	}

	state.alphaCtx.clearRect(0, 0, width, height);
	state.alphaCtx.drawImage(source, 0, 0, width, height);
	const imageData = state.alphaCtx.getImageData(0, 0, width, height);
	const contours = polygonizeAlpha({
		data: imageData.data,
		width,
		height,
		simplification,
	});

	const {polygonMaskCtx: context} = state;
	context.clearRect(0, 0, width, height);
	context.beginPath();
	for (const contour of contours) {
		if (contour.length < 3) {
			continue;
		}

		context.moveTo(contour[0][0], contour[0][1]);
		for (let index = 1; index < contour.length; index++) {
			context.lineTo(contour[index][0], contour[index][1]);
		}

		context.closePath();
	}

	context.fillStyle = 'white';
	context.fill('evenodd');
	if (outlineWidth > 0) {
		context.strokeStyle = 'white';
		context.lineWidth = outlineWidth * 2;
		context.lineJoin = 'miter';
		context.miterLimit = 4;
		context.stroke();
	}
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

	const textureSource = createTexture(gl);
	const texturePolygonMask = createTexture(gl);
	gl.bindTexture(gl.TEXTURE_2D, texturePolygonMask);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([0, 0, 0, 0]),
	);
	gl.bindTexture(gl.TEXTURE_2D, null);

	const colorCanvas = target.ownerDocument.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx) {
		throw new Error('Failed to acquire 2D context for color parsing');
	}

	const alphaCanvas = target.ownerDocument.createElement('canvas');
	const alphaCtx = alphaCanvas.getContext('2d', {willReadFrequently: true});
	if (!alphaCtx) {
		throw new Error('Failed to acquire 2D context for outline extraction');
	}

	const polygonMaskCanvas = target.ownerDocument.createElement('canvas');
	polygonMaskCanvas.width = 1;
	polygonMaskCanvas.height = 1;
	const polygonMaskCtx = polygonMaskCanvas.getContext('2d');
	if (!polygonMaskCtx) {
		throw new Error('Failed to acquire 2D context for outline mask');
	}

	return {
		gl,
		program,
		vao,
		vbo,
		textureSource,
		texturePolygonMask,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uPolygonMask: gl.getUniformLocation(program, 'uPolygonMask'),
			uUsePolygonMask: gl.getUniformLocation(program, 'uUsePolygonMask'),
			uTexelSize: gl.getUniformLocation(program, 'uTexelSize'),
			uWidth: gl.getUniformLocation(program, 'uWidth'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uOpacity: gl.getUniformLocation(program, 'uOpacity'),
			uOutlineOnly: gl.getUniformLocation(program, 'uOutlineOnly'),
		},
		alphaCanvas,
		alphaCtx,
		polygonMaskCanvas,
		polygonMaskCtx,
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
		return `outline-${resolved.width}-${resolved.edgeSimplification}-${resolved.color}-${resolved.opacity}-${resolved.outlineOnly}`;
	},
	setup: setupOutline,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const resolved = resolve(params);
		if (state.cachedColor !== resolved.color) {
			state.cachedColor = resolved.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, resolved.color);
		}

		const {gl, program, textureSource, texturePolygonMask, uniforms, vao} =
			state;
		const [red, green, blue, alpha] = state.cachedColorRgba;
		const usePolygonMask =
			resolved.edgeSimplification > 0 &&
			resolved.opacity > 0 &&
			alpha > 0 &&
			(resolved.width > 0 || resolved.outlineOnly);
		if (usePolygonMask) {
			updatePolygonMask({
				source,
				width,
				height,
				simplification: resolved.edgeSimplification,
				outlineWidth: resolved.width,
				state,
			});
		}

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
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texturePolygonMask);
		if (usePolygonMask) {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				state.polygonMaskCanvas,
			);
		}

		gl.useProgram(program);
		if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
		if (uniforms.uPolygonMask) gl.uniform1i(uniforms.uPolygonMask, 1);
		if (uniforms.uUsePolygonMask)
			gl.uniform1i(uniforms.uUsePolygonMask, usePolygonMask ? 1 : 0);
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
		if (uniforms.uOutlineOnly)
			gl.uniform1i(uniforms.uOutlineOnly, resolved.outlineOnly ? 1 : 0);

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, textureSource, texturePolygonMask}) => {
		gl.deleteTexture(textureSource);
		gl.deleteTexture(texturePolygonMask);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: outlineSchema,
	validateParams: validateOutlineParams,
});
