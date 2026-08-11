import {Internals} from 'remotion';
import {publicUvToShaderUv} from '../uv-coordinate.js';
import {FISHEYE_FS, FISHEYE_VS} from './fisheye-shaders.js';

const {createWebGL2ContextError} = Internals;

export type FisheyeState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	textureSource: WebGLTexture;
	uniforms: {
		uSource: WebGLUniformLocation | null;
		uCenter: WebGLUniformLocation | null;
		uFieldOfView: WebGLUniformLocation | null;
		uRadius: WebGLUniformLocation | null;
		uZoom: WebGLUniformLocation | null;
		uAspect: WebGLUniformLocation | null;
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

export const setupFisheye = (target: HTMLCanvasElement): FisheyeState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('fisheye effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, FISHEYE_VS, FISHEYE_FS);

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
			uCenter: gl.getUniformLocation(program, 'uCenter'),
			uFieldOfView: gl.getUniformLocation(program, 'uFieldOfView'),
			uRadius: gl.getUniformLocation(program, 'uRadius'),
			uZoom: gl.getUniformLocation(program, 'uZoom'),
			uAspect: gl.getUniformLocation(program, 'uAspect'),
		},
	};
};

export const cleanupFisheye = (state: FisheyeState): void => {
	const {gl, program, vao, vbo, textureSource} = state;
	gl.deleteTexture(textureSource);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
};

const drawFullscreenQuad = (state: FisheyeState): void => {
	const {gl, vao} = state;
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
};

export const applyFisheye = ({
	state,
	source,
	width,
	height,
	center,
	fieldOfView,
	radius,
	zoom,
	flipSourceY,
}: {
	readonly state: FisheyeState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly center: readonly [number, number];
	readonly fieldOfView: number;
	readonly radius: number;
	readonly zoom: number;
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
	if (uniforms.uCenter) {
		const shaderCenter = publicUvToShaderUv(center);
		gl.uniform2f(uniforms.uCenter, shaderCenter[0], shaderCenter[1]);
	}

	if (uniforms.uFieldOfView) gl.uniform1f(uniforms.uFieldOfView, fieldOfView);
	if (uniforms.uRadius) gl.uniform1f(uniforms.uRadius, radius);
	if (uniforms.uZoom) gl.uniform1f(uniforms.uZoom, zoom);
	if (uniforms.uAspect) gl.uniform1f(uniforms.uAspect, width / height);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	drawFullscreenQuad(state);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};
