import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {colorToRgb} from './color-to-rgb';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_ORIGIN = [0.5, 0.5] as const;

export const starburstEffectSchema = {
	rays: {
		type: 'number',
		min: 2,
		max: 100,
		step: 1,
		default: undefined,
		description: 'Number of Rays',
		hiddenFromList: false,
	},
	colors: {
		type: 'array',
		item: {
			type: 'color',
		},
		default: undefined,
		minLength: 2,
		newItemDefault: '#ff0000',
		description: 'Colors',
		keyframable: false,
	},
	rotation: {
		type: 'number',
		min: 0,
		max: 360,
		step: 1,
		default: 0,
		description: 'Rotation',
		hiddenFromList: false,
	},
	smoothness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Edge Smoothness',
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
} as const satisfies InteractivitySchema;

export type StarburstOrigin = readonly [number, number];

export type StarburstEffectParams = {
	readonly rays: number;
	readonly colors: readonly string[];
	readonly rotation?: number;
	readonly smoothness?: number;
	readonly origin?: StarburstOrigin;
};

type StarburstResolved = {
	rays: number;
	colors: readonly string[];
	rotation: number;
	smoothness: number;
	origin: StarburstOrigin;
};

const resolve = (p: StarburstEffectParams): StarburstResolved => ({
	rays: p.rays,
	colors: p.colors,
	rotation: p.rotation ?? 0,
	smoothness: p.smoothness ?? 0,
	origin: (p.origin ?? DEFAULT_ORIGIN) as StarburstOrigin,
});

const validateStarburstEffectParams = (params: StarburstEffectParams): void => {
	if (params === null || typeof params !== 'object') {
		throw new TypeError(
			`Starburst effect requires a parameters object, but got ${JSON.stringify(params)}`,
		);
	}

	const {rays, colors} = params;

	if (typeof rays !== 'number' || !Number.isFinite(rays)) {
		throw new TypeError(
			`"rays" must be a finite number, but got ${JSON.stringify(rays)}`,
		);
	}

	if (rays < 2 || rays > 100) {
		throw new RangeError(`"rays" must be between 2 and 100, but got ${rays}`);
	}

	if (!Array.isArray(colors) || colors.length < 2) {
		throw new TypeError(
			`"colors" must be an array with at least 2 colors, but got ${JSON.stringify(colors)}`,
		);
	}

	const r = resolve(params);

	if (typeof r.rotation !== 'number' || !Number.isFinite(r.rotation)) {
		throw new TypeError(
			`"rotation" must be a finite number, but got ${JSON.stringify(params.rotation)}`,
		);
	}

	if (typeof r.smoothness !== 'number' || !Number.isFinite(r.smoothness)) {
		throw new TypeError(
			`"smoothness" must be a finite number, but got ${JSON.stringify(params.smoothness)}`,
		);
	}

	if (r.smoothness < 0 || r.smoothness > 1) {
		throw new RangeError(
			`"smoothness" must be between 0 and 1, but got ${r.smoothness}`,
		);
	}

	if (
		!Array.isArray(r.origin) ||
		r.origin.length !== 2 ||
		r.origin.some((coordinate) => {
			return typeof coordinate !== 'number' || !Number.isFinite(coordinate);
		})
	) {
		throw new TypeError('"origin" must be a [number, number] tuple');
	}

	if (r.origin.some((coordinate) => coordinate < 0 || coordinate > 1)) {
		throw new RangeError(
			`"origin" must contain coordinates between 0 and 1, but got ${JSON.stringify(r.origin)}`,
		);
	}

	for (const c of r.colors) {
		colorToRgb(c);
	}
};

const STARBURST_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;
void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const STARBURST_FS = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D colorPalette;
uniform float numRays;
uniform float rotationOffset;
uniform float smoothEdge;
uniform vec2 resolution;
uniform float numColors;
uniform vec2 origin;

in vec2 vUv;
out vec4 fragColor;

const float Pi = 3.14159265359;

