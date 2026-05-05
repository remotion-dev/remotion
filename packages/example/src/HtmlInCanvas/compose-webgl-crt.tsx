import {tint} from '@remotion/effects';
import React, {useCallback, useRef} from 'react';
import {
	HtmlInCanvas,
	HtmlInCanvasOnInit,
	HtmlInCanvasOnPaint,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type GpuState = {
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
	uTex: WebGLUniformLocation | null;
	uTime: WebGLUniformLocation | null;
	uResolution: WebGLUniformLocation | null;
	texture: WebGLTexture;
	vao: WebGLVertexArrayObject;
	buffer: WebGLBuffer;
};

const VS = `#version 300 es
in vec2 a_pos;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
  v_uv = a_uv;
}`;

// CRT old TV shader: barrel distortion, scanlines, RGB phosphor mask,
// vignette, slight chromatic aberration and noise.
const FS = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_resolution;
in vec2 v_uv;
out vec4 o;

vec2 curve(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
  uv = uv + uv * offset * offset;
  uv = uv * 0.5 + 0.5;
  return uv;
}

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = curve(v_uv);

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    o = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Chromatic aberration
  float ca = 0.0015;
  float r = texture(u_tex, uv + vec2(ca, 0.0)).r;
  float g = texture(u_tex, uv).g;
  float b = texture(u_tex, uv - vec2(ca, 0.0)).b;
  vec3 col = vec3(r, g, b);

  // Scanlines
  float scan = sin(uv.y * u_resolution.y * 1.5 + u_time * 8.0) * 0.5 + 0.5;
  col *= mix(0.85, 1.0, scan);

  // Phosphor mask (RGB stripes)
  float px = mod(gl_FragCoord.x, 3.0);
  vec3 mask = vec3(1.0);
  if (px < 1.0) mask = vec3(1.1, 0.85, 0.85);
  else if (px < 2.0) mask = vec3(0.85, 1.1, 0.85);
  else mask = vec3(0.85, 0.85, 1.1);
  col *= mask;

  // Rolling horizontal scanline
  float roll = sin((uv.y - u_time * 0.15) * 6.2831);
  col += smoothstep(0.99, 1.0, roll) * 0.08;

  // Vignette
  vec2 vig = uv * (1.0 - uv.yx);
  float v = vig.x * vig.y * 18.0;
  v = pow(v, 0.25);
  col *= v;

  // Noise
  col += (rand(uv * u_time) - 0.5) * 0.04;

  o = vec4(col, 1.0);
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

export const HtmlInCanvasComposeWebGLCrt: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const gpuRef = useRef<GpuState | null>(null);

	const time = frame / fps;

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
		const uTex = gl.getUniformLocation(program, 'u_tex');
		const uTime = gl.getUniformLocation(program, 'u_time');
		const uResolution = gl.getUniformLocation(program, 'u_resolution');

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

		gpuRef.current = {
			gl,
			program,
			uTex,
			uTime,
			uResolution,
			texture,
			vao,
			buffer,
		};

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
				gl.uniform1f(gpu.uTime, time);
			}

			if (gpu.uResolution) {
				gl.uniform2f(
					gpu.uResolution,
					gl.drawingBufferWidth,
					gl.drawingBufferHeight,
				);
			}

			gl.bindVertexArray(gpu.vao);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		},
		[time],
	);

	return (
		<HtmlInCanvas
			width={width}
			height={height}
			onInit={onInit}
			onPaint={onPaint}
			_experimentalEffects={[tint({color: 'red'})]}
			style={{
				backgroundColor: 'white',
				color: 'black',
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 120,
				fontFamily: 'sans-serif',
				fontWeight: 'bold',
				display: 'flex',
			}}
		>
			<h1>Hello, World!</h1>
		</HtmlInCanvas>
	);
};
