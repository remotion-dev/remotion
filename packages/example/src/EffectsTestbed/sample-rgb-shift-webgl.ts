import {createEffect, type InteractivitySchema} from 'remotion';

export type SampleRgbShiftWebglParams = {
	readonly amount?: number;
};

type SampleRgbShiftWebglState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uOffset: WebGLUniformLocation | null;
};

const DEFAULT_AMOUNT = 12;

const sampleRgbShiftWebglSchema = {
	amount: {
		type: 'number',
		min: 0,
		max: 80,
		step: 1,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform vec2 uOffset;

in vec2 vUv;
out vec4 fragColor;

void main() {
  vec2 redUv = clamp(vUv + uOffset, vec2(0.0), vec2(1.0));
  vec2 blueUv = clamp(vUv - uOffset, vec2(0.0), vec2(1.0));
  vec4 base = texture(uSource, vUv);
  float red = texture(uSource, redUv).r;
  float blue = texture(uSource, blueUv).b;

  fragColor = vec4(red, base.g, blue, base.a);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Could not create WebGL shader for sampleRgbShiftWebgl().');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`sampleRgbShiftWebgl() shader compile failed: ${log}`);
	}

	return shader;
};

const createProgram = (
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();
	if (!program) {
		throw new Error(
			'Could not create WebGL program for sampleRgbShiftWebgl().',
		);
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`sampleRgbShiftWebgl() program link failed: ${log}`);
	}

	return program;
};

const createTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error(
			'Could not create WebGL texture for sampleRgbShiftWebgl().',
		);
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return texture;
};

const setupSampleRgbShiftWebgl = (
	target: HTMLCanvasElement,
): SampleRgbShiftWebglState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw new Error(
			'Could not get a WebGL2 context for sampleRgbShiftWebgl().',
		);
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error(
			'Could not create WebGL vertex array for sampleRgbShiftWebgl().',
		);
	}

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Could not create WebGL buffer for sampleRgbShiftWebgl().');
	}

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

	return {
		gl,
		program,
		vao,
		vbo,
		texture: createTexture(gl),
		uSource: gl.getUniformLocation(program, 'uSource'),
		uOffset: gl.getUniformLocation(program, 'uOffset'),
	};
};

const resolve = (params: SampleRgbShiftWebglParams) => ({
	amount: params.amount ?? DEFAULT_AMOUNT,
});

export const sampleRgbShiftWebgl = createEffect<
	SampleRgbShiftWebglParams,
	SampleRgbShiftWebglState
>({
	type: 'dev.remotion.example.sampleRgbShiftWebgl',
	label: 'sampleRgbShiftWebgl()',
	documentationLink: 'https://www.remotion.dev/docs/create-effect',
	backend: 'webgl2',
	calculateKey: (params) => {
		const {amount} = resolve(params);
		return `sample-rgb-shift-webgl-${amount}`;
	},
	setup: (target) => setupSampleRgbShiftWebgl(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const {gl} = state;
		const {amount} = resolve(params);
		const offset = amount / width;

		gl.viewport(0, 0, width, height);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, state.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(state.program);
		if (state.uSource) {
			gl.uniform1i(state.uSource, 0);
		}

		if (state.uOffset) {
			gl.uniform2f(state.uOffset, offset, 0);
		}

		gl.bindVertexArray(state.vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: sampleRgbShiftWebglSchema,
	validateParams: ({amount = DEFAULT_AMOUNT}) => {
		if (
			typeof amount !== 'number' ||
			!Number.isFinite(amount) ||
			amount < 0 ||
			amount > 80
		) {
			throw new TypeError('amount must be a number between 0 and 80');
		}
	},
});
