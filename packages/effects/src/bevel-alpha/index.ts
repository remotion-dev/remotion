import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from '../validate-effect-param.js';
import {
	BEVEL_ALPHA_VERTEX_SHADER,
	BEVEL_ALPHA_SHADE_SHADER,
	buildBevelAlphaBlurShader,
} from './shaders.js';

const {createEffect, createWebGL2ContextError} = Internals;
const DEFAULT_EDGE_THICKNESS = 2 as const;
const DEFAULT_LIGHT_ANGLE = -60 as const;
const DEFAULT_LIGHT_COLOR = 'white' as const;
const DEFAULT_LIGHT_INTENSITY = 0.4 as const;

const bevelAlphaSchema = {
	edgeThickness: {
		type: 'number',
		min: 0,
		max: 200,
		step: 0.1,
		default: DEFAULT_EDGE_THICKNESS,
		description: 'Edge thickness',
		hiddenFromList: false,
	},
	lightAngle: {
		type: 'rotation-degrees',
		step: 1,
		default: DEFAULT_LIGHT_ANGLE,
		description: 'Light angle',
	},
	lightColor: {
		type: 'color',
		default: DEFAULT_LIGHT_COLOR,
		description: 'Light color',
	},
	lightIntensity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_LIGHT_INTENSITY,
		description: 'Light intensity',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type BevelAlphaParams = {
	/** Width of the rounded bevel in pixels, from 0 to 200. Defaults to `2`. */
	readonly edgeThickness?: number;
	/** Light direction in degrees, clockwise from above. Defaults to `-60`. */
	readonly lightAngle?: number;
	/** CSS color of the highlights. Defaults to `white`. */
	readonly lightColor?: string;
	/** Strength of highlights and shadows, from 0 to 1. Defaults to `0.4`. */
	readonly lightIntensity?: number;
};

type BevelAlphaResolved = Required<BevelAlphaParams>;
const resolve = (p: BevelAlphaParams): BevelAlphaResolved => ({
	edgeThickness: p.edgeThickness ?? DEFAULT_EDGE_THICKNESS,
	lightAngle: p.lightAngle ?? DEFAULT_LIGHT_ANGLE,
	lightColor: p.lightColor ?? DEFAULT_LIGHT_COLOR,
	lightIntensity: p.lightIntensity ?? DEFAULT_LIGHT_INTENSITY,
});

const validateBevelAlphaParams = (params: BevelAlphaParams): void => {
	assertEffectParamsObject(params, 'Bevel alpha');
	assertOptionalFiniteNumber(params.edgeThickness, 'edgeThickness');
	assertOptionalFiniteNumber(params.lightAngle, 'lightAngle');
	assertOptionalColor(params.lightColor, 'lightColor');
	assertOptionalFiniteNumber(params.lightIntensity, 'lightIntensity');
	const r = resolve(params);
	validateNonNegative(r.edgeThickness, 'edgeThickness');
	if (r.edgeThickness > 200)
		throw new TypeError('"edgeThickness" must be at most 200');
	validateUnitInterval(r.lightIntensity, 'lightIntensity');
};

type BlurPass = {
	readonly program: WebGLProgram;
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uRadius: WebGLUniformLocation | null;
};
type BevelAlphaState = {
	readonly gl: WebGL2RenderingContext;
	readonly horizontal: BlurPass;
	readonly vertical: BlurPass;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly intermediate: WebGLTexture;
	readonly heightTexture: WebGLTexture;
	readonly framebuffer: WebGLFramebuffer;
	readonly uSource: WebGLUniformLocation | null;
	readonly uHeight: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uEdgeThickness: WebGLUniformLocation | null;
	readonly uLightDirection: WebGLUniformLocation | null;
	readonly uLightColor: WebGLUniformLocation | null;
	readonly uLightIntensity: WebGLUniformLocation | null;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedColorRgba: ParsedColorRgba;
	width: number;
	height: number;
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
		throw new Error(`BevelAlpha shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`BevelAlpha program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const setupBevelAlpha = (target: HTMLCanvasElement): BevelAlphaState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) throw createWebGL2ContextError('bevel alpha effect');
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	const vs = compileShader(gl, gl.VERTEX_SHADER, BEVEL_ALPHA_VERTEX_SHADER);
	const programs = [
		buildBevelAlphaBlurShader('horizontal'),
		buildBevelAlphaBlurShader('vertical'),
		BEVEL_ALPHA_SHADE_SHADER,
	].map((source) => {
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, source);
		const shaderProgram = linkProgram(gl, vs, fs);
		gl.deleteShader(fs);
		return shaderProgram;
	});
	gl.deleteShader(vs);
	const [horizontalProgram, verticalProgram, program] = programs;
	const passes = [horizontalProgram, verticalProgram].map((p) => ({
		program: p,
		uSource: gl.getUniformLocation(p, 'uSource'),
		uResolution: gl.getUniformLocation(p, 'uResolution'),
		uRadius: gl.getUniformLocation(p, 'uRadius'),
	}));
	const vao = gl.createVertexArray();
	const vbo = gl.createBuffer();
	const framebuffer = gl.createFramebuffer();
	if (!vao || !vbo || !framebuffer)
		throw new Error('Could not allocate bevel alpha WebGL resources');
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
	const textures = [gl.LINEAR, gl.NEAREST, gl.NEAREST].map((filter) => {
		const texture = gl.createTexture();
		if (!texture) throw new Error('Could not allocate bevel alpha texture');
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return texture;
	});
	gl.bindTexture(gl.TEXTURE_2D, null);
	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx)
		throw new Error('Failed to acquire 2D context for color parsing');
	return {
		gl,
		horizontal: passes[0],
		vertical: passes[1],
		program,
		vao,
		vbo,
		framebuffer,
		texture: textures[0],
		intermediate: textures[1],
		heightTexture: textures[2],
		uSource: gl.getUniformLocation(program, 'uSource'),
		uHeight: gl.getUniformLocation(program, 'uHeight'),
		uResolution: gl.getUniformLocation(program, 'uResolution'),
		uEdgeThickness: gl.getUniformLocation(program, 'uEdgeThickness'),
		uLightDirection: gl.getUniformLocation(program, 'uLightDirection'),
		uLightColor: gl.getUniformLocation(program, 'uLightColor'),
		uLightIntensity: gl.getUniformLocation(program, 'uLightIntensity'),
		colorCtx,
		cachedColor: '',
		cachedColorRgba: [255, 255, 255, 255],
		width: 0,
		height: 0,
	};
};

