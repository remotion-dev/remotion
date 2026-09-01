import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	COLOR_SPACE_GLSL,
	WHITE_BALANCE_GLSL,
} from './color-correction-shader-utils.js';
import {
	assertOptionalFiniteNumber,
	validateSignedUnitInterval,
} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_TEMPERATURE = 0 as const;
const DEFAULT_TINT = 0 as const;

const whiteBalanceSchema = {
	temperature: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: DEFAULT_TEMPERATURE,
		description: 'Temperature',
		hiddenFromList: false,
	},
	tint: {
		type: 'number',
		min: -1,
		max: 1,
		step: 0.01,
		default: DEFAULT_TINT,
		description: 'Tint',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type WhiteBalanceParams = {
	/** Blue-to-amber temperature adjustment from `-1` to `1`. Defaults to `0`. */
	readonly temperature?: number;
	/** Green-to-magenta tint adjustment from `-1` to `1`. Defaults to `0`. */
	readonly tint?: number;
};

type WhiteBalanceResolved = {
	temperature: number;
	tint: number;
};

type WhiteBalanceState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uTemperature: WebGLUniformLocation | null;
		readonly uTint: WebGLUniformLocation | null;
	};
};

const resolve = (params: WhiteBalanceParams): WhiteBalanceResolved => ({
	temperature: params.temperature ?? DEFAULT_TEMPERATURE,
	tint: params.tint ?? DEFAULT_TINT,
});

const validateWhiteBalanceParams = (params: WhiteBalanceParams): void => {
	assertEffectParamsObject(params, 'White balance');
	assertOptionalFiniteNumber(params.temperature, 'temperature');
	assertOptionalFiniteNumber(params.tint, 'tint');

	const {temperature, tint} = resolve(params);
	validateSignedUnitInterval(temperature, 'temperature');
	validateSignedUnitInterval(tint, 'tint');
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
	vUv = aUv;
	gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform float uTemperature;
uniform float uTint;

${COLOR_SPACE_GLSL}
${WHITE_BALANCE_GLSL}

void main() {
	vec4 sourceColor = texture(uSource, vUv);
	float alpha = sourceColor.a;

	if (alpha <= 0.0) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 unpremultiplied = sourceColor.rgb / alpha;
	vec3 linear = srgbToLinear(unpremultiplied);
	vec3 balanced = applyWhiteBalanceLinear(linear, uTemperature, uTint);
	vec3 corrected = linearToSrgb(balanced);

	fragColor = vec4(corrected * alpha, alpha);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create white balance shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(
			`White balance shader compile failed: ${log ?? '(no log)'}`,
		);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create white balance shader program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`White balance shader link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create white balance texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const setupWhiteBalance = (target: HTMLCanvasElement): WhiteBalanceState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('white balance effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl);
	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create white balance vertex array');
	}

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create white balance vertex buffer');
	}

	gl.bindVertexArray(vao);
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

	return {
		gl,
		program,
		vao,
		vbo,
		textureSource: createTexture(gl),
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uTemperature: gl.getUniformLocation(program, 'uTemperature'),
			uTint: gl.getUniformLocation(program, 'uTint'),
		},
	};
};

export const whiteBalance = createEffect<WhiteBalanceParams, WhiteBalanceState>(
	{
		type: 'remotion/white-balance',
		label: 'whiteBalance()',
		documentationLink: 'https://www.remotion.dev/docs/effects/white-balance',
		backend: 'webgl2',
		calculateKey: (params) => {
			const {temperature, tint} = resolve(params);
			return `white-balance-${temperature}-${tint}`;
		},
		setup: setupWhiteBalance,
		apply: ({source, width, height, params, state, flipSourceY}) => {
			const {temperature, tint} = resolve(params);
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
			if (uniforms.uTemperature) {
				gl.uniform1f(uniforms.uTemperature, temperature);
			}

			if (uniforms.uTint) gl.uniform1f(uniforms.uTint, tint);
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
		schema: whiteBalanceSchema,
		validateParams: validateWhiteBalanceParams,
	},
);
