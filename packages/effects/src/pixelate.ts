import {Internals, type InteractivitySchema} from 'remotion';
import {assertOptionalFiniteNumber} from './color-utils.js';
import {assertEffectParamsObject} from './validate-effect-param.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	WEBGPU_SINGLE_PASS_VERTEX,
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

const {createEffect, createWebGL2ContextError} = Internals;

const DEFAULT_BLOCK_SIZE = 20 as const;

const pixelateSchema = {
	blockSize: {
		type: 'number',
		min: 1,
		max: 200,
		step: 1,
		default: DEFAULT_BLOCK_SIZE,
		description: 'Block size',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type PixelateParams = {
	readonly blockSize?: number;
};

type PixelateResolved = {
	blockSize: number;
};

const resolve = (p: PixelateParams): PixelateResolved => ({
	blockSize: p.blockSize ?? DEFAULT_BLOCK_SIZE,
});

const validatePixelateParams = (params: PixelateParams): void => {
	assertEffectParamsObject(params, 'Pixelate');
	assertOptionalFiniteNumber(params.blockSize, 'blockSize');
	if ((params.blockSize ?? DEFAULT_BLOCK_SIZE) < 1) {
		throw new Error('"blockSize" must be >= 1');
	}
};

type PixelateState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly texture: WebGLTexture;
	readonly uSource: WebGLUniformLocation | null;
	readonly uBlockSize: WebGLUniformLocation | null;
	readonly uResolution: WebGLUniformLocation | null;
};

const VERTEX_SHADER = /* glsl */ `#version 300 es

in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
    vUv = aUv;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform float uBlockSize;
uniform vec2 uResolution;

void main() {
    vec2 pixelSizeUv = vec2(uBlockSize) / uResolution;
    // Use fragment pixels directly so fractional grid boundaries do not depend on UV interpolation.
    vec2 blockUv = (floor(gl_FragCoord.xy / uBlockSize) + 0.5) * pixelSizeUv;
    fragColor = texture(uSource, blockUv);
}
`;

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
		throw new Error(`Pixelate shader compile failed: ${log ?? '(no log)'}`);
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
		throw new Error(`Pixelate program link failed: ${log ?? '(no log)'}`);
	}

	return program;
};

const createPixelateState = (gl: WebGL2RenderingContext): PixelateState => {
	const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	const program = linkProgram(gl, vs, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);

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

	const aPos = gl.getAttribLocation(program, 'aPos');
	const aUv = gl.getAttribLocation(program, 'aUv');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(aUv);
	gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

	gl.bindVertexArray(null);

	const texture = gl.createTexture();
	if (!texture) {
		throw new Error('Failed to create WebGL texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return {
		gl,
		program,
		vao,
		vbo,
		texture,
		uSource: gl.getUniformLocation(program, 'uSource'),
		uResolution: gl.getUniformLocation(program, 'uResolution'),
		uBlockSize: gl.getUniformLocation(program, 'uBlockSize'),
	};
};

const WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { resolutionBlockSize: vec4f, }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let pixelSizeUv = vec2f(params.resolutionBlockSize.z) / params.resolutionBlockSize.xy;
	// Keep the original grid anchored at the bottom-left corner.
	let pixel = vec2f(input.position.x, params.resolutionBlockSize.y - input.position.y);
	let blockUv = (floor(pixel / params.resolutionBlockSize.z) + 0.5) * pixelSizeUv;
	return textureSampleLevel(source, sourceSampler, vec2f(blockUv.x, 1.0 - blockUv.y), 0);
}
`;

export const pixelate = createEffect<PixelateParams>({
	type: 'dev.remotion.effects.pixelate',
	label: 'pixelate()',
	documentationLink: 'https://www.remotion.dev/docs/effects/pixelate',

	calculateKey: (params) => {
		const r = resolve(params);
		return `pixelate-${r.blockSize}`;
	},
	implementations: {
		webgpu: Internals.createEffectImplementation<
			PixelateParams,
			WebGpuSinglePassState
		>({
			setup: (target) => setupWebGpuSinglePass(target, 'pixelate'),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice) {
					throw new Error(
						'A WebGPU device is required for the pixelate effect',
					);
				}

				const r = resolve(params);

				applyWebGpuSinglePass({
					source,
					width,
					height,
					state,
					device: gpuDevice as GPUDevice,
					shader: WEBGPU_SHADER,
					uniformData: new Float32Array([width, height, r.blockSize, 0]),
				});
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
		webgl2: Internals.createEffectImplementation<PixelateParams, PixelateState>(
			{
				setup: (target) => {
					const gl = target.getContext('webgl2', {
						premultipliedAlpha: true,
						alpha: true,
						preserveDrawingBuffer: true,
					});
					if (!gl) {
						throw createWebGL2ContextError('pixelate effect');
					}

					return createPixelateState(gl);
				},
				apply: ({source, width, height, params, state, flipSourceY}) => {
					const r = resolve(params);

					state.gl.viewport(0, 0, width, height);
					state.gl.clearColor(0, 0, 0, 0);
					state.gl.clear(state.gl.COLOR_BUFFER_BIT);

					state.gl.useProgram(state.program);
					state.gl.bindVertexArray(state.vao);
					state.gl.bindFramebuffer(state.gl.FRAMEBUFFER, null);
					state.gl.activeTexture(state.gl.TEXTURE0);
					state.gl.bindTexture(state.gl.TEXTURE_2D, state.texture);
					state.gl.pixelStorei(state.gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
					state.gl.pixelStorei(state.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
					state.gl.texImage2D(
						state.gl.TEXTURE_2D,
						0,
						state.gl.RGBA,
						state.gl.RGBA,
						state.gl.UNSIGNED_BYTE,
						source as TexImageSource,
					);

					if (state.uSource) state.gl.uniform1i(state.uSource, 0);
					if (state.uBlockSize)
						state.gl.uniform1f(state.uBlockSize, r.blockSize);
					if (state.uResolution)
						state.gl.uniform2f(state.uResolution, width, height);

					state.gl.drawArrays(state.gl.TRIANGLE_STRIP, 0, 4);
					state.gl.bindVertexArray(null);
					state.gl.bindTexture(state.gl.TEXTURE_2D, null);
					state.gl.useProgram(null);
				},
				cleanup: ({gl, program, vao, vbo, texture}) => {
					gl.deleteTexture(texture);
					gl.deleteBuffer(vbo);
					gl.deleteProgram(program);
					gl.deleteVertexArray(vao);
				},
			},
		),
	},
	schema: pixelateSchema,
	validateParams: validatePixelateParams,
});
