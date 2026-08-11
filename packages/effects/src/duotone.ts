import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_DARK_COLOR = '#000000' as const;
const DEFAULT_LIGHT_COLOR = '#ffffff' as const;
const DEFAULT_LUMINANCE_THRESHOLD = 0.5 as const;

export const duotoneSchema = {
	darkColor: {
		type: 'color',
		default: DEFAULT_DARK_COLOR,
		description: 'Dark color',
	},
	lightColor: {
		type: 'color',
		default: DEFAULT_LIGHT_COLOR,
		description: 'Light color',
	},
	threshold: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_LUMINANCE_THRESHOLD,
		description: 'Luminance threshold',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type DuotoneParams = {
	/** Color used for pixels below the luminance threshold. Defaults to black. */
	readonly darkColor?: string;
	/** Color used for pixels at or above the luminance threshold. Defaults to white. */
	readonly lightColor?: string;
	/** Luminance threshold from `0` to `1`. Defaults to `0.5`. */
	readonly threshold?: number;
};

type DuotoneResolved = {
	darkColor: string;
	lightColor: string;
	threshold: number;
};

type DuotoneState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uDarkColor: WebGLUniformLocation | null;
		readonly uLightColor: WebGLUniformLocation | null;
		readonly uThreshold: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedDarkColor: string;
	cachedDarkColorRgba: ParsedColorRgba;
	cachedLightColor: string;
	cachedLightColorRgba: ParsedColorRgba;
};

const resolve = (p: DuotoneParams): DuotoneResolved => ({
	darkColor: p.darkColor ?? DEFAULT_DARK_COLOR,
	lightColor: p.lightColor ?? DEFAULT_LIGHT_COLOR,
	threshold: p.threshold ?? DEFAULT_LUMINANCE_THRESHOLD,
});

const validateDuotoneParams = (params: DuotoneParams): void => {
	assertEffectParamsObject(params, 'Duotone');
	assertOptionalColor(params.darkColor, 'darkColor');
	assertOptionalColor(params.lightColor, 'lightColor');
	assertOptionalFiniteNumber(params.threshold, 'threshold');

	const {threshold} = resolve(params);
	validateUnitInterval(threshold, 'threshold');
};

const DUOTONE_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const DUOTONE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec3 uDarkColor;
uniform vec3 uLightColor;
uniform float uThreshold;

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 rgb = texColor.rgb / alpha;
	float luminance = dot(rgb, vec3(0.299, 0.587, 0.114));
	vec3 duotoneColor = luminance < uThreshold ? uDarkColor : uLightColor;

	fragColor = vec4(duotoneColor * alpha, alpha);
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
		throw new Error(`Duotone shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Duotone program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createProgram = (
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram => {
	const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = linkProgram(gl, vs, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	return program;
};

const createRgbaTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
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

const setupDuotone = (target: HTMLCanvasElement): DuotoneState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('duotone effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, DUOTONE_VS, DUOTONE_FS);

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

	const textureSource = createRgbaTexture(gl);

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
			uDarkColor: gl.getUniformLocation(program, 'uDarkColor'),
			uLightColor: gl.getUniformLocation(program, 'uLightColor'),
			uThreshold: gl.getUniformLocation(program, 'uThreshold'),
		},
		colorCtx,
		cachedDarkColor: '',
		cachedDarkColorRgba: [0, 0, 0, 255],
		cachedLightColor: '',
		cachedLightColorRgba: [255, 255, 255, 255],
	};
};

const normalizedRgb = (
	color: ParsedColorRgba,
): readonly [number, number, number] => {
	return [color[0] / 255, color[1] / 255, color[2] / 255];
};

const getParsedColors = (
	state: DuotoneState,
	resolved: DuotoneResolved,
): {
	dark: ParsedColorRgba;
	light: ParsedColorRgba;
} => {
	if (state.cachedDarkColor !== resolved.darkColor) {
		state.cachedDarkColor = resolved.darkColor;
		state.cachedDarkColorRgba = parseColorRgba(
			state.colorCtx,
			resolved.darkColor,
		);
	}

	if (state.cachedLightColor !== resolved.lightColor) {
		state.cachedLightColor = resolved.lightColor;
		state.cachedLightColorRgba = parseColorRgba(
			state.colorCtx,
			resolved.lightColor,
		);
	}

	return {
		dark: state.cachedDarkColorRgba,
		light: state.cachedLightColorRgba,
	};
};

export const duotone = createEffect<DuotoneParams, DuotoneState>({
	type: 'dev.remotion.effects.duotone',
	label: 'duotone()',
	documentationLink: 'https://www.remotion.dev/docs/effects/duotone',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `duotone-${r.darkColor}-${r.lightColor}-${r.threshold}`;
	},
	setup: (target) => setupDuotone(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const {dark, light} = getParsedColors(state, r);
		const [dr, dg, db] = normalizedRgb(dark);
		const [lr, lg, lb] = normalizedRgb(light);
		const {gl, program, textureSource, uniforms, vao} = state;

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
		if (uniforms.uDarkColor) gl.uniform3f(uniforms.uDarkColor, dr, dg, db);
		if (uniforms.uLightColor) gl.uniform3f(uniforms.uLightColor, lr, lg, lb);
		if (uniforms.uThreshold) gl.uniform1f(uniforms.uThreshold, r.threshold);

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
	schema: duotoneSchema,
	validateParams: validateDuotoneParams,
});