void main() {
	vec2 uv = vUv;
	vec2 center = uv - origin;
	center.x *= resolution.x / resolution.y;

	float angle = atan(center.y, center.x) + rotationOffset;
	float normalizedAngle = (angle + Pi) / (2.0 * Pi);
	float sector = normalizedAngle * numRays;
	float rayIndex = mod(floor(sector), numRays);

	float colorIndex = mod(rayIndex, numColors);
	float texCoord = (colorIndex + 0.5) / numColors;
	vec3 col = texture(colorPalette, vec2(texCoord, 0.5)).rgb;

	float fractSector = fract(sector);
	float edgeSmooth = smoothEdge * 0.5;
	float nextColorIndex = mod(rayIndex + 1.0, numColors);
	float nextTexCoord = (nextColorIndex + 0.5) / numColors;
	vec3 nextCol = texture(colorPalette, vec2(nextTexCoord, 0.5)).rgb;

	float blend = smoothstep(1.0 - edgeSmooth, 1.0, fractSector);
	col = mix(col, nextCol, blend);
	float blendStart = smoothstep(edgeSmooth, 0.0, fractSector);
	float prevColorIndex = mod(rayIndex - 1.0 + numColors, numColors);
	float prevTexCoord = (prevColorIndex + 0.5) / numColors;
	vec3 prevCol = texture(colorPalette, vec2(prevTexCoord, 0.5)).rgb;
	col = mix(col, prevCol, blendStart);

	fragColor = vec4(col, 1.0);
}
`;

type StarburstGlState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	paletteTexture: WebGLTexture;
	uColorPalette: WebGLUniformLocation | null;
	uNumRays: WebGLUniformLocation | null;
	uRotationOffset: WebGLUniformLocation | null;
	uSmoothEdge: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uNumColors: WebGLUniformLocation | null;
	uOrigin: WebGLUniformLocation | null;
	cachedPaletteKey: string;
	palettePixelData: Uint8Array;
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
		throw new Error(`Starburst shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Starburst program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const starburst = createEffect<StarburstEffectParams, StarburstGlState>({
	type: 'dev.remotion.starburst.starburst',
	label: 'starburst()',
	documentationLink: 'https://www.remotion.dev/docs/starburst/starburst-effect',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `starburst-${r.rays}-${r.colors.join('|')}-${r.rotation}-${r.smoothness}-${r.origin.join(':')}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('starburst effect');
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

		const vs = compileShader(gl, gl.VERTEX_SHADER, STARBURST_VS);
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, STARBURST_FS);
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

		const paletteTexture = gl.createTexture();
		if (!paletteTexture) {
			throw new Error('Failed to create WebGL palette texture');
		}

		gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return {
			gl,
			program,
			vao,
			vbo,
			paletteTexture,
			uColorPalette: gl.getUniformLocation(program, 'colorPalette'),
			uNumRays: gl.getUniformLocation(program, 'numRays'),
			uRotationOffset: gl.getUniformLocation(program, 'rotationOffset'),
			uSmoothEdge: gl.getUniformLocation(program, 'smoothEdge'),
			uResolution: gl.getUniformLocation(program, 'resolution'),
			uNumColors: gl.getUniformLocation(program, 'numColors'),
			uOrigin: gl.getUniformLocation(program, 'origin'),
			cachedPaletteKey: '',
			palettePixelData: new Uint8Array(0),
		};
	},
	apply: ({width, height, params, state}) => {
		const r = resolve(params);
		const {
			gl,
			program,
			vao,
			paletteTexture,
			uColorPalette,
			uNumRays,
			uRotationOffset,
			uSmoothEdge,
			uResolution,
			uNumColors,
			uOrigin,
		} = state;

		const rotationRad = (r.rotation * Math.PI) / 180;

		const paletteKey = r.colors.join('|');
		const paletteDirty = state.cachedPaletteKey !== paletteKey;
		if (paletteDirty) {
			state.cachedPaletteKey = paletteKey;
			const len = r.colors.length * 4;
			if (state.palettePixelData.length !== len) {
				state.palettePixelData = new Uint8Array(len);
			}

			const {palettePixelData} = state;
			for (let i = 0; i < r.colors.length; i++) {
				const rgb = colorToRgb(r.colors[i]);
				palettePixelData[i * 4] = rgb[0];
				palettePixelData[i * 4 + 1] = rgb[1];
				palettePixelData[i * 4 + 2] = rgb[2];
				palettePixelData[i * 4 + 3] = 255;
			}
		}

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
		if (paletteDirty) {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				r.colors.length,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				state.palettePixelData,
			);
		}

		if (uColorPalette) gl.uniform1i(uColorPalette, 0);
		if (uNumRays) gl.uniform1f(uNumRays, r.rays);
		if (uNumColors) gl.uniform1f(uNumColors, r.colors.length);
		if (uRotationOffset) gl.uniform1f(uRotationOffset, rotationRad);
		if (uSmoothEdge) gl.uniform1f(uSmoothEdge, r.smoothness);
		if (uOrigin) gl.uniform2f(uOrigin, r.origin[0], 1 - r.origin[1]);
		if (uResolution) gl.uniform2f(uResolution, width, height);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, paletteTexture}) => {
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
		gl.deleteTexture(paletteTexture);
	},
	schema: starburstEffectSchema,
	validateParams: validateStarburstEffectParams,
});
