import {Internals, type InteractivitySchema} from 'remotion';
import {assertOptionalFiniteNumber} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_PROGRESS = 0.5 as const;
const DEFAULT_ANGLE = 0 as const;
const DEFAULT_ROTATION = 20 as const;
const DEFAULT_JAGGEDNESS = 20 as const;
const MESH_ROWS = 192;

const tearSchema = {
	progress: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: DEFAULT_PROGRESS,
		description: 'Progress',
		hiddenFromList: false,
	},
	angle: {
		type: 'number',
		step: 1,
		default: DEFAULT_ANGLE,
		description: 'Angle',
		hiddenFromList: false,
	},
	rotation: {
		type: 'number',
		min: 0,
		max: 90,
		step: 1,
		default: DEFAULT_ROTATION,
		description: 'Rotation',
		hiddenFromList: false,
	},
	jaggedness: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_JAGGEDNESS,
		description: 'Jaggedness',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type TearParams = {
	/** Tear progress: 0 is intact, 1 reaches the opposite edge, and values above 1 move the pieces farther apart. Defaults to 0.5. */
	readonly progress?: number;
	/** Rip direction in degrees: 0 top-to-bottom, 90 left-to-right. Defaults to 0. */
	readonly angle?: number;
	/** Maximum outward rotation in degrees, between 0 and 90. Defaults to 20. */
	readonly rotation?: number;
	/** Zigzag amplitude in pixels. Use 0 for a straight seam. Defaults to 20. */
	readonly jaggedness?: number;
};

const resolve = (p: TearParams) => ({
	progress: p.progress ?? DEFAULT_PROGRESS,
	angle: p.angle ?? DEFAULT_ANGLE,
	rotation: p.rotation ?? DEFAULT_ROTATION,
	jaggedness: p.jaggedness ?? DEFAULT_JAGGEDNESS,
});

const validateTearParams = (params: TearParams): void => {
	assertEffectParamsObject(params, 'Tear');
	assertOptionalFiniteNumber(params.progress, 'progress');
	assertOptionalFiniteNumber(params.angle, 'angle');
	assertOptionalFiniteNumber(params.rotation, 'rotation');
	assertOptionalFiniteNumber(params.jaggedness, 'jaggedness');
	const r = resolve(params);
	if (r.progress < 0) {
		throw new Error('"progress" must be >= 0');
	}

	if (r.rotation < 0 || r.rotation > 90) {
		throw new Error('"rotation" must be between 0 and 90');
	}

	if (r.jaggedness < 0) {
		throw new Error('"jaggedness" must be >= 0');
	}
};

type TearState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uAngle: WebGLUniformLocation | null;
	readonly uProgress: WebGLUniformLocation | null;
	readonly uRotation: WebGLUniformLocation | null;
	readonly uJaggedness: WebGLUniformLocation | null;
	readonly uSide: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
uniform vec2 uResolution;
uniform float uAngle;
uniform float uProgress;
uniform float uRotation;
uniform float uJaggedness;
uniform float uSide;

float seam(float y, float width) {
	// Six zigzags, with matching edges on both pieces. Limit the amplitude
	// to keep the tear inside the source, even on very narrow canvases.
	float zigzag = 1.0 - 4.0 * abs(fract(y * 6.0 + 0.25) - 0.5);
	return width * 0.5 + zigzag * min(uJaggedness, width * 0.45);
}

