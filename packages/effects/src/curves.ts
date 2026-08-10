import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const MIN_CURVE_POINTS = 2 as const;
const MAX_CURVE_POINTS = 16 as const;
const IDENTITY_CURVE = [
	[0, 0],
	[1, 1],
] as const;

const curveSchema = (description: string) =>
	({
		type: 'array',
		item: {
			type: 'uv-coordinate',
			min: 0,
			max: 1,
			step: 0.01,
		},
		default: IDENTITY_CURVE,
		minLength: MIN_CURVE_POINTS,
		maxLength: MAX_CURVE_POINTS,
		newItemDefault: [0.5, 0.5],
		description,
		keyframable: false,
	}) as const;

const curvesSchema = {
	rgb: curveSchema('RGB curve'),
	red: curveSchema('Red curve'),
	green: curveSchema('Green curve'),
	blue: curveSchema('Blue curve'),
} as const satisfies InteractivitySchema;

export type CurvePoint = readonly [input: number, output: number];

export type CurvesParams = {
	/** Master RGB curve. Defaults to an identity curve. */
	readonly rgb?: readonly CurvePoint[];
	/** Red channel curve. Defaults to an identity curve. */
	readonly red?: readonly CurvePoint[];
	/** Green channel curve. Defaults to an identity curve. */
	readonly green?: readonly CurvePoint[];
	/** Blue channel curve. Defaults to an identity curve. */
	readonly blue?: readonly CurvePoint[];
};

type CurvesResolved = {
	rgb: readonly CurvePoint[];
	red: readonly CurvePoint[];
	green: readonly CurvePoint[];
	blue: readonly CurvePoint[];
};

type CurvesState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uRgbCurve: WebGLUniformLocation | null;
		readonly uRgbCount: WebGLUniformLocation | null;
		readonly uRedCurve: WebGLUniformLocation | null;
		readonly uRedCount: WebGLUniformLocation | null;
		readonly uGreenCurve: WebGLUniformLocation | null;
		readonly uGreenCount: WebGLUniformLocation | null;
		readonly uBlueCurve: WebGLUniformLocation | null;
		readonly uBlueCount: WebGLUniformLocation | null;
	};
};

const resolve = (params: CurvesParams): CurvesResolved => ({
	rgb: params.rgb ?? IDENTITY_CURVE,
	red: params.red ?? IDENTITY_CURVE,
	green: params.green ?? IDENTITY_CURVE,
	blue: params.blue ?? IDENTITY_CURVE,
});

const validateCurve = (curve: unknown, name: string): void => {
	if (!Array.isArray(curve)) {
		throw new TypeError(
			`"${name}" must be an array of curve points, but got ${JSON.stringify(curve)}`,
		);
	}

	if (curve.length < MIN_CURVE_POINTS) {
		throw new TypeError(
			`"${name}" must have at least ${MIN_CURVE_POINTS} points, but got ${curve.length}`,
		);
	}

	if (curve.length > MAX_CURVE_POINTS) {
		throw new TypeError(
			`"${name}" must have at most ${MAX_CURVE_POINTS} points, but got ${curve.length}`,
		);
	}

	let previousInput = -1;
	for (let index = 0; index < curve.length; index++) {
		const point = curve[index];
		if (!Array.isArray(point) || point.length !== 2) {
			throw new TypeError(
				`"${name}[${index}]" must be an [input, output] tuple, but got ${JSON.stringify(point)}`,
			);
		}

		const [input, output] = point;
		if (typeof input !== 'number' || !Number.isFinite(input)) {
			throw new TypeError(
				`"${name}[${index}][0]" must be a finite number, but got ${JSON.stringify(input)}`,
			);
		}

		if (typeof output !== 'number' || !Number.isFinite(output)) {
			throw new TypeError(
				`"${name}[${index}][1]" must be a finite number, but got ${JSON.stringify(output)}`,
			);
		}

		if (input < 0 || input > 1) {
			throw new TypeError(
				`"${name}[${index}][0]" must be between 0 and 1, but got ${JSON.stringify(input)}`,
			);
		}

		if (output < 0 || output > 1) {
			throw new TypeError(
				`"${name}[${index}][1]" must be between 0 and 1, but got ${JSON.stringify(output)}`,
			);
		}

		if (input <= previousInput) {
			throw new TypeError(
				`"${name}" point input values must be strictly increasing, but got ${JSON.stringify(input)} after ${JSON.stringify(previousInput)}`,
			);
		}

		previousInput = input;
	}
};

