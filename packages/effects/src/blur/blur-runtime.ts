import {Internals} from 'remotion';
import {BLUR_FS_HORIZONTAL, BLUR_FS_VERTICAL, BLUR_VS} from './blur-shaders.js';

const {createWebGL2ContextError} = Internals;

// WebGL2 separable Gaussian blur: horizontal pass renders into an intermediate
// texture (FBO), vertical pass samples that texture and draws to the canvas.
// Both passes share the same fullscreen quad (VAO/VBO).

export type BlurState = {
	gl: WebGL2RenderingContext;
	programHorizontal: WebGLProgram;
	programVertical: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	textureSource: WebGLTexture;
	textureIntermediate: WebGLTexture;
	framebuffer: WebGLFramebuffer;
	horizontal: {
		uRadius: WebGLUniformLocation | null;
		uTexelSize: WebGLUniformLocation | null;
		uSource: WebGLUniformLocation | null;
	};
	vertical: {
		uRadius: WebGLUniformLocation | null;
		uTexelSize: WebGLUniformLocation | null;
		uSource: WebGLUniformLocation | null;
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

const getBlurUniforms = (
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
): BlurState['horizontal'] => ({
	uRadius: gl.getUniformLocation(program, 'uRadius'),
	uTexelSize: gl.getUniformLocation(program, 'uTexelSize'),
	uSource: gl.getUniformLocation(program, 'uSource'),
});

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

export const setupBlur = (target: HTMLCanvasElement): BlurState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('blur effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const programHorizontal = createProgram(gl, BLUR_VS, BLUR_FS_HORIZONTAL);
	const programVertical = createProgram(gl, BLUR_VS, BLUR_FS_VERTICAL);

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
	const textureIntermediate = createRgbaTexture(gl);

	const framebuffer = gl.createFramebuffer();
	if (!framebuffer) {
		throw new Error('Failed to create WebGL framebuffer');
	}

	const w = Math.max(1, target.width);
	const h = Math.max(1, target.height);
	gl.bindTexture(gl.TEXTURE_2D, textureIntermediate);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		w,
		h,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		textureIntermediate,
		0,
	);
	const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	if (status !== gl.FRAMEBUFFER_COMPLETE) {
		throw new Error(`Blur framebuffer incomplete: 0x${status.toString(16)}`);
	}

	return {
		gl,
		programHorizontal,
		programVertical,
		vao,
		vbo,
		textureSource,
		textureIntermediate,
		framebuffer,
		horizontal: getBlurUniforms(gl, programHorizontal),
		vertical: getBlurUniforms(gl, programVertical),
	};
};

export const cleanupBlur = (state: BlurState): void => {
	const {
		gl,
		programHorizontal,
		programVertical,
		vao,
		vbo,
		textureSource,
		textureIntermediate,
		framebuffer,
	} = state;
	gl.deleteFramebuffer(framebuffer);
	gl.deleteTexture(textureSource);
	gl.deleteTexture(textureIntermediate);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(programHorizontal);
	gl.deleteProgram(programVertical);
	gl.deleteVertexArray(vao);
};

type SetBlurUniformsParams = {
	readonly gl: WebGL2RenderingContext;
	readonly uniforms: BlurState['horizontal'];
	readonly radius: number;
	readonly width: number;
	readonly height: number;
};

const setBlurUniforms = ({
	gl,
	uniforms,
	radius,
	width,
	height,
}: SetBlurUniformsParams): void => {
	if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
	if (uniforms.uRadius) gl.uniform1f(uniforms.uRadius, radius);
	if (uniforms.uTexelSize)
		gl.uniform2f(uniforms.uTexelSize, 1 / width, 1 / height);
};

const drawFullscreenQuad = (state: BlurState): void => {
	const {gl, vao} = state;
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
};

type ApplyBlurParams = {
	readonly state: BlurState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly radius: number;
	readonly horizontal: boolean;
	readonly vertical: boolean;
	readonly flipSourceY: boolean;
};

const uploadBlurSource = ({
	gl,
	textureSource,
	source,
	textureIntermediate,
	width,
	height,
	flipSourceY,
}: {
	gl: WebGL2RenderingContext;
	textureSource: WebGLTexture;
	source: CanvasImageSource;
	textureIntermediate: WebGLTexture;
	width: number;
	height: number;
	flipSourceY: boolean;
}): void => {
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

	gl.bindTexture(gl.TEXTURE_2D, textureIntermediate);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		width,
		height,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	);
	gl.bindTexture(gl.TEXTURE_2D, null);
};

export const applyBlur = ({
	state,
	source,
	width,
	height,
	radius,
	horizontal,
	vertical,
	flipSourceY,
}: ApplyBlurParams): void => {
	const {
		gl,
		programHorizontal,
		programVertical,
		textureSource,
		textureIntermediate,
		framebuffer,
	} = state;

	gl.viewport(0, 0, width, height);

	uploadBlurSource({
		gl,
		textureSource,
		source,
		textureIntermediate,
		width,
		height,
		flipSourceY,
	});

	gl.clearColor(0, 0, 0, 0);

	if (!horizontal && !vertical) {
		// Passthrough: relies on the `uRadius <= 0.0` early-out in
		// `blur-shaders.ts` to forward the source texture unchanged.
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textureSource);
		gl.useProgram(programVertical);
		setBlurUniforms({
			gl,
			uniforms: state.vertical,
			radius: 0,
			width,
			height,
		});
		drawFullscreenQuad(state);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
		return;
	}

	if (horizontal && vertical) {
		// Pass 1: horizontal blur from `textureSource` into `textureIntermediate`.
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textureSource);
		gl.useProgram(programHorizontal);
		setBlurUniforms({
			gl,
			uniforms: state.horizontal,
			radius,
			width,
			height,
		});
		drawFullscreenQuad(state);

		// Pass 2: vertical blur from `textureIntermediate` onto the default framebuffer.
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.bindTexture(gl.TEXTURE_2D, textureIntermediate);
		gl.useProgram(programVertical);
		setBlurUniforms({
			gl,
			uniforms: state.vertical,
			radius,
			width,
			height,
		});
		drawFullscreenQuad(state);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
		return;
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	gl.useProgram(horizontal ? programHorizontal : programVertical);
	setBlurUniforms({
		gl,
		uniforms: horizontal ? state.horizontal : state.vertical,
		radius,
		width,
		height,
	});
	drawFullscreenQuad(state);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};
