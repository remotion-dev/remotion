import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {hexToRgb} from './hex-to-rgb';

const {createEffect, createWebGL2ContextError} = Internals;

export const starburstEffectSchema = {
	rays: {
		type: 'number',
		min: 2,
		max: 100,
		step: 1,
		default: undefined,
		description: 'Number of Rays',
	},
	rotation: {
		type: 'number',
		min: 0,
		max: 360,
		step: 1,
		default: 0,
		description: 'Rotation',
	},
	smoothness: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Edge Smoothness',
	},
	vignette: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Vignette',
	},
	originOffsetX: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Origin Offset X',
	},
	originOffsetY: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: 0,
		description: 'Origin Offset Y',
	},
} as const satisfies SequenceSchema;

export type StarburstEffectParams = {
	readonly rays: number;
	readonly colors: readonly string[];
	readonly rotation?: number;
	readonly smoothness?: number;
	readonly vignette?: number;
	readonly originOffsetX?: number;
	readonly originOffsetY?: number;
};

type StarburstResolved = {
	rays: number;
	colors: readonly string[];
	rotation: number;
	smoothness: number;
	vignette: number;
	originOffsetX: number;
	originOffsetY: number;
};

const resolve = (p: StarburstEffectParams): StarburstResolved => ({
	rays: p.rays,
	colors: p.colors,
	rotation: p.rotation ?? 0,
	smoothness: p.smoothness ?? 0,
	vignette: p.vignette ?? 1,
	originOffsetX: p.originOffsetX ?? 0,
	originOffsetY: p.originOffsetY ?? 0,
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

	if (typeof r.vignette !== 'number' || !Number.isFinite(r.vignette)) {
		throw new TypeError(
			`"vignette" must be a finite number, but got ${JSON.stringify(params.vignette)}`,
		);
	}

	if (r.vignette < 0 || r.vignette > 1) {
		throw new RangeError(
			`"vignette" must be between 0 and 1, but got ${r.vignette}`,
		);
	}

	if (
		typeof r.originOffsetX !== 'number' ||
		!Number.isFinite(r.originOffsetX)
	) {
		throw new TypeError(
			`"originOffsetX" must be a finite number, but got ${JSON.stringify(params.originOffsetX)}`,
		);
	}

	if (
		typeof r.originOffsetY !== 'number' ||
		!Number.isFinite(r.originOffsetY)
	) {
		throw new TypeError(
			`"originOffsetY" must be a finite number, but got ${JSON.stringify(params.originOffsetY)}`,
		);
	}

	for (const c of r.colors) {
		hexToRgb(c);
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

uniform sampler2D uSource;
uniform sampler2D colorPalette;
uniform float numRays;
uniform float rotationOffset;
uniform float smoothEdge;
uniform vec2 resolution;
uniform float numColors;
uniform float vignetteAmount;
uniform vec2 originOffset;

in vec2 vUv;
out vec4 fragColor;

const float Pi = 3.14159265359;

void main() {
	vec2 uv = vUv;
	vec2 center = uv - 0.5 - originOffset;
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

	vec2 vignetteCenter = (uv - 0.5) * vec2(resolution.x / resolution.y, 1.0);
	float dist = length(vignetteCenter);
	float radius = vignetteAmount * 3.0;
	float burstAlpha = smoothstep(radius, radius * 0.5, dist);

	vec4 src = texture(uSource, vUv);
	vec3 burstPm = col * burstAlpha;
	vec3 outRgb = burstPm + src.rgb * (1.0 - burstAlpha);
	float outA = burstAlpha + src.a * (1.0 - burstAlpha);
	fragColor = vec4(outRgb, outA);
}
`;

type StarburstGlState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	sourceTexture: WebGLTexture;
	paletteTexture: WebGLTexture;
	uSource: WebGLUniformLocation | null;
	uColorPalette: WebGLUniformLocation | null;
	uNumRays: WebGLUniformLocation | null;
	uRotationOffset: WebGLUniformLocation | null;
	uSmoothEdge: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	uNumColors: WebGLUniformLocation | null;
	uVignetteAmount: WebGLUniformLocation | null;
	uOriginOffset: WebGLUniformLocation | null;
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
	type: 'remotion/starburst',
	label: 'Starburst',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `starburst-${r.rays}-${r.colors.join('|')}-${r.rotation}-${r.smoothness}-${r.vignette}-${r.originOffsetX}-${r.originOffsetY}`;
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

		const sourceTexture = gl.createTexture();
		if (!sourceTexture) {
			throw new Error('Failed to create WebGL source texture');
		}

		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);

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
			sourceTexture,
			paletteTexture,
			uSource: gl.getUniformLocation(program, 'uSource'),
			uColorPalette: gl.getUniformLocation(program, 'colorPalette'),
			uNumRays: gl.getUniformLocation(program, 'numRays'),
			uRotationOffset: gl.getUniformLocation(program, 'rotationOffset'),
			uSmoothEdge: gl.getUniformLocation(program, 'smoothEdge'),
			uResolution: gl.getUniformLocation(program, 'resolution'),
			uNumColors: gl.getUniformLocation(program, 'numColors'),
			uVignetteAmount: gl.getUniformLocation(program, 'vignetteAmount'),
			uOriginOffset: gl.getUniformLocation(program, 'originOffset'),
			cachedPaletteKey: '',
			palettePixelData: new Uint8Array(0),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {
			gl,
			program,
			vao,
			sourceTexture,
			paletteTexture,
			uSource,
			uColorPalette,
			uNumRays,
			uRotationOffset,
			uSmoothEdge,
			uResolution,
			uNumColors,
			uVignetteAmount,
			uOriginOffset,
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
				const rgb = hexToRgb(r.colors[i]);
				palettePixelData[i * 4] = Math.round(rgb[0] * 255);
				palettePixelData[i * 4 + 1] = Math.round(rgb[1] * 255);
				palettePixelData[i * 4 + 2] = Math.round(rgb[2] * 255);
				palettePixelData[i * 4 + 3] = 255;
			}
		}

		gl.viewport(0, 0, width, height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);
		gl.bindVertexArray(vao);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

		if (uSource) gl.uniform1i(uSource, 0);
		if (uColorPalette) gl.uniform1i(uColorPalette, 1);
		if (uNumRays) gl.uniform1f(uNumRays, r.rays);
		if (uNumColors) gl.uniform1f(uNumColors, r.colors.length);
		if (uRotationOffset) gl.uniform1f(uRotationOffset, rotationRad);
		if (uSmoothEdge) gl.uniform1f(uSmoothEdge, r.smoothness);
		if (uVignetteAmount) gl.uniform1f(uVignetteAmount, r.vignette);
		if (uOriginOffset)
			gl.uniform2f(uOriginOffset, r.originOffsetX, r.originOffsetY);
		if (uResolution) gl.uniform2f(uResolution, width, height);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, sourceTexture, paletteTexture}) => {
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
		gl.deleteTexture(sourceTexture);
		gl.deleteTexture(paletteTexture);
	},
	schema: starburstEffectSchema,
	validateParams: validateStarburstEffectParams,
});
