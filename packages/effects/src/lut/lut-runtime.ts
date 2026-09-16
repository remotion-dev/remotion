import {Internals} from 'remotion';
import {LUT_FRAGMENT_SHADER, LUT_VERTEX_SHADER} from './lut-shaders.js';
import type {ParsedCubeLut} from './parse-cube-lut.js';

const {createWebGL2ContextError} = Internals;

export type LutState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly sourceTexture: WebGLTexture;
	readonly lutTexture: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uLut: WebGLUniformLocation | null;
		readonly uLutSize: WebGLUniformLocation | null;
		readonly uDomainMin: WebGLUniformLocation | null;
		readonly uDomainMax: WebGLUniformLocation | null;
	};
	cachedContent: string | null;
};

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create LUT shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`LUT shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, LUT_VERTEX_SHADER);
	const fragmentShader = compileShader(
		gl,
		gl.FRAGMENT_SHADER,
		LUT_FRAGMENT_SHADER,
	);
	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create LUT shader program');
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`LUT shader link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createSourceTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create LUT source texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
};

const createLutTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create LUT texture');
	}

	gl.bindTexture(gl.TEXTURE_3D, texture);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_3D, null);
	return texture;
};

export const setupLut = (target: HTMLCanvasElement): LutState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw createWebGL2ContextError('LUT effect');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl);
	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create LUT vertex array');
	}

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create LUT vertex buffer');
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
		sourceTexture: createSourceTexture(gl),
		lutTexture: createLutTexture(gl),
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uLut: gl.getUniformLocation(program, 'uLut'),
			uLutSize: gl.getUniformLocation(program, 'uLutSize'),
			uDomainMin: gl.getUniformLocation(program, 'uDomainMin'),
			uDomainMax: gl.getUniformLocation(program, 'uDomainMax'),
		},
		cachedContent: null,
	};
};

export const applyLut = ({
	state,
	source,
	width,
	height,
	content,
	parsed,
	flipSourceY,
}: {
	readonly state: LutState;
	readonly source: CanvasImageSource;
	readonly width: number;
	readonly height: number;
	readonly content: string;
	readonly parsed: ParsedCubeLut;
	readonly flipSourceY: boolean;
}): void => {
	const {gl, program, sourceTexture, lutTexture, uniforms, vao} = state;

	if (state.cachedContent !== content) {
		const maxSize = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) as number;
		if (parsed.size > maxSize) {
			throw new Error(
				`LUT_3D_SIZE ${parsed.size} exceeds this browser's maximum 3D texture size of ${maxSize}`,
			);
		}

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_3D, lutTexture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.texImage3D(
			gl.TEXTURE_3D,
			0,
			gl.RGBA16F,
			parsed.size,
			parsed.size,
			parsed.size,
			0,
			gl.RGBA,
			gl.FLOAT,
			parsed.data,
		);
		const uploadError = gl.getError();
		if (uploadError !== gl.NO_ERROR) {
			throw new Error(
				`Failed to upload the 3D LUT texture (WebGL error ${uploadError})`,
			);
		}

		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		state.cachedContent = content;
	}

	gl.viewport(0, 0, width, height);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		source as TexImageSource,
	);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_3D, lutTexture);

	gl.useProgram(program);
	if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
	if (uniforms.uLut) gl.uniform1i(uniforms.uLut, 1);
	if (uniforms.uLutSize) gl.uniform1i(uniforms.uLutSize, parsed.size);
	if (uniforms.uDomainMin) {
		gl.uniform3f(uniforms.uDomainMin, ...parsed.domainMin);
	}

	if (uniforms.uDomainMax) {
		gl.uniform3f(uniforms.uDomainMax, ...parsed.domainMax);
	}

	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_3D, null);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};

export const cleanupLut = ({
	gl,
	program,
	vao,
	vbo,
	sourceTexture,
	lutTexture,
}: LutState): void => {
	gl.deleteTexture(sourceTexture);
	gl.deleteTexture(lutTexture);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
};
