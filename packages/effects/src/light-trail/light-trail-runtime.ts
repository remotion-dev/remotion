import {Internals} from 'remotion';
import type {ParsedColorRgba} from '../color-utils.js';
import {LIGHT_TRAIL_FS, LIGHT_TRAIL_VS} from './light-trail-shaders.js';

const {createWebGL2ContextError} = Internals;

export type LightTrailState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uDirection: WebGLUniformLocation | null;
		readonly uTexelSize: WebGLUniformLocation | null;
		readonly uColor: WebGLUniformLocation | null;
		readonly uDistance: WebGLUniformLocation | null;
		readonly uIntensity: WebGLUniformLocation | null;
		readonly uDecay: WebGLUniformLocation | null;
		readonly uThreshold: WebGLUniformLocation | null;
		readonly uSamples: WebGLUniformLocation | null;
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
		throw new Error(`Light trail shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Light trail program link failed: ${log ?? '(no log)'}`);
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

export const setupLightTrail = (target: HTMLCanvasElement): LightTrailState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('light trail effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl, LIGHT_TRAIL_VS, LIGHT_TRAIL_FS);

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

	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx) {
		throw new Error('Failed to acquire 2D context for color parsing');
	}

	return {
		gl,
		program,
		vao,
		vbo,
		textureSource: createRgbaTexture(gl),
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uDirection: gl.getUniformLocation(program, 'uDirection'),
			uTexelSize: gl.getUniformLocation(program, 'uTexelSize'),
			uColor: gl.getUniformLocation(program, 'uColor'),
			uDistance: gl.getUniformLocation(program, 'uDistance'),
			uIntensity: gl.getUniformLocation(program, 'uIntensity'),
			uDecay: gl.getUniformLocation(program, 'uDecay'),
			uThreshold: gl.getUniformLocation(program, 'uThreshold'),
			uSamples: gl.getUniformLocation(program, 'uSamples'),
		},
		colorCtx,
		cachedColorStr: '',
		cachedColorRgba: [255, 255, 255, 255],
	};
};

export const cleanupLightTrail = (state: LightTrailState): void => {
	const {gl, program, vao, vbo, textureSource} = state;
	gl.deleteTexture(textureSource);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
};

const drawFullscreenQuad = (state: LightTrailState): void => {
	const {gl, vao} = state;
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
};

export const applyLightTrail = ({
	state,
	source,
	width,
	height,
	direction,
	distance,
	intensity,
	decay,
	threshold,
	samples,
	color,
	flipSourceY,
}: {
	readonly state: LightTrailState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly direction: number;
	readonly distance: number;
	readonly intensity: number;
	readonly decay: number;
	readonly threshold: number;
	readonly samples: number;
	readonly color: ParsedColorRgba;
	readonly flipSourceY: boolean;
}): void => {
	const {gl, program, textureSource, uniforms} = state;
	const radians = (direction * Math.PI) / 180;
	const x = Math.cos(radians);
	const y = Math.sin(radians);

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
	if (uniforms.uDirection) gl.uniform2f(uniforms.uDirection, x, y);
	if (uniforms.uTexelSize) {
		gl.uniform2f(uniforms.uTexelSize, 1 / width, 1 / height);
	}

	if (uniforms.uColor) {
		gl.uniform4f(
			uniforms.uColor,
			color[0] / 255,
			color[1] / 255,
			color[2] / 255,
			color[3] / 255,
		);
	}

	if (uniforms.uDistance) gl.uniform1f(uniforms.uDistance, distance);
	if (uniforms.uIntensity) gl.uniform1f(uniforms.uIntensity, intensity);
	if (uniforms.uDecay) gl.uniform1f(uniforms.uDecay, decay);
	if (uniforms.uThreshold) gl.uniform1f(uniforms.uThreshold, threshold);
	if (uniforms.uSamples) gl.uniform1i(uniforms.uSamples, samples);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	drawFullscreenQuad(state);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};
