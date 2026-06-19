import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_GRID_SIZE = 64 as const;
const DEFAULT_LINE_WIDTH = 2 as const;
const DEFAULT_LINE_COLOR = '#ffffff' as const;
const DEFAULT_BACKGROUND_COLOR = 'transparent' as const;
const DEFAULT_ROTATION = 0 as const;
const DEFAULT_ROTATION_X = 0 as const;
const DEFAULT_ROTATION_Y = 0 as const;
const DEFAULT_PERSPECTIVE = 0 as const;
const DEFAULT_OFFSET_X = 0 as const;
const DEFAULT_OFFSET_Y = 0 as const;
const DEFAULT_MASK_TO_SOURCE_ALPHA = false as const;

export const gridlinesSchema = {
	gridSize: {
		type: 'number',
		min: 1,
		max: 400,
		step: 1,
		default: DEFAULT_GRID_SIZE,
		description: 'Grid size',
		hiddenFromList: false,
	},
	lineWidth: {
		type: 'number',
		min: 0,
		max: 100,
		step: 0.1,
		default: DEFAULT_LINE_WIDTH,
		description: 'Line width',
		hiddenFromList: false,
	},
	lineColor: {
		type: 'color',
		default: DEFAULT_LINE_COLOR,
		description: 'Line color',
	},
	backgroundColor: {
		type: 'color',
		default: DEFAULT_BACKGROUND_COLOR,
		description: 'Background color',
	},
	rotation: {
		type: 'rotation-degrees',
		min: -180,
		max: 180,
		step: 1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
	},
	rotationX: {
		type: 'rotation-degrees',
		min: -180,
		max: 180,
		step: 0.1,
		default: DEFAULT_ROTATION_X,
		description: 'Rotation X',
	},
	rotationY: {
		type: 'rotation-degrees',
		min: -180,
		max: 180,
		step: 0.1,
		default: DEFAULT_ROTATION_Y,
		description: 'Rotation Y',
	},
	perspective: {
		type: 'number',
		min: 0,
		max: 4000,
		step: 1,
		default: DEFAULT_PERSPECTIVE,
		description: 'Perspective',
		hiddenFromList: false,
	},
	offsetX: {
		type: 'number',
		min: -400,
		max: 400,
		step: 0.1,
		default: DEFAULT_OFFSET_X,
		description: 'Offset X',
		hiddenFromList: false,
	},
	offsetY: {
		type: 'number',
		min: -400,
		max: 400,
		step: 0.1,
		default: DEFAULT_OFFSET_Y,
		description: 'Offset Y',
		hiddenFromList: false,
	},
	maskToSourceAlpha: {
		type: 'boolean',
		default: DEFAULT_MASK_TO_SOURCE_ALPHA,
		description: 'Mask to source alpha',
	},
} as const satisfies InteractivitySchema;

export type GridlinesParams = {
	/** Distance between adjacent grid lines in pixels. Defaults to `64`. */
	readonly gridSize?: number;
	/** Width of each grid line in pixels. Defaults to `2`. */
	readonly lineWidth?: number;
	/** Color of the grid lines. Defaults to white. */
	readonly lineColor?: string;
	/** Color behind the grid lines. Defaults to transparent. */
	readonly backgroundColor?: string;
	/** Rotates the grid in degrees. Defaults to `0`. */
	readonly rotation?: number;
	/** Rotates the grid plane around the X axis in degrees. Defaults to `0`. */
	readonly rotationX?: number;
	/** Rotates the grid plane around the Y axis in degrees. Defaults to `0`. */
	readonly rotationY?: number;
	/** Perspective distance in pixels. Defaults to `0` for an orthographic grid. */
	readonly perspective?: number;
	/** Horizontal grid offset in pixels. Defaults to `0`. */
	readonly offsetX?: number;
	/** Vertical grid offset in pixels. Defaults to `0`. */
	readonly offsetY?: number;
	/** Masks the generated grid to the source alpha channel. Defaults to `false`. */
	readonly maskToSourceAlpha?: boolean;
};

