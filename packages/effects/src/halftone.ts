import type {EffectDescriptor, SequenceSchema} from 'remotion';
import {Internals} from 'remotion';

const {createDescriptor, defineEffect} = Internals;

const SHADE_OUTSIDE_DOT_SCALE = 0.5;

export const halftoneSchema = {
	dotSize: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: 20,
		description: 'Dot size',
	},
	dotSpacing: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: 20,
		description: 'Dot spacing',
	},
	rotation: {
		type: 'number',
		min: -180,
		max: 180,
		step: 1,
		default: 0,
		description: 'Rotation',
	},
	offsetX: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Offset X',
	},
	offsetY: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Offset Y',
	},
} as const satisfies SequenceSchema;

export type HalftoneShape = 'circle' | 'square' | 'line';
export type HalftoneSampling = 'bilinear' | 'nearest';

export type HalftoneParams = {
	readonly shape?: HalftoneShape;
	readonly dotSize?: number;
	/**
	 * Distance between adjacent dot centers on the halftone grid (pitch).
	 * When omitted, matches `dotSize` so dots can touch at full coverage (same as before).
	 */
	readonly dotSpacing?: number;
	readonly rotation?: number;
	readonly offsetX?: number;
	readonly offsetY?: number;
	readonly sampling?: HalftoneSampling;
	/** Dot color. Defaults to black. */
	readonly color?: string;
	/**
	 * When false (default), halftone follows luminance on opaque pixels (classic
	 * halftone on your subject). When true, the same dot pattern fills transparent
	 * and low-alpha areas instead—e.g. the canvas around a cut-out shape—while
	 * leaving the opaque shape mostly free of those dots.
	 */
	readonly shadeOutside?: boolean;
};

type HalftoneResolved = {
	shape: HalftoneShape;
	dotSize: number;
	dotSpacing: number;
	rotation: number;
	offsetX: number;
	offsetY: number;
	sampling: HalftoneSampling;
	color: string;
	shadeOutside: boolean;
};

const resolve = (p: HalftoneParams): HalftoneResolved => ({
	shape: p.shape ?? 'circle',
	dotSize: p.dotSize ?? 20,
	dotSpacing: p.dotSpacing ?? p.dotSize ?? 20,
	rotation: p.rotation ?? 0,
	offsetX: p.offsetX ?? 0,
	offsetY: p.offsetY ?? 0,
	sampling: p.sampling ?? 'bilinear',
	color: p.color ?? 'black',
	shadeOutside: p.shadeOutside ?? false,
});

const HALFTONE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const HALFTONE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uDotSize;
uniform float uDotSpacing;
uniform float uRotation;
uniform vec2 uOffset;
uniform vec4 uColor;
uniform int uShape;
uniform bool uShadeOutside;

const float SHADE_OUTSIDE_SCALE = ${SHADE_OUTSIDE_DOT_SCALE.toFixed(1)};

void main() {
	vec2 fragPos = vUv * uResolution;
	vec2 center = uResolution * 0.5;

	vec2 d = fragPos - center;
	float cosR = cos(uRotation);
	float sinR = sin(uRotation);

	vec2 gridPos = vec2(
		d.x * cosR + d.y * sinR,
		-d.x * sinR + d.y * cosR
	);

	float spacing = max(uDotSpacing, 0.001);
	vec2 cellIndex = floor((gridPos + uOffset) / spacing + 0.5);
	vec2 gridCenter = cellIndex * spacing - uOffset;

	vec2 canvasPos = center + vec2(
		gridCenter.x * cosR - gridCenter.y * sinR,
		gridCenter.x * sinR + gridCenter.y * cosR
	);

	vec2 sampleUv = clamp(canvasPos / uResolution, vec2(0.0), vec2(1.0));
	vec4 texColor = texture(uSource, sampleUv);

	float alpha = texColor.a;
	vec3 rgb = alpha > 0.001 ? texColor.rgb / alpha : vec3(0.0);
	float lum = dot(rgb, vec3(0.299, 0.587, 0.114));

	float lumDefault = lum * alpha + (1.0 - alpha);
	float dotScale = uShadeOutside
		? (1.0 - alpha) * SHADE_OUTSIDE_SCALE
		: 1.0 - lumDefault;

	if (dotScale <= 0.01) {
		fragColor = vec4(0.0);
		return;
	}

	vec2 diff = gridPos - gridCenter;
	float halfSize = uDotSize * 0.5;
	float coverage = 0.0;

	if (uShape == 0) {
		float radius = halfSize * dotScale;
		float dist = length(diff);
		coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, dist);
	} else if (uShape == 1) {
		float s = uDotSize * dotScale * 0.5;
		coverage = (1.0 - smoothstep(s - 0.5, s + 0.5, abs(diff.x)))
				 * (1.0 - smoothstep(s - 0.5, s + 0.5, abs(diff.y)));
	} else {
		float lineHalf = uDotSize * dotScale * 0.5;
		coverage = (1.0 - smoothstep(halfSize - 0.5, halfSize + 0.5, abs(diff.x)))
				 * (1.0 - smoothstep(lineHalf - 0.5, lineHalf + 0.5, abs(diff.y)));
	}

	fragColor = uColor * coverage;
}
`;

type HalftoneState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uDotSize: WebGLUniformLocation | null;
	uDotSpacing: WebGLUniformLocation | null;
	uRotation: WebGLUniformLocation | null;
	uOffset: WebGLUniformLocation | null;
	uColor: WebGLUniformLocation | null;
	uShape: WebGLUniformLocation | null;
	uShadeOutside: WebGLUniformLocation | null;
	colorCtx: CanvasRenderingContext2D;
	cachedColorStr: string;
	cachedColorRgba: [number, number, number, number];
};

const SHAPE_INDEX: Record<HalftoneShape, number> = {
	circle: 0,
	square: 1,
	line: 2,
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
		throw new Error(`Halftone shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Halftone program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const parseColorRgba = (
	ctx: CanvasRenderingContext2D,
	color: string,
): [number, number, number, number] => {
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	const {data} = ctx.getImageData(0, 0, 1, 1);
	return [data[0] / 255, data[1] / 255, data[2] / 255, data[3] / 255];
};

