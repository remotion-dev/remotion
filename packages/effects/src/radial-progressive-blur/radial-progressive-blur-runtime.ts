import {Internals} from 'remotion';
import type {RadialProgressiveBlurResolved} from './index.js';
import {
	buildRadialProgressiveBlurFs,
	RADIAL_PROGRESSIVE_BLUR_VS,
} from './radial-progressive-blur-shaders.js';

const {createWebGL2ContextError} = Internals;

type RadialProgressiveBlurUniforms = {
	readonly uSource: WebGLUniformLocation | null;
	readonly uTexelSize: WebGLUniformLocation | null;
	readonly uCenter: WebGLUniformLocation | null;
	readonly uWidth: WebGLUniformLocation | null;
	readonly uHeight: WebGLUniformLocation | null;
	readonly uRotation: WebGLUniformLocation | null;
	readonly uStart: WebGLUniformLocation | null;
	readonly uStartBlur: WebGLUniformLocation | null;
	readonly uEndBlur: WebGLUniformLocation | null;
};

export type RadialProgressiveBlurState = {
	readonly gl: WebGL2RenderingContext;
	readonly programHorizontal: WebGLProgram;
	readonly programVertical: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly textureIntermediate: WebGLTexture;
	readonly framebuffer: WebGLFramebuffer;
	readonly horizontal: RadialProgressiveBlurUniforms;
	readonly vertical: RadialProgressiveBlurUniforms;
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
		throw new Error(
			`Radial progressive blur shader compile failed: ${log ?? '(no log)'}`,
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
			`Radial progressive blur program link failed: ${log ?? '(no log)'}`,
		);
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

const getUniforms = (
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
): RadialProgressiveBlurUniforms => ({
	uSource: gl.getUniformLocation(program, 'uSource'),
	uTexelSize: gl.getUniformLocation(program, 'uTexelSize'),
	uCenter: gl.getUniformLocation(program, 'uCenter'),
	uWidth: gl.getUniformLocation(program, 'uWidth'),
	uHeight: gl.getUniformLocation(program, 'uHeight'),
	uRotation: gl.getUniformLocation(program, 'uRotation'),
	uStart: gl.getUniformLocation(program, 'uStart'),
	uStartBlur: gl.getUniformLocation(program, 'uStartBlur'),
	uEndBlur: gl.getUniformLocation(program, 'uEndBlur'),
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

export const setupRadialProgressiveBlur = (
	target: HTMLCanvasElement,
): RadialProgressiveBlurState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('radial progressive blur effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const programHorizontal = createProgram(
		gl,
		RADIAL_PROGRESSIVE_BLUR_VS,
		buildRadialProgressiveBlurFs('horizontal'),
	);
	const programVertical = createProgram(
		gl,
		RADIAL_PROGRESSIVE_BLUR_VS,
		buildRadialProgressiveBlurFs('vertical'),
	);

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
		throw new Error(
			`Radial progressive blur framebuffer incomplete: 0x${status.toString(16)}`,
		);
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
		horizontal: getUniforms(gl, programHorizontal),
		vertical: getUniforms(gl, programVertical),
	};
};

export const cleanupRadialProgressiveBlur = (
	state: RadialProgressiveBlurState,
): void => {
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

const uploadSource = ({
	gl,
	textureSource,
	textureIntermediate,
	source,
	width,
	height,
	flipSourceY,
}: {
	readonly gl: WebGL2RenderingContext;
	readonly textureSource: WebGLTexture;
	readonly textureIntermediate: WebGLTexture;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly flipSourceY: boolean;
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

const setUniforms = ({
	gl,
	uniforms,
	width,
	height,
	params,
}: {
	readonly gl: WebGL2RenderingContext;
	readonly uniforms: RadialProgressiveBlurUniforms;
	readonly width: number;
	readonly height: number;
	readonly params: RadialProgressiveBlurResolved;
}): void => {
	if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
	if (uniforms.uTexelSize)
		gl.uniform2f(uniforms.uTexelSize, 1 / width, 1 / height);
	if (uniforms.uCenter)
		gl.uniform2f(uniforms.uCenter, params.center[0], params.center[1]);
	if (uniforms.uWidth) gl.uniform1f(uniforms.uWidth, params.width);
	if (uniforms.uHeight) gl.uniform1f(uniforms.uHeight, params.height);
	if (uniforms.uRotation) gl.uniform1f(uniforms.uRotation, params.rotation);
	if (uniforms.uStart) gl.uniform1f(uniforms.uStart, params.start);
	if (uniforms.uStartBlur) gl.uniform1f(uniforms.uStartBlur, params.startBlur);
	if (uniforms.uEndBlur) gl.uniform1f(uniforms.uEndBlur, params.endBlur);
};

const drawFullscreenQuad = (state: RadialProgressiveBlurState): void => {
	const {gl, vao} = state;
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
};

export const applyRadialProgressiveBlur = ({
	state,
	source,
	width,
	height,
	params,
	flipSourceY,
}: {
	readonly state: RadialProgressiveBlurState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly params: RadialProgressiveBlurResolved;
	readonly flipSourceY: boolean;
}): void => {
	const {
		gl,
		programHorizontal,
		programVertical,
		textureSource,
		textureIntermediate,
		framebuffer,
	} = state;

	gl.viewport(0, 0, width, height);

	uploadSource({
		gl,
		textureSource,
		textureIntermediate,
		source,
		width,
		height,
		flipSourceY,
	});

	gl.clearColor(0, 0, 0, 0);

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	gl.useProgram(programHorizontal);
	setUniforms({
		gl,
		uniforms: state.horizontal,
		width,
		height,
		params,
	});
	drawFullscreenQuad(state);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindTexture(gl.TEXTURE_2D, textureIntermediate);
	gl.useProgram(programVertical);
	setUniforms({
		gl,
		uniforms: state.vertical,
		width,
		height,
		params,
	});
	drawFullscreenQuad(state);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};