const validateCurvesParams = (params: CurvesParams): void => {
	assertEffectParamsObject(params, 'Curves');
	const {rgb, red, green, blue} = resolve(params);
	validateCurve(rgb, 'rgb');
	validateCurve(red, 'red');
	validateCurve(green, 'green');
	validateCurve(blue, 'blue');
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

#define MAX_CURVE_POINTS 16

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec2 uRgbCurve[MAX_CURVE_POINTS];
uniform int uRgbCount;
uniform vec2 uRedCurve[MAX_CURVE_POINTS];
uniform int uRedCount;
uniform vec2 uGreenCurve[MAX_CURVE_POINTS];
uniform int uGreenCount;
uniform vec2 uBlueCurve[MAX_CURVE_POINTS];
uniform int uBlueCount;

vec2 getCurvePoint(int curve, int index) {
	if (curve == 0) return uRgbCurve[index];
	if (curve == 1) return uRedCurve[index];
	if (curve == 2) return uGreenCurve[index];
	return uBlueCurve[index];
}

float sampleCurve(float value, int curve, int count) {
	vec2 firstPoint = getCurvePoint(curve, 0);
	if (value <= firstPoint.x) return firstPoint.y;

	vec2 previousPoint = firstPoint;
	for (int index = 1; index < MAX_CURVE_POINTS; index++) {
		if (index >= count) break;

		vec2 point = getCurvePoint(curve, index);
		if (value <= point.x) {
			float progress = (value - previousPoint.x) /
				(point.x - previousPoint.x);
			return mix(previousPoint.y, point.y, progress);
		}

		previousPoint = point;
	}

	return previousPoint.y;
}

void main() {
	vec4 sourceColor = texture(uSource, vUv);
	float alpha = sourceColor.a;

	if (alpha <= 0.0) {
		fragColor = vec4(0.0);
		return;
	}

	vec3 color = sourceColor.rgb / alpha;
	vec3 master = vec3(
		sampleCurve(color.r, 0, uRgbCount),
		sampleCurve(color.g, 0, uRgbCount),
		sampleCurve(color.b, 0, uRgbCount)
	);
	vec3 corrected = vec3(
		sampleCurve(master.r, 1, uRedCount),
		sampleCurve(master.g, 2, uGreenCount),
		sampleCurve(master.b, 3, uBlueCount)
	);

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
		throw new Error('Failed to create curves shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Curves shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create curves shader program');
	}

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

	return program;
};

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create curves texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const setupCurves = (target: HTMLCanvasElement): CurvesState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('curves effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl);
	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create curves vertex array');
	}

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create curves vertex buffer');
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
			uRgbCurve: gl.getUniformLocation(program, 'uRgbCurve[0]'),
			uRgbCount: gl.getUniformLocation(program, 'uRgbCount'),
			uRedCurve: gl.getUniformLocation(program, 'uRedCurve[0]'),
			uRedCount: gl.getUniformLocation(program, 'uRedCount'),
			uGreenCurve: gl.getUniformLocation(program, 'uGreenCurve[0]'),
			uGreenCount: gl.getUniformLocation(program, 'uGreenCount'),
			uBlueCurve: gl.getUniformLocation(program, 'uBlueCurve[0]'),
			uBlueCount: gl.getUniformLocation(program, 'uBlueCount'),
		},
	};
};

const flattenCurve = (curve: readonly CurvePoint[]): Float32Array => {
	const flattened = new Float32Array(curve.length * 2);
	for (let index = 0; index < curve.length; index++) {
		flattened[index * 2] = curve[index][0];
		flattened[index * 2 + 1] = curve[index][1];
	}

	return flattened;
};

export const curves = createEffect<CurvesParams, CurvesState>({
	type: 'remotion/curves',
	label: 'curves()',
	documentationLink: 'https://www.remotion.dev/docs/effects/curves',
	backend: 'webgl2',
	calculateKey: (params) => {
		const {rgb, red, green, blue} = resolve(params);
		return `curves-${JSON.stringify([rgb, red, green, blue])}`;
	},
	setup: setupCurves,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const {rgb, red, green, blue} = resolve(params);
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

		if (uniforms.uRgbCurve)
			gl.uniform2fv(uniforms.uRgbCurve, flattenCurve(rgb));
		if (uniforms.uRgbCount) gl.uniform1i(uniforms.uRgbCount, rgb.length);

		if (uniforms.uRedCurve)
			gl.uniform2fv(uniforms.uRedCurve, flattenCurve(red));
		if (uniforms.uRedCount) gl.uniform1i(uniforms.uRedCount, red.length);

		if (uniforms.uGreenCurve) {
			gl.uniform2fv(uniforms.uGreenCurve, flattenCurve(green));
		}

		if (uniforms.uGreenCount) gl.uniform1i(uniforms.uGreenCount, green.length);

		if (uniforms.uBlueCurve) {
			gl.uniform2fv(uniforms.uBlueCurve, flattenCurve(blue));
		}

		if (uniforms.uBlueCount) gl.uniform1i(uniforms.uBlueCount, blue.length);

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
	schema: curvesSchema,
	validateParams: validateCurvesParams,
});