type GridlinesResolved = {
	gridSize: number;
	lineWidth: number;
	lineColor: string;
	backgroundColor: string;
	rotation: number;
	rotationX: number;
	rotationY: number;
	perspective: number;
	offsetX: number;
	offsetY: number;
	maskToSourceAlpha: boolean;
};

type GridlinesState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uResolution: WebGLUniformLocation | null;
		readonly uGridSize: WebGLUniformLocation | null;
		readonly uLineWidth: WebGLUniformLocation | null;
		readonly uLineColor: WebGLUniformLocation | null;
		readonly uBackgroundColor: WebGLUniformLocation | null;
		readonly uRotation: WebGLUniformLocation | null;
		readonly uRotationX: WebGLUniformLocation | null;
		readonly uRotationY: WebGLUniformLocation | null;
		readonly uPerspective: WebGLUniformLocation | null;
		readonly uOffset: WebGLUniformLocation | null;
		readonly uMaskToSourceAlpha: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedLineColorStr: string;
	cachedLineColorRgba: ParsedColorRgba;
	cachedBackgroundColorStr: string;
	cachedBackgroundColorRgba: ParsedColorRgba;
};

const resolve = (p: GridlinesParams): GridlinesResolved => ({
	gridSize: p.gridSize ?? DEFAULT_GRID_SIZE,
	lineWidth: p.lineWidth ?? DEFAULT_LINE_WIDTH,
	lineColor: p.lineColor ?? DEFAULT_LINE_COLOR,
	backgroundColor: p.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
	rotation: p.rotation ?? DEFAULT_ROTATION,
	rotationX: p.rotationX ?? DEFAULT_ROTATION_X,
	rotationY: p.rotationY ?? DEFAULT_ROTATION_Y,
	perspective: p.perspective ?? DEFAULT_PERSPECTIVE,
	offsetX: p.offsetX ?? DEFAULT_OFFSET_X,
	offsetY: p.offsetY ?? DEFAULT_OFFSET_Y,
	maskToSourceAlpha: p.maskToSourceAlpha ?? DEFAULT_MASK_TO_SOURCE_ALPHA,
});

