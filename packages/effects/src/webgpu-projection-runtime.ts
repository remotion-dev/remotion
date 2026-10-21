export type WebGpuProjectionState = {
	context: GPUCanvasContext;
	resources: {
		device: GPUDevice;
		pipeline: GPURenderPipeline;
		uniforms: GPUBuffer;
		sampler: GPUSampler;
		texture: GPUTexture;
		bindGroup: GPUBindGroup;
		width: number;
		height: number;
	} | null;
};

export const cleanupWebGpuProjection = (state: WebGpuProjectionState): void => {
	state.resources?.texture.destroy();
	state.resources?.uniforms.destroy();
	state.resources = null;
	state.context.unconfigure();
};

export const setupWebGpuProjection = (
	target: HTMLCanvasElement,
	label: string,
): WebGpuProjectionState => {
	const context = target.getContext('webgpu');
	if (!context) {
		throw new Error(`WebGPU is not available for the ${label} effect`);
	}

	return {context: context as GPUCanvasContext, resources: null};
};

export const applyWebGpuProjection = ({
	state,
	source,
	width,
	height,
	device,
	shader,
	uniformData,
}: {
	state: WebGpuProjectionState;
	source: CanvasImageSource;
	width: number;
	height: number;
	device: GPUDevice;
	shader: string;
	uniformData: Float32Array<ArrayBuffer>;
}): void => {
	if (
		state.resources &&
		(state.resources.device !== device ||
			state.resources.width !== width ||
			state.resources.height !== height)
	) {
		cleanupWebGpuProjection(state);
	}

	if (!state.resources) {
		const format = navigator.gpu.getPreferredCanvasFormat();
		state.context.configure({device, format, alphaMode: 'premultiplied'});
		const module = device.createShaderModule({code: shader});
		const pipeline = device.createRenderPipeline({
			layout: 'auto',
			vertex: {module, entryPoint: 'vertex'},
			fragment: {module, entryPoint: 'fragment', targets: [{format}]},
			primitive: {topology: 'triangle-list'},
		});
		const uniforms = device.createBuffer({
			size: uniformData.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		const sampler = device.createSampler({
			addressModeU: 'repeat',
			magFilter: 'linear',
			minFilter: 'linear',
		});
		const texture = device.createTexture({
			size: [width, height],
			format: 'rgba8unorm',
			usage:
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.COPY_DST |
				GPUTextureUsage.RENDER_ATTACHMENT,
		});
		const bindGroup = device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: [
				{binding: 0, resource: texture.createView()},
				{binding: 1, resource: sampler},
				{binding: 2, resource: {buffer: uniforms}},
			],
		});
		state.resources = {
			device,
			pipeline,
			uniforms,
			sampler,
			texture,
			bindGroup,
			width,
			height,
		};
	}

	const {resources} = state;
	device.queue.copyExternalImageToTexture(
		{source: source as GPUCopyExternalImageSource},
		{texture: resources.texture, premultipliedAlpha: true},
		[width, height],
	);
	device.queue.writeBuffer(resources.uniforms, 0, uniformData);
	const encoder = device.createCommandEncoder();
	const pass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: state.context.getCurrentTexture().createView(),
				clearValue: {r: 0, g: 0, b: 0, a: 0},
				loadOp: 'clear',
				storeOp: 'store',
			},
		],
	});
	pass.setPipeline(resources.pipeline);
	pass.setBindGroup(0, resources.bindGroup);
	pass.draw(3);
	pass.end();
	device.queue.submit([encoder.finish()]);
};