export const bevelAlpha = createEffect<BevelAlphaParams, BevelAlphaState>({
	type: 'remotion/bevel-alpha',
	label: 'bevelAlpha()',
	documentationLink: 'https://www.remotion.dev/docs/effects/bevel-alpha',
	backend: 'webgl2',
	calculateKey: (params) => `bevel-alpha-${JSON.stringify(resolve(params))}`,
	setup: setupBevelAlpha,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {
			gl,
			texture,
			intermediate,
			heightTexture,
			program,
			vao,
			framebuffer,
		} = state;
		if (state.cachedColor !== r.lightColor) {
			state.cachedColor = r.lightColor;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.lightColor);
		}

		gl.viewport(0, 0, width, height);
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
		if (state.width !== width || state.height !== height) {
			for (const output of [intermediate, heightTexture]) {
				gl.bindTexture(gl.TEXTURE_2D, output);
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

		gl.bindVertexArray(vao);
		if (r.edgeThickness > 0 && r.lightIntensity > 0) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
			// Dithering would corrupt packed heights. Preserve the pooled context's
			// incoming setting for the final shading pass and subsequent effects.
			const ditherEnabled = gl.isEnabled(gl.DITHER);
			gl.disable(gl.DITHER);
			try {
				for (const [pass, input, output] of [
					[state.horizontal, texture, intermediate],
					[state.vertical, intermediate, heightTexture],
				] as const) {
					gl.framebufferTexture2D(
						gl.FRAMEBUFFER,
						gl.COLOR_ATTACHMENT0,
						gl.TEXTURE_2D,
						output,
						0,
					);
					if (
						gl.checkFramebufferStatus(gl.FRAMEBUFFER) !==
						gl.FRAMEBUFFER_COMPLETE
					)
						throw new Error('Bevel alpha framebuffer is incomplete');
					gl.bindTexture(gl.TEXTURE_2D, input);
					gl.useProgram(pass.program);
					gl.uniform1i(pass.uSource, 0);
					gl.uniform2f(pass.uResolution, width, height);
					// Gaussian shader radius covers three standard deviations; sigma=t/2.
					gl.uniform1f(pass.uRadius, r.edgeThickness * 1.5);
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
				}
			} finally {
				if (ditherEnabled) gl.enable(gl.DITHER);
			}
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, heightTexture);
		gl.useProgram(program);
		gl.uniform1i(state.uSource, 0);
		gl.uniform1i(state.uHeight, 1);
		gl.uniform2f(state.uResolution, width, height);
		gl.uniform1f(state.uEdgeThickness, r.edgeThickness);
		const angle = ((r.lightAngle % 360) * Math.PI) / 180;
		gl.uniform3f(
			state.uLightDirection,
			Math.sin(angle) * Math.SQRT1_2,
			-Math.cos(angle) * Math.SQRT1_2,
			Math.SQRT1_2,
		);
		const [red, green, blue, alpha] = state.cachedColorRgba;
		gl.uniform3f(
			state.uLightColor,
			((red / 255) * alpha) / 255,
			((green / 255) * alpha) / 255,
			((blue / 255) * alpha) / 255,
		);
		gl.uniform1f(state.uLightIntensity, r.lightIntensity);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: (state) => {
		const {gl} = state;
		for (const texture of [
			state.texture,
			state.intermediate,
			state.heightTexture,
		])
			gl.deleteTexture(texture);
		for (const program of [
			state.horizontal.program,
			state.vertical.program,
			state.program,
		])
			gl.deleteProgram(program);
		gl.deleteFramebuffer(state.framebuffer);
		gl.deleteBuffer(state.vbo);
		gl.deleteVertexArray(state.vao);
	},
	schema: bevelAlphaSchema,
	validateParams: validateBevelAlphaParams,
});
