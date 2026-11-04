// Pipelines and samplers are immutable. Uniforms, textures, and their bind
// groups stay local to each effect so interleaved draws cannot overwrite them.
const deviceResources = new WeakMap<
	GPUDevice,
	{
		sampler: GPUSampler;
		pipelines: Map<string, Map<GPUTextureFormat, GPURenderPipeline>>;
	}
>();
const lostDevices = new WeakSet<GPUDevice>();

export type WebGpuProjectionState = {
	context: GPUCanvasContext;
	resources: {
		device: GPUDevice;
		shader: string;
		format: GPUTextureFormat;
		pipeline: GPURenderPipeline;
		uniforms: GPUBuffer;
		sampler: GPUSampler;
		source: {
			texture: GPUTexture;
			bindGroup: GPUBindGroup;
			width: number;
			height: number;
		} | null;
	} | null;
};

export const cleanupWebGpuProjection = (state: WebGpuProjectionState): void => {
	state.resources?.source?.texture.destroy();
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
	if (lostDevices.has(device)) {
		throw new Error('Cannot apply a WebGPU projection with a lost device');
	}

	// Sources such as Solid's 1x1 canvas are sampled at output resolution. The
	// upload must use the source's actual extent; copyExternalImageToTexture does not scale.
	const width =
		'displayWidth' in source
			? source.displayWidth
			: 'videoWidth' in source
				? source.videoWidth
				: 'naturalWidth' in source
					? source.naturalWidth
					: typeof source.width === 'number'
						? source.width
						: source.width.baseVal.value;
	const height =
		'displayHeight' in source
			? source.displayHeight
			: 'videoHeight' in source
				? source.videoHeight
				: 'naturalHeight' in source
					? source.naturalHeight
					: typeof source.height === 'number'
						? source.height
						: source.height.baseVal.value;
	const format = navigator.gpu.getPreferredCanvasFormat();
	if (
		state.resources &&
		(state.resources.device !== device ||
			state.resources.shader !== shader ||
			state.resources.format !== format ||
			state.resources.uniforms.size !== uniformData.byteLength)
	) {
		cleanupWebGpuProjection(state);
	}

	if (!state.resources) {
		let shared = deviceResources.get(device);
		if (!shared) {
			const pipelines = new Map<
				string,
				Map<GPUTextureFormat, GPURenderPipeline>
			>();
			shared = {
				pipelines,
				sampler: device.createSampler({
					addressModeU: 'repeat',
					magFilter: 'linear',
					minFilter: 'linear',
				}),
			};
			deviceResources.set(device, shared);
			device.lost.then(() => {
				lostDevices.add(device);
				pipelines.clear();
				deviceResources.delete(device);
			});
		}

		let pipelinesByFormat = shared.pipelines.get(shader);
		if (!pipelinesByFormat) {
			pipelinesByFormat = new Map();
			shared.pipelines.set(shader, pipelinesByFormat);
		}

		let pipeline = pipelinesByFormat.get(format);
		if (!pipeline) {
			const module = device.createShaderModule({code: shader});
			pipeline = device.createRenderPipeline({
				layout: 'auto',
				vertex: {module, entryPoint: 'vertex'},
				fragment: {module, entryPoint: 'fragment', targets: [{format}]},
				primitive: {topology: 'triangle-list'},
			});
			pipelinesByFormat.set(format, pipeline);
		}

		state.context.configure({device, format, alphaMode: 'premultiplied'});
		const uniforms = device.createBuffer({
			size: uniformData.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		state.resources = {
			device,
			shader,
			format,
			pipeline,
			uniforms,
			sampler: shared.sampler,
			source: null,
		};
	}

	const {resources} = state;
	if (
		!resources.source ||
		resources.source.width !== width ||
		resources.source.height !== height
	) {
		const texture = device.createTexture({
			size: [width, height],
			format: 'rgba8unorm',
			usage:
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.COPY_DST |
				GPUTextureUsage.RENDER_ATTACHMENT,
		});
		try {
			const bindGroup = device.createBindGroup({
				layout: resources.pipeline.getBindGroupLayout(0),
				entries: [
					{binding: 0, resource: texture.createView()},
					{binding: 1, resource: resources.sampler},
					{binding: 2, resource: {buffer: resources.uniforms}},
				],
			});
			resources.source?.texture.destroy();
			resources.source = {texture, bindGroup, width, height};
		} catch (err) {
			texture.destroy();
			throw err;
		}
	}

	device.queue.copyExternalImageToTexture(
		{source: source as GPUCopyExternalImageSource},
		{texture: resources.source.texture, premultipliedAlpha: true},
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
	pass.setBindGroup(0, resources.source.bindGroup);
	pass.draw(3);
	pass.end();
	device.queue.submit([encoder.finish()]);
};
