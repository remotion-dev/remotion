import {BLUR_VS} from './blur-shaders.js';

// Shared WebGL2 plumbing for the separable Gaussian blur passes.
// `setupBlur` compiles a fullscreen-quad VS + the supplied FS, allocates
// the quad VBO/VAO, and creates a sampling texture. `applyBlur` uploads
// the source into the sampling texture, sets uniforms, and draws.

export type BlurState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	texture: WebGLTexture;
	uRadius: WebGLUniformLocation | null;
	uTexelSize: WebGLUniformLocation | null;
	uSource: WebGLUniformLocation | null;
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
		throw new Error(`Shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

export const setupBlur = (
	target: HTMLCanvasElement,
	fragmentSource: string,
): BlurState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw new Error('Failed to acquire WebGL2 context for blur effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	// Align DOM image/video rows with texture coords used by the fullscreen quad.
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	const vs = compileShader(gl, gl.VERTEX_SHADER, BLUR_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = linkProgram(gl, vs, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);

	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create WebGL vertex array');
	}

	gl.bindVertexArray(vao);

	// Fullscreen-quad: positions in clip space + matching uv coords.
	// Using a triangle strip (4 verts) avoids an index buffer.
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

	const uRadius = gl.getUniformLocation(program, 'uRadius');
	const uTexelSize = gl.getUniformLocation(program, 'uTexelSize');
	const uSource = gl.getUniformLocation(program, 'uSource');

	return {gl, program, vao, vbo, texture, uRadius, uTexelSize, uSource};
};

export const cleanupBlur = (state: BlurState): void => {
	const {gl, program, vao, vbo, texture} = state;
	gl.deleteBuffer(vbo);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
	gl.deleteTexture(texture);
};

export const applyBlur = (
	state: BlurState,
	source: CanvasImageSource,
	width: number,
	height: number,
	radius: number,
): void => {
	const {gl, program, vao, texture, uRadius, uTexelSize, uSource} = state;

	gl.viewport(0, 0, width, height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);
	gl.bindVertexArray(vao);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		source as TexImageSource,
	);

	if (uSource) gl.uniform1i(uSource, 0);
	if (uRadius) gl.uniform1f(uRadius, radius);
	if (uTexelSize) gl.uniform2f(uTexelSize, 1 / width, 1 / height);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};