const validatePositive = (value: number, name: string): void => {
	if (value <= 0) {
		throw new TypeError(
			`"${name}" must be greater than 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateNonNegative = (value: number, name: string): void => {
	if (value < 0) {
		throw new TypeError(
			`"${name}" must be greater than or equal to 0, but got ${JSON.stringify(value)}`,
		);
	}
};

const validateGridlinesParams = (params: GridlinesParams): void => {
	assertEffectParamsObject(params, 'Gridlines');
	assertOptionalFiniteNumber(params.gridSize, 'gridSize');
	assertOptionalFiniteNumber(params.lineWidth, 'lineWidth');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	assertOptionalFiniteNumber(params.rotationX, 'rotationX');
	assertOptionalFiniteNumber(params.rotationY, 'rotationY');
	assertOptionalFiniteNumber(params.perspective, 'perspective');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalColor(params.lineColor, 'lineColor');
	assertOptionalColor(params.backgroundColor, 'backgroundColor');
	assertOptionalBoolean(params.maskToSourceAlpha, 'maskToSourceAlpha');

	validatePositive(params.gridSize ?? DEFAULT_GRID_SIZE, 'gridSize');
	validateNonNegative(params.lineWidth ?? DEFAULT_LINE_WIDTH, 'lineWidth');
	validateNonNegative(params.perspective ?? DEFAULT_PERSPECTIVE, 'perspective');
};

const GRIDLINES_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const GRIDLINES_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uGridSize;
uniform float uLineWidth;
uniform vec4 uLineColor;
uniform vec4 uBackgroundColor;
uniform float uRotation;
uniform float uRotationX;
uniform float uRotationY;
uniform float uPerspective;
uniform vec2 uOffset;
uniform bool uMaskToSourceAlpha;

vec4 sourceOver(vec4 backdrop, vec4 overlay) {
	return overlay + backdrop * (1.0 - overlay.a);
}

vec4 sourceAtop(vec4 backdrop, vec4 overlay) {
	return vec4(
		overlay.rgb * backdrop.a + backdrop.rgb * (1.0 - overlay.a),
		backdrop.a
	);
}

mat3 rotationMatrix(float rotationX, float rotationY, float rotationZ) {
	float sx = sin(rotationX);
	float cx = cos(rotationX);
	float sy = sin(rotationY);
	float cy = cos(rotationY);
	float sz = sin(rotationZ);
	float cz = cos(rotationZ);

	mat3 rx = mat3(
		1.0, 0.0, 0.0,
		0.0, cx, sx,
		0.0, -sx, cx
	);
	mat3 ry = mat3(
		cy, 0.0, -sy,
		0.0, 1.0, 0.0,
		sy, 0.0, cy
	);
	mat3 rz = mat3(
		cz, sz, 0.0,
		-sz, cz, 0.0,
		0.0, 0.0, 1.0
	);

	return rz * ry * rx;
}

void main() {
	vec4 texColor = texture(uSource, vUv);
	vec2 centered = vUv * uResolution - uResolution * 0.5;
	mat3 rotation = rotationMatrix(uRotationX, uRotationY, uRotation);
	vec2 gridCoord;

	if (uPerspective <= 0.0) {
		vec3 rotated = rotation * vec3(centered, 0.0);
		gridCoord = rotated.xy + uOffset;
	} else {
		vec3 camera = vec3(0.0, 0.0, uPerspective);
		vec3 ray = normalize(vec3(centered, -uPerspective));
		vec3 normal = rotation * vec3(0.0, 0.0, 1.0);
		float denominator = dot(ray, normal);
		float t = -dot(camera, normal) / denominator;

		if (abs(denominator) < 0.0001 || t <= 0.0) {
			fragColor = sourceOver(texColor, uBackgroundColor);
			return;
		}

		vec3 worldPosition = camera + ray * t;
		vec3 localPosition = transpose(rotation) * worldPosition;
		gridCoord = localPosition.xy + uOffset;
	}

	float gridSize = max(uGridSize, 0.001);
	vec2 cell = abs(fract(gridCoord / gridSize + 0.5) - 0.5) * gridSize;
	float halfLineWidth = uLineWidth * 0.5;
	vec2 gridUnitsPerPixel = max(fwidth(gridCoord), vec2(0.001));
	vec2 halfWidthInGridUnits = halfLineWidth * gridUnitsPerPixel;
	vec2 antialiasInGridUnits = gridUnitsPerPixel;
	vec2 projectedCellSize = gridSize / gridUnitsPerPixel;
	vec2 densityFade = smoothstep(
		vec2(max(uLineWidth * 1.5, 1.0)),
		vec2(max(uLineWidth * 4.0, 2.0)),
		projectedCellSize
	);
	vec2 lineCoverage = halfLineWidth <= 0.001
		? vec2(0.0)
		: 1.0 - smoothstep(
			halfWidthInGridUnits - antialiasInGridUnits,
			halfWidthInGridUnits + antialiasInGridUnits,
			cell
		);
	lineCoverage *= densityFade;
	float coverage = max(lineCoverage.x, lineCoverage.y);

	vec4 background = uBackgroundColor;
	vec4 line = uLineColor * coverage;

	if (uMaskToSourceAlpha) {
		fragColor = sourceAtop(sourceAtop(texColor, background), line);
		return;
	}

	fragColor = sourceOver(sourceOver(texColor, background), line);
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
		throw new Error(`Gridlines shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Gridlines program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const rgbaToUniform = (
	rgba: ParsedColorRgba,
): readonly [number, number, number, number] => {
	const [r, g, b, a] = rgba;
	const alpha = a / 255;
	return [(r / 255) * alpha, (g / 255) * alpha, (b / 255) * alpha, alpha];
};

export const gridlines = createEffect<GridlinesParams, GridlinesState>({
	type: 'remotion/gridlines',
	label: 'gridlines()',
	documentationLink: 'https://www.remotion.dev/docs/effects/gridlines',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		const maskSuffix = r.maskToSourceAlpha ? '-mask-to-source-alpha' : '';
		return `gridlines-${r.gridSize}-${r.lineWidth}-${r.lineColor}-${r.backgroundColor}-${r.rotation}-${r.rotationX}-${r.rotationY}-${r.perspective}-${r.offsetX}-${r.offsetY}${maskSuffix}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('gridlines effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, GRIDLINES_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, GRIDLINES_FS);
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
			uniforms: {
				uSource: gl.getUniformLocation(program, 'uSource'),
				uResolution: gl.getUniformLocation(program, 'uResolution'),
				uGridSize: gl.getUniformLocation(program, 'uGridSize'),
				uLineWidth: gl.getUniformLocation(program, 'uLineWidth'),
				uLineColor: gl.getUniformLocation(program, 'uLineColor'),
				uBackgroundColor: gl.getUniformLocation(program, 'uBackgroundColor'),
				uRotation: gl.getUniformLocation(program, 'uRotation'),
				uRotationX: gl.getUniformLocation(program, 'uRotationX'),
				uRotationY: gl.getUniformLocation(program, 'uRotationY'),
				uPerspective: gl.getUniformLocation(program, 'uPerspective'),
				uOffset: gl.getUniformLocation(program, 'uOffset'),
				uMaskToSourceAlpha: gl.getUniformLocation(
					program,
					'uMaskToSourceAlpha',
				),
			},
			colorCtx,
			cachedLineColorStr: '',
			cachedLineColorRgba: [255, 255, 255, 255],
			cachedBackgroundColorStr: '',
			cachedBackgroundColorRgba: [0, 0, 0, 0],
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {gl, program, vao, texture, uniforms} = state;

		if (state.cachedLineColorStr !== r.lineColor) {
			state.cachedLineColorStr = r.lineColor;
			state.cachedLineColorRgba = parseColorRgba(state.colorCtx, r.lineColor);
		}

		if (state.cachedBackgroundColorStr !== r.backgroundColor) {
			state.cachedBackgroundColorStr = r.backgroundColor;
			state.cachedBackgroundColorRgba = parseColorRgba(
				state.colorCtx,
				r.backgroundColor,
			);
		}

		const [lineR, lineG, lineB, lineA] = rgbaToUniform(
			state.cachedLineColorRgba,
		);
		const [bgR, bgG, bgB, bgA] = rgbaToUniform(state.cachedBackgroundColorRgba);

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
		if (uniforms.uGridSize) gl.uniform1f(uniforms.uGridSize, r.gridSize);
		if (uniforms.uLineWidth) gl.uniform1f(uniforms.uLineWidth, r.lineWidth);
		if (uniforms.uLineColor)
			gl.uniform4f(uniforms.uLineColor, lineR, lineG, lineB, lineA);
		if (uniforms.uBackgroundColor)
			gl.uniform4f(uniforms.uBackgroundColor, bgR, bgG, bgB, bgA);
		if (uniforms.uRotation)
			gl.uniform1f(uniforms.uRotation, (r.rotation * Math.PI) / 180);
		if (uniforms.uRotationX)
			gl.uniform1f(uniforms.uRotationX, (r.rotationX * Math.PI) / 180);
		if (uniforms.uRotationY)
			gl.uniform1f(uniforms.uRotationY, (r.rotationY * Math.PI) / 180);
		if (uniforms.uPerspective)
			gl.uniform1f(uniforms.uPerspective, r.perspective);
		if (uniforms.uOffset) gl.uniform2f(uniforms.uOffset, r.offsetX, r.offsetY);
		if (uniforms.uMaskToSourceAlpha)
			gl.uniform1i(uniforms.uMaskToSourceAlpha, r.maskToSourceAlpha ? 1 : 0);

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
	schema: gridlinesSchema,
	validateParams: validateGridlinesParams,
});