const halftoneDef = defineEffect<HalftoneParams, HalftoneState>({
	type: 'remotion/halftone',
	label: 'Halftone',
	backend: 'webgl2',
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw new Error('Failed to acquire WebGL2 context for halftone effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		// DOM sources (video, canvas) are top-left origin; GL texture space matches
		// our quad UVs (y up in clip space) only when uploads flip vertically.
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, HALFTONE_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, HALFTONE_FS);
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
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uDotSize: gl.getUniformLocation(program, 'uDotSize'),
			uDotSpacing: gl.getUniformLocation(program, 'uDotSpacing'),
			uRotation: gl.getUniformLocation(program, 'uRotation'),
			uOffset: gl.getUniformLocation(program, 'uOffset'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uShape: gl.getUniformLocation(program, 'uShape'),
			uShadeOutside: gl.getUniformLocation(program, 'uShadeOutside'),
			colorCtx,
			cachedColorStr: '',
			cachedColorRgba: [0, 0, 0, 1] as [number, number, number, number],
		};
	},
	apply: ({source, width, height, params, state}) => {
		const r = resolve(params);
		const {gl, program, vao, texture} = state;

		if (state.cachedColorStr !== r.color) {
			state.cachedColorStr = r.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
		}

		const [cr, cg, cb, ca] = state.cachedColorRgba;

		const filter = r.sampling === 'nearest' ? gl.NEAREST : gl.LINEAR;

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		if (state.uSource) gl.uniform1i(state.uSource, 0);
		if (state.uResolution) gl.uniform2f(state.uResolution, width, height);
		if (state.uDotSize) gl.uniform1f(state.uDotSize, r.dotSize);
		if (state.uDotSpacing) gl.uniform1f(state.uDotSpacing, r.dotSpacing);
		if (state.uRotation)
			gl.uniform1f(state.uRotation, (r.rotation * Math.PI) / 180);
		if (state.uOffset) gl.uniform2f(state.uOffset, r.offsetX, r.offsetY);
		if (state.uColor) gl.uniform4f(state.uColor, cr * ca, cg * ca, cb * ca, ca);
		if (state.uShape) gl.uniform1i(state.uShape, SHAPE_INDEX[r.shape]);
		if (state.uShadeOutside)
			gl.uniform1i(state.uShadeOutside, r.shadeOutside ? 1 : 0);

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
	schema: halftoneSchema,
});

// Halftone effect (WebGL2). Converts luminance into a grid of dots, squares,
// or lines. Each fragment determines its nearest grid cell and whether it falls
// inside a dot, so edge dots are never culled. `dotSpacing` sets the grid pitch
// (defaults to `dotSize`). `sampling` controls texture interpolation when
// reading luminance at grid centres. `shadeOutside` fills transparent areas
// with a screen tone instead of luminance-driven ink on opaque pixels alone.
export const halftone = (
	params: HalftoneParams = {},
): EffectDescriptor<unknown> => createDescriptor(halftoneDef, params);
