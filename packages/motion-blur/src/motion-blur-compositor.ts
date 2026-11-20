import {Internals} from 'remotion';

const webGpuShader = /* wgsl */ `
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var<uniform> weight: f32;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let positions = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
	return vec4f(positions[index], 0, 1);
}

@fragment fn accumulate(@builtin(position) position: vec4f) -> @location(0) vec4f {
	return textureLoad(source, vec2i(position.xy), 0) * weight;
}

@fragment fn resolve(@builtin(position) position: vec4f) -> @location(0) vec4f {
	return textureLoad(source, vec2i(position.xy), 0);
}
`;

const webGlVertexShader = /* glsl */ `#version 300 es
void main() {
	vec2 positions[3] = vec2[3](vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
	gl_Position = vec4(positions[gl_VertexID], 0, 1);
}
`;

const webGlFragmentShader = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D source;
uniform float weight;
out vec4 color;
void main() {
	color = texelFetch(source, ivec2(gl_FragCoord.xy), 0) * weight;
}
`;

type Compositor = {
	readonly backend: 'webgpu' | 'webgl2';
	readonly addSample: (
		source: OffscreenCanvas,
		index: number,
		weight: number,
	) => void;
	readonly finish: () => HTMLCanvasElement;
	readonly dispose: () => void;
	readonly isLost: () => boolean;
};

type SharedWebGlCompositor = {
	readonly canvas: HTMLCanvasElement;
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly sourceTexture: WebGLTexture;
	readonly accumulationTexture: WebGLTexture;
	readonly framebuffer: WebGLFramebuffer;
	readonly weight: WebGLUniformLocation;
	readonly requestPaint: Set<() => void>;
	users: number;
	width: number;
	height: number;
};

let sharedWebGl: SharedWebGlCompositor | null = null;
const deviceLossListeners = new WeakMap<GPUDevice, Set<() => void>>();
const lostDevices = new WeakSet<GPUDevice>();
const webGpuPipelines = new WeakMap<
	GPUDevice,
	{accumulation: GPURenderPipeline; output: GPURenderPipeline}
>();

export const getMotionBlurGpuDevice = async (): Promise<GPUDevice | null> => {
	const device = (await Internals.getGpuDevice()) as GPUDevice | null;
	if (!device || lostDevices.has(device)) return null;
	if (!deviceLossListeners.has(device)) {
		const listeners = new Set<() => void>();
		deviceLossListeners.set(device, listeners);
		device.lost.then(() => {
			lostDevices.add(device);
			for (const callback of listeners) callback();
			listeners.clear();
		});
	}

	return device;
};

const createWebGlCompositor = (
	width: number,
	height: number,
	requestPaint: () => void,
): Compositor => {
	if (sharedWebGl === null || sharedWebGl.gl.isContextLost()) {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2', {
			alpha: true,
			premultipliedAlpha: true,
			preserveDrawingBuffer: true,
			antialias: false,
			depth: false,
			stencil: false,
		});
		if (!gl) {
			throw Internals.createWebGL2ContextError('motion blur accumulation');
		}

		try {
			if (!gl.getExtension('EXT_color_buffer_float')) {
				throw new Error(
					'Motion blur requires WebGL floating-point render targets',
				);
			}

			const program = gl.createProgram();
			if (!program) {
				throw new Error('Failed to create the motion blur WebGL program');
			}

			for (const [type, code] of [
				[gl.VERTEX_SHADER, webGlVertexShader],
				[gl.FRAGMENT_SHADER, webGlFragmentShader],
			] as const) {
				const shader = gl.createShader(type);
				if (!shader) {
					throw new Error('Failed to create a motion blur WebGL shader');
				}

				gl.shaderSource(shader, code);
				gl.compileShader(shader);
				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
					const message = gl.getShaderInfoLog(shader);
					gl.deleteShader(shader);
					throw new Error(`Failed to compile motion blur shader: ${message}`);
				}

				gl.attachShader(program, shader);
				gl.deleteShader(shader);
			}

			gl.linkProgram(program);
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				throw new Error(
					`Failed to link motion blur shaders: ${gl.getProgramInfoLog(program)}`,
				);
			}

			const sourceTexture = gl.createTexture();
			const accumulationTexture = gl.createTexture();
			const framebuffer = gl.createFramebuffer();
			const weight = gl.getUniformLocation(program, 'weight');
			if (!sourceTexture || !accumulationTexture || !framebuffer || !weight) {
				throw new Error('Failed to allocate motion blur WebGL resources');
			}

			for (const texture of [sourceTexture, accumulationTexture]) {
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}

			gl.useProgram(program);
			gl.uniform1i(gl.getUniformLocation(program, 'source'), 0);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.disable(gl.DITHER);
			sharedWebGl = {
				canvas,
				gl,
				program,
				sourceTexture,
				accumulationTexture,
				framebuffer,
				weight,
				requestPaint: new Set(),
				users: 0,
				width: 0,
				height: 0,
			};
			const createdState = sharedWebGl;
			canvas.addEventListener('webglcontextlost', (event) => {
				event.preventDefault();
				for (const repaint of createdState.requestPaint) repaint();
			});
		} catch (error) {
			// Losing a context inside an HTML-in-canvas paint can crash Chromium.
			// https://issues.chromium.org/issues/575053149
			setTimeout(() => gl.getExtension('WEBGL_lose_context')?.loseContext(), 0);
			throw error;
		}
	}

	const state = sharedWebGl;
	state.users++;
	state.requestPaint.add(requestPaint);
	let disposed = false;
	return {
		backend: 'webgl2',
		isLost: () => state.gl.isContextLost(),
		addSample: (source, index, weight) => {
			const {gl, canvas, sourceTexture, accumulationTexture, framebuffer} =
				state;
			if (index === 0) {
				if (state.width !== width || state.height !== height) {
					canvas.width = width;
					canvas.height = height;
					gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
					gl.texImage2D(
						gl.TEXTURE_2D,
						0,
						gl.RGBA8,
						width,
						height,
						0,
						gl.RGBA,
						gl.UNSIGNED_BYTE,
						null,
					);
					gl.bindTexture(gl.TEXTURE_2D, accumulationTexture);
					gl.texImage2D(
						gl.TEXTURE_2D,
						0,
						gl.RGBA16F,
						width,
						height,
						0,
						gl.RGBA,
						gl.HALF_FLOAT,
						null,
					);
					gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
					gl.framebufferTexture2D(
						gl.FRAMEBUFFER,
						gl.COLOR_ATTACHMENT0,
						gl.TEXTURE_2D,
						accumulationTexture,
						0,
					);
					if (
						gl.checkFramebufferStatus(gl.FRAMEBUFFER) !==
						gl.FRAMEBUFFER_COMPLETE
					) {
						throw new Error('Motion blur WebGL framebuffer is incomplete');
					}

					state.width = width;
					state.height = height;
				}

				gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
				gl.viewport(0, 0, width, height);
				gl.clearColor(0, 0, 0, 0);
				gl.clear(gl.COLOR_BUFFER_BIT);
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.ONE, gl.ONE);
				gl.uniform1f(state.weight, weight);
			}

			gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
			gl.texSubImage2D(
				gl.TEXTURE_2D,
				0,
				0,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				source,
			);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		},
		finish: () => {
			const {gl} = state;
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.disable(gl.BLEND);
			gl.uniform1f(state.weight, 1);
			gl.bindTexture(gl.TEXTURE_2D, state.accumulationTexture);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			return state.canvas;
		},
		dispose: () => {
			if (disposed) return;
			disposed = true;
			state.requestPaint.delete(requestPaint);
			state.users--;
			if (state.users !== 0) return;
			const {gl, canvas} = state;
			if (sharedWebGl === state) sharedWebGl = null;
			canvas.width = 0;
			canvas.height = 0;
			setTimeout(() => gl.getExtension('WEBGL_lose_context')?.loseContext(), 0);
		},
	};
};

export const createMotionBlurCompositor = ({
	width,
	height,
	device,
	requestPaint,
}: {
	readonly width: number;
	readonly height: number;
	readonly device: GPUDevice | null;
	readonly requestPaint: () => void;
}): Compositor => {
	if (
		!device ||
		lostDevices.has(device) ||
		width > device.limits.maxTextureDimension2D ||
		height > device.limits.maxTextureDimension2D
	) {
		return createWebGlCompositor(width, height, requestPaint);
	}

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('webgpu');
	if (!context) return createWebGlCompositor(width, height, requestPaint);
	const sourceTexture = device.createTexture({
		size: [width, height],
		format: 'rgba8unorm',
		usage:
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.RENDER_ATTACHMENT,
	});
	const accumulationTexture = device.createTexture({
		size: [width, height],
		format: 'rgba16float',
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
	});
	const weight = device.createBuffer({
		size: 16,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});
	const format = navigator.gpu.getPreferredCanvasFormat();
	context.configure({
		device,
		format,
		alphaMode: 'premultiplied',
	});
	let pipelines = webGpuPipelines.get(device);
	if (!pipelines) {
		const module = device.createShaderModule({code: webGpuShader});
		const accumulation = device.createRenderPipeline({
			layout: 'auto',
			vertex: {module, entryPoint: 'vertex'},
			fragment: {
				module,
				entryPoint: 'accumulate',
				targets: [
					{
						format: 'rgba16float',
						blend: {
							color: {srcFactor: 'one', dstFactor: 'one', operation: 'add'},
							alpha: {srcFactor: 'one', dstFactor: 'one', operation: 'add'},
						},
					},
				],
			},
		});
		const output = device.createRenderPipeline({
			layout: 'auto',
			vertex: {module, entryPoint: 'vertex'},
			fragment: {module, entryPoint: 'resolve', targets: [{format}]},
		});
		pipelines = {accumulation, output};
		webGpuPipelines.set(device, pipelines);
	}

	const {accumulation: accumulationPipeline, output: outputPipeline} =
		pipelines;
	const sourceGroup = device.createBindGroup({
		layout: accumulationPipeline.getBindGroupLayout(0),
		entries: [
			{binding: 0, resource: sourceTexture.createView()},
			{binding: 1, resource: {buffer: weight}},
		],
	});
	const outputGroup = device.createBindGroup({
		layout: outputPipeline.getBindGroupLayout(0),
		entries: [{binding: 0, resource: accumulationTexture.createView()}],
	});
	let lost = false;
	let disposed = false;
	const listeners = deviceLossListeners.get(device)!;
	const onDeviceLost = () => {
		lost = true;
		requestPaint();
	};

	listeners.add(onDeviceLost);
	return {
		backend: 'webgpu',
		isLost: () => lost,
		addSample: (source, index, sampleWeight) => {
			if (index === 0) {
				device.queue.writeBuffer(weight, 0, new Float32Array([sampleWeight]));
			}

			device.queue.copyExternalImageToTexture(
				{source},
				{texture: sourceTexture, premultipliedAlpha: true},
				[width, height],
			);
			const encoder = device.createCommandEncoder();
			const pass = encoder.beginRenderPass({
				colorAttachments: [
					{
						view: accumulationTexture.createView(),
						clearValue: {r: 0, g: 0, b: 0, a: 0},
						loadOp: index === 0 ? 'clear' : 'load',
						storeOp: 'store',
					},
				],
			});
			pass.setPipeline(accumulationPipeline);
			pass.setBindGroup(0, sourceGroup);
			pass.draw(3);
			pass.end();
			device.queue.submit([encoder.finish()]);
		},
		finish: () => {
			const encoder = device.createCommandEncoder();
			const pass = encoder.beginRenderPass({
				colorAttachments: [
					{
						view: context.getCurrentTexture().createView(),
						clearValue: {r: 0, g: 0, b: 0, a: 0},
						loadOp: 'clear',
						storeOp: 'store',
					},
				],
			});
			pass.setPipeline(outputPipeline);
			pass.setBindGroup(0, outputGroup);
			pass.draw(3);
			pass.end();
			device.queue.submit([encoder.finish()]);
			return canvas;
		},
		dispose: () => {
			if (disposed) return;
			disposed = true;
			listeners.delete(onDeviceLost);
			sourceTexture.destroy();
			accumulationTexture.destroy();
			weight.destroy();
			context.unconfigure();
			canvas.width = 0;
			canvas.height = 0;
		},
	};
};
