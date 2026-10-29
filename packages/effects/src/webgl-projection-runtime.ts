import {Internals} from 'remotion';

export type WebGlProjectionState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	texture: WebGLTexture;
	vao: WebGLVertexArrayObject;
	uniforms: WebGLUniformLocation | null;
	source: WebGLUniformLocation | null;
};

export const setupWebGlProjection = (
	target: HTMLCanvasElement,
	shader: string,
): WebGlProjectionState => {
	const gl = target.getContext('webgl2');
	if (!gl) throw Internals.createWebGL2ContextError('projection effect');
	const program = gl.createProgram()!;
	const shaders: WebGLShader[] = [];
	try {
		for (const [type, code] of [
			[
				gl.VERTEX_SHADER,
				`#version 300 es
void main() {
 vec2 positions[3] = vec2[3](vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
 gl_Position = vec4(positions[gl_VertexID], 0, 1);
}`,
			],
			[gl.FRAGMENT_SHADER, shader],
		] as const) {
			const compiled = gl.createShader(type)!;
			shaders.push(compiled);
			gl.shaderSource(compiled, code);
			gl.compileShader(compiled);
			if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS))
				throw new Error(
					gl.getShaderInfoLog(compiled) ??
						'Projection shader compilation failed',
				);
			gl.attachShader(program, compiled);
		}

		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
			throw new Error(
				gl.getProgramInfoLog(program) ?? 'Projection program linking failed',
			);
	} catch (err) {
		gl.deleteProgram(program);
		throw err;
	} finally {
		for (const compiled of shaders) gl.deleteShader(compiled);
	}

	const texture = gl.createTexture()!;
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	return {
		gl,
		program,
		texture,
		vao: gl.createVertexArray()!,
		uniforms: gl.getUniformLocation(program, 'uParams'),
		source: gl.getUniformLocation(program, 'uSource'),
	};
};

export const applyWebGlProjection = ({
	state,
	source,
	width,
	height,
	flipSourceY,
	uniformData,
}: {
	state: WebGlProjectionState;
	source: CanvasImageSource;
	width: number;
	height: number;
	flipSourceY: boolean;
	uniformData: Float32Array<ArrayBuffer>;
}): void => {
	const {gl} = state;
	gl.viewport(0, 0, width, height);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.disable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.SCISSOR_TEST);
	gl.useProgram(state.program);
	gl.bindVertexArray(state.vao);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, state.texture);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		source as TexImageSource,
	);
	gl.uniform1i(state.source, 0);
	gl.uniform4fv(state.uniforms, uniformData);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
};

export const cleanupWebGlProjection = ({
	gl,
	program,
	texture,
	vao,
}: WebGlProjectionState): void => {
	gl.deleteTexture(texture);
	gl.deleteProgram(program);
	gl.deleteVertexArray(vao);
};
