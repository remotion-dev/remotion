import {Internals} from 'remotion';
import {MIRROR_FS, MIRROR_VS} from './mirror-shaders.js';

const {createWebGL2ContextError} = Internals;

export type MirrorDirection = 'horizontal' | 'vertical';

export type MirrorState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	textureSource: WebGLTexture;
	uniforms: {
		uSource: WebGLUniformLocation | null;
		uPosition: WebGLUniformLocation | null;
		uDirection: WebGLUniformLocation | null;
		uInvert: WebGLUniformLocation | null;
	};
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

export const setupMirror = (target: HTMLCanvasElement): MirrorState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('mirror effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, MIRROR_VS, MIRROR_FS);

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

	const textureSource = createRgbaTexture(gl);

	return {
		gl,
		program,
		vao,
		vbo,
		textureSource,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uPosition: gl.getUniformLocation(program, 'uPosition'),
			uDirection: gl.getUniformLocation(program, 'uDirection'),
			uInvert: gl.getUniformLocation(program, 'uInvert'),
		},
	};
};

export const cleanupMirror = (state: MirrorState): void => {
	const {gl, program, vao, vbo, textureSource} = state;
	gl.deleteTexture(textureSource);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
};

const drawFullscreenQuad = (state: MirrorState): void => {
	const {gl, vao} = state;
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
};

export const applyMirror = ({
	state,
	source,
	width,
	height,
	position,
	direction,
	invert,
	flipSourceY,
}: {
	readonly state: MirrorState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly position: number;
	readonly direction: MirrorDirection;
	readonly invert: boolean;
	readonly flipSourceY: boolean;
}): void => {
	const {gl, program, textureSource, uniforms} = state;

	gl.viewport(0, 0, width, height);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		source as TexImageSource,
	);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);
	if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
	if (uniforms.uPosition) gl.uniform1f(uniforms.uPosition, position);
	if (uniforms.uDirection)
		gl.uniform1i(uniforms.uDirection, direction === 'horizontal' ? 0 : 1);
	if (uniforms.uInvert) gl.uniform1i(uniforms.uInvert, invert ? 1 : 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	drawFullscreenQuad(state);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};
