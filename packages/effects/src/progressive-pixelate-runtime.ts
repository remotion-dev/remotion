import {Internals} from 'remotion';

const {createWebGL2ContextError} = Internals;

export type ProgressivePixelateUniforms = {
	readonly uSource: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
	readonly uMode: WebGLUniformLocation | null;
	readonly uStart: WebGLUniformLocation | null;
	readonly uEnd: WebGLUniformLocation | null;
	readonly uCenter: WebGLUniformLocation | null;
	readonly uWidth: WebGLUniformLocation | null;
	readonly uHeight: WebGLUniformLocation | null;
	readonly uRotation: WebGLUniformLocation | null;
	readonly uRadialStart: WebGLUniformLocation | null;
	readonly uStartBlockSize: WebGLUniformLocation | null;
	readonly uEndBlockSize: WebGLUniformLocation | null;
};

export type ProgressivePixelateState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uniforms: ProgressivePixelateUniforms;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec2 aUv;
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
uniform vec2 uResolution;
uniform int uMode;
uniform vec2 uStart;
uniform vec2 uEnd;
uniform vec2 uCenter;
uniform float uWidth;
uniform float uHeight;
uniform float uRotation;
uniform float uRadialStart;
uniform float uStartBlockSize;
uniform float uEndBlockSize;

float linearProgress(vec2 uv) {
	vec2 gradient = uEnd - uStart;
	float gradientLengthSq = dot(gradient, gradient);
	if (gradientLengthSq <= 0.0000001) {
		return 0.0;
	}

	return clamp(dot(uv - uStart, gradient) / gradientLengthSq, 0.0, 1.0);
}

float radialProgress(vec2 uv) {
	vec2 radii = vec2(uWidth * uResolution.x, uHeight * uResolution.y) * 0.5;
	if (radii.x <= 0.0000001 || radii.y <= 0.0000001) {
		return 0.0;
	}

	vec2 delta = (uv - uCenter) * uResolution;
	float angle = radians(uRotation);
	float c = cos(angle);
	float s = sin(angle);
	vec2 local = vec2(
		c * delta.x + s * delta.y,
		-s * delta.x + c * delta.y
	);
	float ellipseProgress = clamp(length(local / radii), 0.0, 1.0);
	float distance = 1.0 - uRadialStart;
	return abs(distance) <= 0.0000001
		? step(uRadialStart, ellipseProgress)
		: clamp((ellipseProgress - uRadialStart) / distance, 0.0, 1.0);
}

vec4 samplePixelated(float blockSize) {
	vec2 pixelSizeUv = vec2(blockSize) / uResolution;
	vec2 blockUv = floor(vUv / pixelSizeUv) * pixelSizeUv + pixelSizeUv * 0.5;
	return texture(uSource, blockUv);
}

void main() {
	// Public UV coordinates use top-left origin, matching canvas/CSS coordinates.
	vec2 publicUv = vec2(vUv.x, 1.0 - vUv.y);
	float progress = uMode == 0
		? linearProgress(publicUv)
		: radialProgress(publicUv);
	float targetBlockSize = max(
		1.0,
		mix(uStartBlockSize, uEndBlockSize, progress)
	);

	// Adjacent power-of-two grids remain aligned as the block size changes.
	float level = log2(targetBlockSize);
	float lowerBlockSize = exp2(floor(level));
	float upperBlockSize = lowerBlockSize * 2.0;
	float levelProgress = fract(level);
	fragColor = mix(
		samplePixelated(lowerBlockSize),
		samplePixelated(upperBlockSize),
		levelProgress
	);
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
		throw new Error(
			`Progressive pixelate shader compile failed: ${log ?? '(no log)'}`,
		);
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
		throw new Error(
			`Progressive pixelate program link failed: ${log ?? '(no log)'}`,
		);
	}

	return program;
};

export const setupProgressivePixelate = (
	target: HTMLCanvasElement,
): ProgressivePixelateState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('progressive pixelate effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
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
	const data = new Float32Array([
		-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
	]);
	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create WebGL buffer');
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
	gl.bindVertexArray(null);

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

	return {
		gl,
		program,
		vao,
		vbo,
		texture,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uResolution: gl.getUniformLocation(program, 'uResolution'),
			uMode: gl.getUniformLocation(program, 'uMode'),
			uStart: gl.getUniformLocation(program, 'uStart'),
			uEnd: gl.getUniformLocation(program, 'uEnd'),
			uCenter: gl.getUniformLocation(program, 'uCenter'),
			uWidth: gl.getUniformLocation(program, 'uWidth'),
			uHeight: gl.getUniformLocation(program, 'uHeight'),
			uRotation: gl.getUniformLocation(program, 'uRotation'),
			uRadialStart: gl.getUniformLocation(program, 'uRadialStart'),
			uStartBlockSize: gl.getUniformLocation(program, 'uStartBlockSize'),
			uEndBlockSize: gl.getUniformLocation(program, 'uEndBlockSize'),
		},
	};
};

export const prepareProgressivePixelate = ({
	state,
	source,
	width,
	height,
	flipSourceY,
}: {
	readonly state: ProgressivePixelateState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly flipSourceY: boolean;
}): void => {
	const {gl, uniforms} = state;
	gl.viewport(0, 0, width, height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, state.texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		source as TexImageSource,
	);
	gl.useProgram(state.program);
	if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
	if (uniforms.uResolution) gl.uniform2f(uniforms.uResolution, width, height);
};

export const drawProgressivePixelate = (
	state: ProgressivePixelateState,
): void => {
	const {gl} = state;
	gl.bindVertexArray(state.vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};

export const cleanupProgressivePixelate = ({
	gl,
	program,
	vao,
	vbo,
	texture,
}: ProgressivePixelateState): void => {
	gl.deleteTexture(texture);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
};
