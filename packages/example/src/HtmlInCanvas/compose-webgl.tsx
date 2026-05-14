import React, {useCallback, useRef} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	HtmlInCanvasOnInit,
	HtmlInCanvasOnPaint,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type GpuState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	uMatrix: WebGLUniformLocation | null;
	uTex: WebGLUniformLocation | null;
	texture: WebGLTexture;
	vao: WebGLVertexArrayObject;
	buffer: WebGLBuffer;
};

const VS = `#version 300 es
in vec2 a_pos;
in vec2 a_uv;
uniform mat3 u_matrix;
out vec2 v_uv;
void main() {
  vec3 p = u_matrix * vec3(a_pos, 1.0);
  gl_Position = vec4(p.xy, 0.0, 1.0);
  v_uv = a_uv;
}`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
in vec2 v_uv;
out vec4 o;
void main() {
  o = texture(u_tex, v_uv);
}`;

function compileGlsl(gl: WebGL2RenderingContext, vs: string, fs: string) {
	const vert = gl.createShader(gl.VERTEX_SHADER)!;
	gl.shaderSource(vert, vs);
	gl.compileShader(vert);
	const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
	gl.shaderSource(frag, fs);
	gl.compileShader(frag);
	const program = gl.createProgram()!;
	gl.attachShader(program, vert);
	gl.attachShader(program, frag);
	gl.linkProgram(program);
	gl.deleteShader(vert);
	gl.deleteShader(frag);
	return program;
}

const QUAD = new Float32Array([
	-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
]);

export const HtmlInCanvasComposeWebGL: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const gpuRef = useRef<GpuState | null>(null);

	const rotation = interpolate(
		frame,
		[0, durationInFrames - 1],
		[0, Math.PI * 2],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	const onInit: HtmlInCanvasOnInit = useCallback(({canvas}) => {
		const gl = canvas.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: true,
			antialias: false,
		});
		if (!gl) {
			throw new Error(
				'WebGL2 unavailable. Try rendering with the --gl=angle option. See https://remotion.dev/docs/gl-options.',
			);
		}

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		const program = compileGlsl(gl, VS, FS);
		const uMatrix = gl.getUniformLocation(program, 'u_matrix');
		const uTex = gl.getUniformLocation(program, 'u_tex');

		const texture = gl.createTexture()!;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		const buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);

		const vao = gl.createVertexArray()!;
		gl.bindVertexArray(vao);
		const locPos = gl.getAttribLocation(program, 'a_pos');
		const locUv = gl.getAttribLocation(program, 'a_uv');
		gl.enableVertexAttribArray(locPos);
		gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 16, 0);
		gl.enableVertexAttribArray(locUv);
		gl.vertexAttribPointer(locUv, 2, gl.FLOAT, false, 16, 8);

		gpuRef.current = {gl, program, uMatrix, uTex, texture, vao, buffer};

		return () => {
			gl.deleteProgram(program);
			gl.deleteTexture(texture);
			gl.deleteVertexArray(vao);
			gl.deleteBuffer(buffer);
			gpuRef.current = null;
		};
	}, []);

	const onPaint: HtmlInCanvasOnPaint = useCallback(
		({elementImage}) => {
			const gpu = gpuRef.current;
			if (!gpu) {
				return;
			}

			const c = Math.cos(rotation);
			const s = Math.sin(rotation);
			const mat = new Float32Array([c, -s, 0, s, c, 0, 0, 0, 1]);

			const {gl} = gpu;
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.useProgram(gpu.program);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, gpu.texture);
			gl.texElementImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				elementImage,
			);

			if (gpu.uTex) {
				gl.uniform1i(gpu.uTex, 0);
			}

			if (gpu.uMatrix) {
				gl.uniformMatrix3fv(gpu.uMatrix, false, mat);
			}

			gl.bindVertexArray(gpu.vao);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		},
		[rotation],
	);

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			onInit={onInit}
			onPaint={onPaint}
		>
			<AbsoluteFill
				className="justify-center items-center text-white"
				style={{fontSize: 120}}
			>
				<h1>Hello, World!</h1>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};
