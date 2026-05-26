import {Internals} from 'remotion';
import type {ParsedColorRgba} from '../color-utils.js';
import {
	GLOW_BLUR_FS_HORIZONTAL,
	GLOW_BLUR_FS_VERTICAL,
	GLOW_COMPOSITE_FS,
	GLOW_EXTRACT_FS,
	GLOW_VS,
} from './glow-shaders.js';

const {createWebGL2ContextError} = Internals;

export type GlowState = {
	readonly gl: WebGL2RenderingContext;
	readonly programExtract: WebGLProgram;
	readonly programHorizontal: WebGLProgram;
	readonly programVertical: WebGLProgram;
	readonly programComposite: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly textureGlowA: WebGLTexture;
	readonly textureGlowB: WebGLTexture;
	readonly framebuffer: WebGLFramebuffer;
	readonly extract: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uColor: WebGLUniformLocation | null;
		readonly uThreshold: WebGLUniformLocation | null;
	};
	readonly horizontal: {
		readonly uRadius: WebGLUniformLocation | null;
		readonly uTexelSize: WebGLUniformLocation | null;
		readonly uSource: WebGLUniformLocation | null;
	};
	readonly vertical: {
		readonly uRadius: WebGLUniformLocation | null;
		readonly uTexelSize: WebGLUniformLocation | null;
		readonly uSource: WebGLUniformLocation | null;
	};
	readonly composite: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uGlow: WebGLUniformLocation | null;
		readonly uIntensity: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColorStr: string;
	cachedColorRgba: ParsedColorRgba;
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
		throw new Error(`Glow shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Glow program link failed: ${log ?? '(no log)'}`);
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

const getBlurUniforms = (
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
): GlowState['horizontal'] => ({
	uRadius: gl.getUniformLocation(program, 'uRadius'),
	uTexelSize: gl.getUniformLocation(program, 'uTexelSize'),
	uSource: gl.getUniformLocation(program, 'uSource'),
});

export const setupGlow = (target: HTMLCanvasElement): GlowState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('glow effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const programExtract = createProgram(gl, GLOW_VS, GLOW_EXTRACT_FS);
	const programHorizontal = createProgram(gl, GLOW_VS, GLOW_BLUR_FS_HORIZONTAL);
	const programVertical = createProgram(gl, GLOW_VS, GLOW_BLUR_FS_VERTICAL);
	const programComposite = createProgram(gl, GLOW_VS, GLOW_COMPOSITE_FS);

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
	const textureGlowA = createRgbaTexture(gl);
	const textureGlowB = createRgbaTexture(gl);

	const framebuffer = gl.createFramebuffer();
	if (!framebuffer) {
		throw new Error('Failed to create WebGL framebuffer');
	}

	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx) {
		throw new Error('Failed to acquire 2D context for color parsing');
	}

	return {
		gl,
		programExtract,
		programHorizontal,
		programVertical,
		programComposite,
		vao,
		vbo,
		textureSource,
		textureGlowA,
		textureGlowB,
		framebuffer,
		extract: {
			uSource: gl.getUniformLocation(programExtract, 'uSource'),
			uColor: gl.getUniformLocation(programExtract, 'uColor'),
			uThreshold: gl.getUniformLocation(programExtract, 'uThreshold'),
		},
		horizontal: getBlurUniforms(gl, programHorizontal),
		vertical: getBlurUniforms(gl, programVertical),
		composite: {
			uSource: gl.getUniformLocation(programComposite, 'uSource'),
			uGlow: gl.getUniformLocation(programComposite, 'uGlow'),
			uIntensity: gl.getUniformLocation(programComposite, 'uIntensity'),
		},
		colorCtx,
		cachedColorStr: '',
		cachedColorRgba: [255, 255, 255, 255],
	};
};

