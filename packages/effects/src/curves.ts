import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	colorAmountSchema,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertRequiredFiniteNumber,
} from './validate-effect-param.js';

const {createEffect, createCurveSampler, createWebGL2ContextError} = Internals;

const DEFAULT_POINTS = [
	[0, 0],
	[1, 1],
] as const;
const DEFAULT_CHANNEL = 'rgb' as const;
const DEFAULT_INTERPOLATION = 'smooth' as const;
const DEFAULT_AMOUNT = 1 as const;
const MAX_POINTS = 32;
const LUT_SIZE = 1024;
const CURVES_CHANNELS = ['rgb', 'red', 'green', 'blue'] as const;
const CURVES_INTERPOLATIONS = ['smooth', 'linear'] as const;

export type CurvesPoint = readonly [number, number];
export type CurvesChannel = (typeof CURVES_CHANNELS)[number];
export type CurvesInterpolation = (typeof CURVES_INTERPOLATIONS)[number];

export type CurvesParams = {
	/** Input/output pairs in the range `0` to `1`, sorted by input. Defaults to `[[0, 0], [1, 1]]`. */
	readonly points?: readonly CurvesPoint[];
	/** Color channels to adjust. Defaults to `"rgb"`. */
	readonly channel?: CurvesChannel;
	/** How points are connected. Defaults to `"smooth"`. */
	readonly interpolation?: CurvesInterpolation;
	/** Blend between the original and corrected image, from `0` to `1`. Defaults to `1`. */
	readonly amount?: number;
};

export const curvesSchema = {
	channel: {
		type: 'enum',
		variants: {rgb: {}, red: {}, green: {}, blue: {}},
		default: DEFAULT_CHANNEL,
		description: 'Channel',
	},
	points: {
		type: 'array',
		item: {type: 'uv-coordinate', min: 0, max: 1, step: 0.001},
		default: DEFAULT_POINTS,
		minLength: 2,
		maxLength: MAX_POINTS,
		newItemDefault: [0.5, 0.5],
		description: 'Points',
		keyframable: false,
	},
	interpolation: {
		type: 'enum',
		variants: {smooth: {}, linear: {}},
		default: DEFAULT_INTERPOLATION,
		description: 'Interpolation',
	},
	amount: colorAmountSchema,
} as const satisfies InteractivitySchema;

type CurvesResolved = {
	readonly points: readonly CurvesPoint[];
	readonly channel: CurvesChannel;
	readonly interpolation: CurvesInterpolation;
	readonly amount: number;
};

const resolve = (params: CurvesParams): CurvesResolved => ({
	points: params.points ?? DEFAULT_POINTS,
	channel: params.channel ?? DEFAULT_CHANNEL,
	interpolation: params.interpolation ?? DEFAULT_INTERPOLATION,
	amount: params.amount ?? DEFAULT_AMOUNT,
});

const validateCurvesParams = (params: CurvesParams): void => {
	assertEffectParamsObject(params, 'Curves');
	assertOptionalFiniteNumber(params.amount, 'amount');
	validateUnitInterval(params.amount ?? DEFAULT_AMOUNT, 'amount');
	if (
		params.channel !== undefined &&
		!CURVES_CHANNELS.includes(params.channel)
	) {
		throw new TypeError(
			`"channel" must be "rgb", "red", "green" or "blue", but got ${JSON.stringify(params.channel)}`,
		);
	}

	if (
		params.interpolation !== undefined &&
		!CURVES_INTERPOLATIONS.includes(params.interpolation)
	) {
		throw new TypeError(
			`"interpolation" must be "smooth" or "linear", but got ${JSON.stringify(params.interpolation)}`,
		);
	}

	if (params.points === undefined) return;
	if (
		!Array.isArray(params.points) ||
		params.points.length < 2 ||
		params.points.length > MAX_POINTS
	) {
		throw new TypeError(
			`"points" must be an array of 2 to ${MAX_POINTS} input/output pairs`,
		);
	}

	for (let index = 0; index < params.points.length; index++) {
		const point = params.points[index];
		if (!Array.isArray(point) || point.length !== 2) {
			throw new TypeError(`"points[${index}]" must be an [input, output] pair`);
		}

		assertRequiredFiniteNumber(point[0], `points[${index}][0]`);
		assertRequiredFiniteNumber(point[1], `points[${index}][1]`);
		validateUnitInterval(point[0], `points[${index}][0]`);
		validateUnitInterval(point[1], `points[${index}][1]`);
		if (index > 0 && point[0] <= params.points[index - 1][0]) {
			throw new TypeError(
				'"points" must have strictly increasing input values',
			);
		}
	}
};

