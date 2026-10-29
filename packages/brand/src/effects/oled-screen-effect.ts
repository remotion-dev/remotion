import {createEffect, type InteractivitySchema} from 'remotion';

type OledScreenParams = {
	readonly pixelSize: number;
	readonly strength: number;
};

type OledScreenState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation;
	readonly uResolution: WebGLUniformLocation;
	readonly uPixelSize: WebGLUniformLocation;
	readonly uStrength: WebGLUniformLocation;
};

const oledScreenSchema = {
	pixelSize: {
		type: 'number',
		min: 1,
		max: 40,
		step: 0.25,
		default: 6,
		description: 'OLED pixel size',
		hiddenFromList: false,
	},
	strength: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.65,
		description: 'OLED texture strength',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const vertexShaderSource = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aUv;
out vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uPixelSize;
uniform float uStrength;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec4 original = texture(uSource, vUv);
  vec3 originalRgb = original.a > 0.0 ? original.rgb / original.a : vec3(0.0);

  // Work in the source image's pixel coordinates, so the panel moves with it.
  vec2 sourcePixel = vUv * uResolution;
  vec2 cell = sourcePixel / uPixelSize;

  // Rounded pixel cells give both axes visible gaps, even after downscaling.
  vec2 stripeCell = vec2(cell.x * 3.0, cell.y);
  vec2 local = (fract(cell) - 0.5) * uPixelSize;
  float radius = uPixelSize * 0.08;
  vec2 corner = abs(local) - uPixelSize * 0.42 + radius;
  float distanceToAperture = length(max(corner, 0.0))
    + min(max(corner.x, corner.y), 0.0) - radius;
  float edgeWidth = max(fwidth(distanceToAperture), 0.001);
  float aperture = 1.0 - smoothstep(-edgeWidth * 0.5, edgeWidth * 0.5, distanceToAperture);

  float channel = mod(floor(stripeCell.x), 3.0);
  vec3 emitter = vec3(
    1.0 - step(0.5, channel),
    step(0.5, channel) * (1.0 - step(1.5, channel)),
    step(1.5, channel)
  );

  // Fade below a resolvable subpixel width instead of aliasing into a pattern.
  float footprint = max(length(dFdx(sourcePixel)), length(dFdy(sourcePixel)));
  float stripeWidth = (uPixelSize / 3.0) / max(footprint, 0.001);
  float resolved = smoothstep(0.65, 1.35, stripeWidth);
  float tone = max(originalRgb.r, max(originalRgb.g, originalRgb.b));
  float amount = uStrength * resolved;
  // Stronger neutral gaps reveal the pixel structure without amplifying RGB.
  float gain = mix(1.0, mix(0.35, 1.03, aperture), amount);
  float darkSurface = aperture * 0.015 * amount * (1.0 - smoothstep(0.12, 0.4, tone));
  float chromaAmount = min(uStrength, 0.35) * resolved;
  vec3 chromaBias = (emitter - vec3(1.0 / 3.0)) * 0.04 * chromaAmount
    * smoothstep(0.15, 0.6, tone) * aperture;
  vec3 result = clamp(originalRgb * (vec3(gain) + chromaBias) + darkSurface, 0.0, 1.0);

  // Keep the original coverage, including antialiased and transparent edges.
  fragColor = vec4(result * original.a, original.a);
}
`;

export const oledScreen = createEffect<OledScreenParams, OledScreenState>({
	type: 'dev.remotion.brand.oled-screen',
	label: 'oledScreen()',
	documentationLink: null,
	backend: 'webgl2',
	calculateKey: ({pixelSize, strength}) =>
		`oled-screen-${pixelSize}-${strength}`,
	setup: (target) => {
		const gl = target.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: true,
			preserveDrawingBuffer: true,
		});
		if (!gl)
			throw new Error('Could not create a WebGL2 context for oledScreen().');

		const shaders: WebGLShader[] = [];
		const program = gl.createProgram();
		const vao = gl.createVertexArray();
		const vbo = gl.createBuffer();
		const texture = gl.createTexture();
		try {
			if (!program || !vao || !vbo || !texture) {
				throw new Error('Could not allocate WebGL resources for oledScreen().');
			}

			for (const [type, source] of [
				[gl.VERTEX_SHADER, vertexShaderSource],
				[gl.FRAGMENT_SHADER, fragmentShaderSource],
			] as const) {
				const shader = gl.createShader(type);
				if (!shader)
					throw new Error('Could not create an oledScreen() shader.');
				shaders.push(shader);
				gl.shaderSource(shader, source);
				gl.compileShader(shader);
				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
					throw new Error(
						`oledScreen() shader failed: ${gl.getShaderInfoLog(shader)}`,
					);
				}

				gl.attachShader(program, shader);
			}

			gl.linkProgram(program);
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				throw new Error(
					`oledScreen() program failed: ${gl.getProgramInfoLog(program)}`,
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
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			const uSource = gl.getUniformLocation(program, 'uSource');
			const uResolution = gl.getUniformLocation(program, 'uResolution');
			const uPixelSize = gl.getUniformLocation(program, 'uPixelSize');
			const uStrength = gl.getUniformLocation(program, 'uStrength');
			if (!uSource || !uResolution || !uPixelSize || !uStrength) {
				throw new Error('Could not locate oledScreen() uniforms.');
			}

			return {
				gl,
				program,
				vao,
				vbo,
				texture,
				uSource,
				uResolution,
				uPixelSize,
				uStrength,
			};
		} catch (error) {
			gl.deleteTexture(texture);
			gl.deleteBuffer(vbo);
			gl.deleteVertexArray(vao);
			gl.deleteProgram(program);
			throw error;
		} finally {
			for (const shader of shaders) gl.deleteShader(shader);
			gl.bindVertexArray(null);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	},
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const {gl, program, vao, texture} = state;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, width, height);
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.SCISSOR_TEST);
		gl.colorMask(true, true, true, true);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);
		gl.useProgram(program);
		gl.uniform1i(state.uSource, 0);
		gl.uniform2f(state.uResolution, width, height);
		gl.uniform1f(state.uPixelSize, params.pixelSize);
		gl.uniform1f(state.uStrength, params.strength);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, texture}) => {
		gl.deleteTexture(texture);
		gl.deleteBuffer(vbo);
		gl.deleteVertexArray(vao);
		gl.deleteProgram(program);
	},
	schema: oledScreenSchema,
	validateParams: (params) => {
		if (
			params === null ||
			typeof params !== 'object' ||
			Array.isArray(params)
		) {
			throw new TypeError('oledScreen() requires pixelSize and strength.');
		}

		if (
			!Number.isFinite(params.pixelSize) ||
			params.pixelSize < 1 ||
			params.pixelSize > 40
		) {
			throw new TypeError(
				'oledScreen() pixelSize must be a number between 1 and 40.',
			);
		}

		if (
			!Number.isFinite(params.strength) ||
			params.strength < 0 ||
			params.strength > 1
		) {
			throw new TypeError(
				'oledScreen() strength must be a number between 0 and 1.',
			);
		}
	},
});
