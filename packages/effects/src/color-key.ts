import type {SequenceSchema} from 'remotion';
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

const DEFAULT_COLOR = '#00ff00' as const;
const DEFAULT_THRESHOLD = 0.2 as const;
const DEFAULT_FEATHER = 0.1 as const;

export const colorKeySchema = {
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Key color',
	},
	threshold: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_THRESHOLD,
		description: 'Similarity threshold',
	},
	feather: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_FEATHER,
		description: 'Edge softness',
	},
} as const satisfies SequenceSchema;

export type ColorKeyParams = {
	/** Color to key out. Defaults to `'#00ff00'`. */
	readonly color?: string;
	/** How similar a pixel has to be to become transparent. Defaults to `0.2`. */
	readonly threshold?: number;
	/** Softness of key edges. Defaults to `0.1`. */
	readonly feather?: number;
};

type ColorKeyResolved = {
	color: string;
	threshold: number;
	feather: number;
};

type ColorKeyState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uKeyColor: WebGLUniformLocation | null;
		readonly uThreshold: WebGLUniformLocation | null;
		readonly uFeather: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedColorRgba: ParsedColorRgba;
};

const resolve = (p: ColorKeyParams): ColorKeyResolved => ({
	color: p.color ?? DEFAULT_COLOR,
	threshold: p.threshold ?? DEFAULT_THRESHOLD,
	feather: p.feather ?? DEFAULT_FEATHER,
});

const validateColorKeyParams = (params: ColorKeyParams): void => {
	assertEffectParamsObject(params, 'Color key');
	assertOptionalColor(params.color, 'color');
	assertOptionalFiniteNumber(params.threshold, 'threshold');
	assertOptionalFiniteNumber(params.feather, 'feather');

	const {threshold, feather} = resolve(params);
	validateUnitInterval(threshold, 'threshold');
	validateUnitInterval(feather, 'feather');
};

const COLOR_KEY_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const COLOR_KEY_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec3 uKeyColor;
uniform float uThreshold;
uniform float uFeather;

const float SQRT_3 = 1.7320508075688772;

void main() {
	vec4 texColor = texture(uSource, vUv);
	float alpha = texColor.a;

	if (alpha <= 0.001) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 rgb = texColor.rgb / alpha;
	float distanceNormalized = distance(rgb, uKeyColor) / SQRT_3;

	float keepMask;
	if (uFeather <= 0.0001) {
		keepMask = step(uThreshold, distanceNormalized);
	} else {
		float edge0 = max(0.0, uThreshold - uFeather);
		float edge1 = min(1.0, uThreshold + uFeather);
		if (edge1 <= edge0 + 0.0001) {
			keepMask = step(uThreshold, distanceNormalized);
		} else {
			keepMask = smoothstep(edge0, edge1, distanceNormalized);
		}
	}

	float keyedAlpha = alpha * keepMask;
	fragColor = vec4(rgb * keyedAlpha, keyedAlpha);
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
		throw new Error(`Color key shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Color key program link failed: ${log ?? '(no log)'}`);
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

const setupColorKey = (target: HTMLCanvasElement): ColorKeyState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('color key effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, COLOR_KEY_VS, COLOR_KEY_FS);

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
			uKeyColor: gl.getUniformLocation(program, 'uKeyColor'),
			uThreshold: gl.getUniformLocation(program, 'uThreshold'),
			uFeather: gl.getUniformLocation(program, 'uFeather'),
		},
		colorCtx,
		cachedColor: '',
		cachedColorRgba: [0, 255, 0, 255],
	};
};

const parseKeyColor = (
	state: ColorKeyState,
	color: string,
): readonly [number, number, number] => {
	if (state.cachedColor !== color) {
		state.cachedColor = color;
		state.cachedColorRgba = parseColorRgba(state.colorCtx, color);
	}

	const [r, g, b, a] = state.cachedColorRgba;
	if (a <= 0) {
		return [0, 0, 0];
	}

	const alpha = a / 255;
	return [
		Math.min(1, r / 255 / alpha),
		Math.min(1, g / 255 / alpha),
		Math.min(1, b / 255 / alpha),
	];
};

export const colorKey = createEffect<ColorKeyParams, ColorKeyState>({
	type: 'remotion/color-key',
	label: 'colorKey()',
	documentationLink: 'https://www.remotion.dev/docs/effects/color-key',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `color-key-${r.color}-${r.threshold}-${r.feather}`;
	},
	setup: (target) => setupColorKey(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const keyColor = parseKeyColor(state, r.color);
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
		if (uniforms.uKeyColor)
			gl.uniform3f(uniforms.uKeyColor, keyColor[0], keyColor[1], keyColor[2]);
		if (uniforms.uThreshold) gl.uniform1f(uniforms.uThreshold, r.threshold);
		if (uniforms.uFeather) gl.uniform1f(uniforms.uFeather, r.feather);

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
	schema: colorKeySchema,
	validateParams: validateColorKeyParams,
});