type CurvesState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly curveTexture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uCurve: WebGLUniformLocation | null;
		readonly uChannel: WebGLUniformLocation | null;
		readonly uAmount: WebGLUniformLocation | null;
	};
	cachedCurveKey: string | null;
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
uniform highp sampler2D uCurve;
uniform int uChannel;
uniform float uAmount;

float sampleCurve(float inputValue) {
	float position = clamp(inputValue, 0.0, 1.0) * float(${LUT_SIZE - 1});
	int lower = int(floor(position));
	int upper = min(lower + 1, ${LUT_SIZE - 1});
	return mix(
		texelFetch(uCurve, ivec2(lower, 0), 0).r,
		texelFetch(uCurve, ivec2(upper, 0), 0).r,
		fract(position)
	);
}

void main() {
	vec4 sourceColor = texture(uSource, vUv);
	float alpha = sourceColor.a;
	if (alpha <= 0.0) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 color = sourceColor.rgb / alpha;
	vec3 corrected = color;
	if (uChannel == 0 || uChannel == 1) corrected.r = sampleCurve(color.r);
	if (uChannel == 0 || uChannel == 2) corrected.g = sampleCurve(color.g);
	if (uChannel == 0 || uChannel == 3) corrected.b = sampleCurve(color.b);
	fragColor = vec4(mix(color, corrected, uAmount) * alpha, alpha);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) throw new Error('Failed to create curves shader');
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Curves shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const createTexture = (
	gl: WebGL2RenderingContext,
	filter: number,
): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) throw new Error('Failed to create curves texture');
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

export const curves = createEffect<CurvesParams, CurvesState>({
	type: 'remotion/curves',
	label: 'curves()',
	documentationLink: 'https://www.remotion.dev/docs/effects/curves',
	backend: 'webgl2',
	calculateKey: (params) => {
		const {points, channel, interpolation, amount} = resolve(params);
		return `curves-${JSON.stringify(points)}-${channel}-${interpolation}-${amount}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) throw createWebGL2ContextError('curves effect');

		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fragmentShader = compileShader(
			gl,
			gl.FRAGMENT_SHADER,
			FRAGMENT_SHADER,
		);
		const program = gl.createProgram();
		if (!program) throw new Error('Failed to create curves shader program');
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const log = gl.getProgramInfoLog(program);
			gl.deleteProgram(program);
			throw new Error(`Curves shader link failed: ${log ?? '(no log)'}`);
		}

		const vao = gl.createVertexArray();
		if (!vao) throw new Error('Failed to create curves vertex array');
		const vbo = gl.createBuffer();
		if (!vbo) throw new Error('Failed to create curves vertex buffer');
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
			sourceTexture: createTexture(gl, gl.LINEAR),
			curveTexture: createTexture(gl, gl.NEAREST),
			uniforms: {
				uSource: gl.getUniformLocation(program, 'uSource'),
				uCurve: gl.getUniformLocation(program, 'uCurve'),
				uChannel: gl.getUniformLocation(program, 'uChannel'),
				uAmount: gl.getUniformLocation(program, 'uAmount'),
			},
			cachedCurveKey: null,
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const {points, channel, interpolation, amount} = resolve(params);
		const {gl, program, sourceTexture, curveTexture, uniforms, vao} = state;
		const curveKey = `${interpolation}-${JSON.stringify(points)}`;
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, curveTexture);
		if (state.cachedCurveKey !== curveKey) {
			const sample = createCurveSampler(points, interpolation);
			const data = new Float32Array(LUT_SIZE);
			for (let index = 0; index < LUT_SIZE; index++) {
				data[index] = sample(index / (LUT_SIZE - 1));
			}

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.R32F,
				LUT_SIZE,
				1,
				0,
				gl.RED,
				gl.FLOAT,
				data,
			);
			state.cachedCurveKey = curveKey;
		}

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
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
		if (uniforms.uCurve) gl.uniform1i(uniforms.uCurve, 1);
		if (uniforms.uChannel)
			gl.uniform1i(uniforms.uChannel, CURVES_CHANNELS.indexOf(channel));
		if (uniforms.uAmount) gl.uniform1f(uniforms.uAmount, amount);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, sourceTexture, curveTexture}) => {
		gl.deleteTexture(sourceTexture);
		gl.deleteTexture(curveTexture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: curvesSchema,
	validateParams: validateCurvesParams,
});
