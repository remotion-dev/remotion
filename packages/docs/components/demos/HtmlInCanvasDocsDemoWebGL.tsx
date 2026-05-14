/**
 * Minimal WebGL2 + HtmlInCanvas (same as packages/example minimal-docs-webgl).
 */
import React, {useCallback, useRef} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	useCurrentFrame,
	useVideoConfig,
	type HtmlInCanvasOnInit,
	type HtmlInCanvasOnPaint,
} from 'remotion';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

type GlState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	uTex: WebGLUniformLocation | null;
	uTime: WebGLUniformLocation | null;
	texture: WebGLTexture;
	vao: WebGLVertexArrayObject;
};

const VS = `#version 300 es
in vec2 a_pos;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
  v_uv = a_uv;
}`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform float u_time;
in vec2 v_uv;
out vec4 o;
void main() {
  vec2 uv = v_uv;
  uv.x += 0.045 * sin(v_uv.y * 32.0 + u_time * 5.0);
  uv.y += 0.038 * sin(v_uv.x * 26.0 + u_time * 4.0);
  o = texture(u_tex, uv);
}`;

function linkProgram(
	gl: WebGL2RenderingContext,
	vsSrc: string,
	fsSrc: string,
): WebGLProgram {
	const vert = gl.createShader(gl.VERTEX_SHADER)!;
	gl.shaderSource(vert, vsSrc);
	gl.compileShader(vert);
	const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
	gl.shaderSource(frag, fsSrc);
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

const HtmlInCanvasDocsWebGLInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const gpuRef = useRef<GlState | null>(null);

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

		const program = linkProgram(gl, VS, FS);
		const uTex = gl.getUniformLocation(program, 'u_tex');
		const uTime = gl.getUniformLocation(program, 'u_time');

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

		gpuRef.current = {gl, program, uTex, uTime, texture, vao};

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

			if (gpu.uTime) {
				gl.uniform1f(gpu.uTime, frame / fps);
			}

			gl.bindVertexArray(gpu.vao);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		},
		[frame, fps],
	);

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			onInit={onInit}
			onPaint={onPaint}
		>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					color: 'white',
					backgroundColor: 'black',
					fontSize: 120,
				}}
			>
				{/* Explicit font size: Infima/Docusaurus global `h1` rules otherwise override the parent font size inside the docs Player. */}
				<h1 style={{margin: 0, fontSize: 120}}>Hello</h1>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};

export const HtmlInCanvasDocsDemoWebGL: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/html-in-canvas-webgl.mp4" />
		);
	}

	return <HtmlInCanvasDocsWebGLInner />;
};