export const cleanupGlow = ({
	gl,
	programExtract,
	programHorizontal,
	programVertical,
	programComposite,
	vao,
	vbo,
	textureSource,
	textureGlowA,
	textureGlowB,
	framebuffer,
}: GlowState): void => {
	gl.deleteFramebuffer(framebuffer);
	gl.deleteTexture(textureSource);
	gl.deleteTexture(textureGlowA);
	gl.deleteTexture(textureGlowB);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(programExtract);
	gl.deleteProgram(programHorizontal);
	gl.deleteProgram(programVertical);
	gl.deleteProgram(programComposite);
	gl.deleteVertexArray(vao);
};

const drawFullscreenQuad = (state: GlowState): void => {
	const {gl, vao} = state;
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
};

const setTextureSize = (
	gl: WebGL2RenderingContext,
	texture: WebGLTexture,
	width: number,
	height: number,
): void => {
	gl.bindTexture(gl.TEXTURE_2D, texture);
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
};

const setFramebufferTexture = (
	gl: WebGL2RenderingContext,
	framebuffer: WebGLFramebuffer,
	texture: WebGLTexture,
): void => {
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		texture,
		0,
	);
	const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (status !== gl.FRAMEBUFFER_COMPLETE) {
		throw new Error(`Glow framebuffer incomplete: 0x${status.toString(16)}`);
	}
};

const setBlurUniforms = ({
	gl,
	uniforms,
	radius,
	width,
	height,
}: {
	readonly gl: WebGL2RenderingContext;
	readonly uniforms: GlowState['horizontal'];
	readonly radius: number;
	readonly width: number;
	readonly height: number;
}): void => {
	if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
	if (uniforms.uRadius) gl.uniform1f(uniforms.uRadius, radius);
	if (uniforms.uTexelSize)
		gl.uniform2f(uniforms.uTexelSize, 1 / width, 1 / height);
};

const normalizedColor = (
	color: ParsedColorRgba,
): readonly [number, number, number, number] => {
	return [color[0] / 255, color[1] / 255, color[2] / 255, color[3] / 255];
};

type ApplyGlowParams = {
	readonly state: GlowState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly radius: number;
	readonly intensity: number;
	readonly threshold: number;
	readonly color: ParsedColorRgba;
	readonly flipSourceY: boolean;
};

export const applyGlow = ({
	state,
	source,
	width,
	height,
	radius,
	intensity,
	threshold,
	color,
	flipSourceY,
}: ApplyGlowParams): void => {
	const {
		gl,
		textureSource,
		textureGlowA,
		textureGlowB,
		framebuffer,
		programExtract,
		programHorizontal,
		programVertical,
		programComposite,
	} = state;

	gl.viewport(0, 0, width, height);
	gl.clearColor(0, 0, 0, 0);

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
	setTextureSize(gl, textureGlowA, width, height);
	setTextureSize(gl, textureGlowB, width, height);

	const [r, g, b, a] = normalizedColor(color);

	setFramebufferTexture(gl, framebuffer, textureGlowA);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(programExtract);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	if (state.extract.uSource) gl.uniform1i(state.extract.uSource, 0);
	if (state.extract.uColor) gl.uniform4f(state.extract.uColor, r, g, b, a);
	if (state.extract.uThreshold)
		gl.uniform1f(state.extract.uThreshold, threshold);
	drawFullscreenQuad(state);

	setFramebufferTexture(gl, framebuffer, textureGlowB);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(programHorizontal);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureGlowA);
	setBlurUniforms({
		gl,
		uniforms: state.horizontal,
		radius,
		width,
		height,
	});
	drawFullscreenQuad(state);

	setFramebufferTexture(gl, framebuffer, textureGlowA);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(programVertical);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureGlowB);
	setBlurUniforms({
		gl,
		uniforms: state.vertical,
		radius,
		width,
		height,
	});
	drawFullscreenQuad(state);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(programComposite);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textureGlowA);
	if (state.composite.uSource) gl.uniform1i(state.composite.uSource, 0);
	if (state.composite.uGlow) gl.uniform1i(state.composite.uGlow, 1);
	if (state.composite.uIntensity)
		gl.uniform1f(state.composite.uIntensity, intensity);
	drawFullscreenQuad(state);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};
