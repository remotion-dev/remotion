import {createEffect} from 'remotion';

type Params = {readonly saturation: number};
type State = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly texture: WebGLTexture;
	readonly source: WebGLUniformLocation | null;
	readonly saturation: WebGLUniformLocation | null;
};

export const preservePink = createEffect<Params, State>({
	type: 'dev.remotion.brand.preserve-pink',
	label: 'Preserve pink accents',
	documentationLink: null,
	backend: 'webgl2',
	calculateKey: ({saturation}) => `preserve-pink-${saturation}`,
	schema: {
		saturation: {
			type: 'number',
			default: 0,
			min: 0,
			max: 1,
			step: 0.01,
			description: 'Other colors saturation',
			hiddenFromList: false,
		},
	},
	validateParams: ({saturation}) => {
		if (!Number.isFinite(saturation) || saturation < 0 || saturation > 1) {
			throw new Error('Saturation must be between 0 and 1');
		}
	},
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl) throw new Error('Preserve pink requires WebGL2');

		const program = gl.createProgram();
		if (!program) throw new Error('Could not create preserve pink program');
		const shaders = [
			{
				type: gl.VERTEX_SHADER,
				source: `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,
			},
			{
				type: gl.FRAGMENT_SHADER,
				source: `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform float uSaturation;
in vec2 vUv;
out vec4 fragColor;

vec3 rgbToHsv(vec3 c) {
  vec4 k = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, k.wz), vec4(c.gb, k.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x);
}

void main() {
  vec4 pixel = texture(uSource, vUv);
  if (pixel.a <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }
  vec3 color = pixel.rgb / pixel.a;
  vec3 hsv = rgbToHsv(color);
  float distance = abs(hsv.x - 0.88);
  distance = min(distance, 1.0 - distance);
  float pink = (1.0 - smoothstep(0.065, 0.105, distance))
    * smoothstep(0.20, 0.45, hsv.y);
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  vec3 result = mix(vec3(luminance), color, mix(uSaturation, 1.0, pink));
  fragColor = vec4(result * pixel.a, pixel.a);
}`,
			},
		].map(({type, source}) => {
			const shader = gl.createShader(type);
			if (!shader) throw new Error('Could not create preserve pink shader');
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				const log = gl.getShaderInfoLog(shader);
				gl.deleteShader(shader);
				throw new Error(`Preserve pink shader failed: ${log}`);
			}

			gl.attachShader(program, shader);
			return shader;
		});
		gl.linkProgram(program);
		shaders.forEach((shader) => gl.deleteShader(shader));
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(
				`Preserve pink link failed: ${gl.getProgramInfoLog(program)}`,
			);
		}

		const vao = gl.createVertexArray();
		const texture = gl.createTexture();
		if (!vao || !texture)
			throw new Error('Could not allocate preserve pink state');
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
			texture,
			source: gl.getUniformLocation(program, 'uSource'),
			saturation: gl.getUniformLocation(program, 'uSaturation'),
		};
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const {gl, program, vao, texture} = state;
		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
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
		gl.useProgram(program);
		gl.uniform1i(state.source, 0);
		gl.uniform1f(state.saturation, params.saturation);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, texture, vao, program}) => {
		gl.deleteTexture(texture);
		gl.deleteVertexArray(vao);
		gl.deleteProgram(program);
	},
});