void main() {
	// Work in a rectangle aligned with the rip, large enough to cover the
	// original canvas at every angle. Rotate UVs back to the source so the
	// image itself keeps its orientation.
	float direction = radians(uAngle);
	float dc = cos(direction);
	float ds = sin(direction);
	mat2 toCanvas = mat2(dc, -ds, ds, dc);
	vec2 extent = vec2(
		abs(dc) * uResolution.x + abs(ds) * uResolution.y,
		abs(ds) * uResolution.x + abs(dc) * uResolution.y
	);
	float outerEdge = uSide < 0.0 ? 0.0 : extent.x;
	vec2 source = vec2(mix(outerEdge, seam(aPos.y, extent.x), aPos.x), aPos.y * extent.y);
	vec2 sourceCanvas = toCanvas * (source - extent * 0.5) + uResolution * 0.5;
	vUv = vec2(sourceCanvas.x / uResolution.x, 1.0 - sourceCanvas.y / uResolution.y);

	float tearProgress = min(uProgress, 1.0);
	float tipY = tearProgress * extent.y;
	// Keep the motion independent of the jagged edge. Following the seam
	// with the pivot would rock the entire image at every zigzag.
	vec2 pivot = vec2(extent.x * 0.5, tipY);
	// The short bend near the tip joins the rotating portion continuously
	// to the untouched area below it. Work in pixels to preserve angles
	// at different aspect ratios.
	float fullAngle = radians(uRotation) * tearProgress;
	// Widen the bend for larger rotations / wider sheets so neighboring
	// rows cannot fold over each other at the outside edges.
	float bendHeight = max(extent.y * 0.15, fullAngle * extent.x * 1.5);
	float bend = smoothstep(0.0, bendHeight, tipY - source.y);
	float angle = uSide * fullAngle * bend;
	float c = cos(angle);
	float s = sin(angle);
	vec2 delta = source - pivot;
	vec2 position = pivot + vec2(c * delta.x - s * delta.y, s * delta.x + c * delta.y);
	// After the tear reaches the bottom, keep the rotation stable and
	// move each piece outward by half a canvas width per unit of progress.
	position.x += uSide * max(uProgress - 1.0, 0.0) * extent.x * 0.5;
	position = toCanvas * (position - extent * 0.5) + uResolution * 0.5;
	gl_Position = vec4(position.x / uResolution.x * 2.0 - 1.0, 1.0 - position.y / uResolution.y * 2.0, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;

void main() {
	// The rotated mesh extends beyond the original image. Those parts
	// must remain transparent instead of smearing clamped border pixels.
	if (any(lessThan(vUv, vec2(0.0))) || any(greaterThan(vUv, vec2(1.0)))) {
		discard;
	}
	fragColor = texture(uSource, vUv);
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
		throw new Error(`Tear shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Tear program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createTearState = (gl: WebGL2RenderingContext): TearState => {
	const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = linkProgram(gl, vs, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);

	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create WebGL vertex array');
	}

	gl.bindVertexArray(vao);

	const data = new Float32Array((MESH_ROWS + 1) * 4);
	for (let row = 0; row <= MESH_ROWS; row++) {
		data.set([0, row / MESH_ROWS, 1, row / MESH_ROWS], row * 4);
	}

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create WebGL buffer');
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	const aPos = gl.getAttribLocation(program, 'aPos');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 8, 0);

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

	return {
		gl,
		program,
		vao,
		vbo,
		texture,
		uSource: gl.getUniformLocation(program, 'uSource'),
		uResolution: gl.getUniformLocation(program, 'uResolution'),
		uAngle: gl.getUniformLocation(program, 'uAngle'),
		uProgress: gl.getUniformLocation(program, 'uProgress'),
		uRotation: gl.getUniformLocation(program, 'uRotation'),
		uJaggedness: gl.getUniformLocation(program, 'uJaggedness'),
		uSide: gl.getUniformLocation(program, 'uSide'),
	};
};

export const tear = createEffect<TearParams, TearState>({
	type: 'dev.remotion.effects.tear',
	label: 'tear()',
	documentationLink: 'https://www.remotion.dev/docs/effects/tear',
	backend: 'webgl2',

	calculateKey: (params) => {
		const r = resolve(params);
		return `tear-${r.progress}-${r.rotation}-${r.jaggedness}-${r.angle}`;
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			premultipliedAlpha: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) {
			throw createWebGL2ContextError('tear effect');
		}

		return createTearState(gl);
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);

		state.gl.viewport(0, 0, width, height);
		state.gl.bindFramebuffer(state.gl.FRAMEBUFFER, null);
		state.gl.clearColor(0, 0, 0, 0);
		state.gl.clear(state.gl.COLOR_BUFFER_BIT);

		state.gl.useProgram(state.program);
		state.gl.bindVertexArray(state.vao);
		state.gl.activeTexture(state.gl.TEXTURE0);
		state.gl.bindTexture(state.gl.TEXTURE_2D, state.texture);
		state.gl.pixelStorei(state.gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		state.gl.pixelStorei(state.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		state.gl.texImage2D(
			state.gl.TEXTURE_2D,
			0,
			state.gl.RGBA,
			state.gl.RGBA,
			state.gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		if (state.uSource) state.gl.uniform1i(state.uSource, 0);
		if (state.uAngle) state.gl.uniform1f(state.uAngle, r.angle % 360);
		if (state.uProgress) state.gl.uniform1f(state.uProgress, r.progress);
		if (state.uRotation) state.gl.uniform1f(state.uRotation, r.rotation);
		if (state.uJaggedness) state.gl.uniform1f(state.uJaggedness, r.jaggedness);
		if (state.uResolution) state.gl.uniform2f(state.uResolution, width, height);

		for (const side of [-1, 1]) {
			if (state.uSide) state.gl.uniform1f(state.uSide, side);
			state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, (MESH_ROWS + 1) * 2);
		}

		state.gl.bindVertexArray(null);
		state.gl.bindTexture(state.gl.TEXTURE_2D, null);
		state.gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},

	schema: tearSchema,
	validateParams: validateTearParams,
});
