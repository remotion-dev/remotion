import {Internals} from 'remotion';

export type SinglePassState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uniforms: Record<string, WebGLUniformLocation | null>;
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

export const setupSinglePass = (
	target: HTMLCanvasElement,
	fragmentShader: string,
	effectName: string,
	uniformNames: readonly string[],
): SinglePassState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) throw Internals.createWebGL2ContextError(`${effectName} effect`);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const shaders: WebGLShader[] = [];
	const program = gl.createProgram();
	const vao = gl.createVertexArray();
	const vbo = gl.createBuffer();
	const texture = gl.createTexture();
	try {
		if (!program || !vao || !vbo || !texture) {
			throw new Error(`Could not allocate ${effectName} WebGL resources`);
		}

		for (const [type, source] of [
			[gl.VERTEX_SHADER, VERTEX_SHADER],
			[gl.FRAGMENT_SHADER, fragmentShader],
		] as const) {
			const shader = gl.createShader(type);
			if (!shader) throw new Error(`Could not create ${effectName} shader`);
			shaders.push(shader);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				throw new Error(
					`${effectName} shader compile failed: ${gl.getShaderInfoLog(shader)}`,
				);
			}

			gl.attachShader(program, shader);
		}

		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(
				`${effectName} program link failed: ${gl.getProgramInfoLog(program)}`,
			);
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
			uniforms: Object.fromEntries(
				['uSource', ...uniformNames].map((name) => [
					name,
					gl.getUniformLocation(program, name),
				]),
			),
		};
	} catch (error) {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteVertexArray(vao);
		gl.deleteProgram(program);
		throw error;
	} finally {
		for (const shader of shaders) gl.deleteShader(shader);
	}
};

export const prepareSinglePassSource = ({
	state,
	source,
	width,
	height,
	flipSourceY,
}: {
	state: SinglePassState;
	source: TexImageSource;
	width: number;
	height: number;
	flipSourceY: boolean;
}): void => {
	const {gl, program, texture, vao, uniforms} = state;
	gl.viewport(0, 0, width, height);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
	gl.useProgram(program);
	gl.uniform1i(uniforms.uSource, 0);
	gl.bindVertexArray(vao);
};

export const drawSinglePass = ({gl}: SinglePassState): void => {
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
};

export const cleanupSinglePass = ({
	gl,
	program,
	vao,
	vbo,
	texture,
}: SinglePassState): void => {
	gl.deleteTexture(texture);
	gl.deleteBuffer(vbo);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
};
