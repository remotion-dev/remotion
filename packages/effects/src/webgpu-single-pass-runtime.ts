export type WebGpuSinglePassState = {
	readonly context: GPUCanvasContext;
	readonly label: string;
	resources: {
		readonly device: GPUDevice;
		readonly shader: string;
		readonly uniformBufferSize: number;
		readonly sourceFilter: GPUFilterMode;
		readonly auxiliary: {
			readonly texture: GPUTexture;
			readonly width: number;
			readonly height: number;
			readonly format: 'rgba8unorm' | 'rgba32float';
			uploadedData: Uint8Array<ArrayBuffer> | Float32Array<ArrayBuffer> | null;
		} | null;
		readonly pipeline: GPURenderPipeline;
		readonly uniforms: GPUBuffer;
		readonly sampler: GPUSampler;
		readonly bindGroupLayout: GPUBindGroupLayout;
		source: {
			readonly texture: GPUTexture;
			readonly bindGroup: GPUBindGroup;
			readonly width: number;
			readonly height: number;
		} | null;
	} | null;
};

// WebGPU texture coordinates and fragment positions have a top-left origin.
// WebGL shaders using vUv must invert its Y coordinate when porting their math.
export const WEBGPU_SINGLE_PASS_VERTEX = /* wgsl */ `
struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
}

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput {
	let positions = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
	let position = positions[index];
	var output: VertexOutput;
	output.position = vec4f(position, 0, 1);
	output.uv = vec2f(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
	return output;
}
`;

export const setupWebGpuSinglePass = (
	target: HTMLCanvasElement,
	label: string,
): WebGpuSinglePassState => {
	const context = target.getContext('webgpu');
	if (!context) {
		throw new Error(`WebGPU is not available for the ${label} effect`);
	}

	return {context: context as GPUCanvasContext, label, resources: null};
};

export const cleanupWebGpuSinglePass = (state: WebGpuSinglePassState): void => {
	state.resources?.source?.texture.destroy();
	state.resources?.uniforms.destroy();
	state.resources?.auxiliary?.texture.destroy();
	state.resources = null;
	state.context.unconfigure();
};

export const applyWebGpuSinglePass = (
	{
		state,
		source,
		device,
		shader,
		uniformData,
	}: {
		state: WebGpuSinglePassState;
		source: CanvasImageSource;
		width: number;
		height: number;
		device: GPUDevice;
		shader: string;
		uniformData: Float32Array<ArrayBuffer>;
	},
	options: {
		sourceFilter: GPUFilterMode | null;
		// Auxiliary pixels are immutable: replace the array whenever their contents change.
		auxiliaryTexture: {
			data: Uint8Array<ArrayBuffer> | Float32Array<ArrayBuffer>;
			width: number;
			height: number;
			format: 'rgba8unorm' | 'rgba32float';
		} | null;
	} | null = null,
): void => {
	const sourceFilter = options?.sourceFilter ?? 'linear';
	const auxiliaryTexture = options?.auxiliaryTexture ?? null;
	// Upload the source's actual extent, which can differ from the output size
	// (for example Solid's 1x1 source). Sampling performs the scaling.
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
	const uniformBufferSize = Math.max(
		16,
		Math.ceil(uniformData.byteLength / 16) * 16,
	);
	if (
		state.resources &&
		(state.resources.device !== device ||
			state.resources.shader !== shader ||
			state.resources.uniformBufferSize !== uniformBufferSize ||
			state.resources.sourceFilter !== sourceFilter ||
			(state.resources.auxiliary?.width ?? null) !==
				(auxiliaryTexture?.width ?? null) ||
			(state.resources.auxiliary?.height ?? null) !==
				(auxiliaryTexture?.height ?? null) ||
			(state.resources.auxiliary?.format ?? null) !==
				(auxiliaryTexture?.format ?? null))
	) {
		cleanupWebGpuSinglePass(state);
	}

	if (!state.resources) {
		const format = navigator.gpu.getPreferredCanvasFormat();
		state.context.configure({device, format, alphaMode: 'premultiplied'});
		const module = device.createShaderModule({
			code: shader,
			label: state.label,
		});
		// Keep the same binding contract even if a shader uses textureLoad or
		// generates its pixels without sampling the source.
		const bindGroupLayout = device.createBindGroupLayout({
			entries: [
				...(auxiliaryTexture
					? [
							{
								binding: 3,
								visibility: GPUShaderStage.FRAGMENT,
								texture: {
									sampleType:
										auxiliaryTexture.format === 'rgba32float'
											? ('unfilterable-float' as const)
											: ('float' as const),
								},
							},
						]
					: []),
				{binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {}},
				{binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {}},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {type: 'uniform'},
				},
			],
		});
		const pipeline = device.createRenderPipeline({
			label: state.label,
			layout: device.createPipelineLayout({
				bindGroupLayouts: [bindGroupLayout],
			}),
			vertex: {module, entryPoint: 'vertex'},
			fragment: {module, entryPoint: 'fragment', targets: [{format}]},
			primitive: {topology: 'triangle-list'},
		});
		const uniforms = device.createBuffer({
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		const sampler = device.createSampler({
			addressModeU: 'clamp-to-edge',
			addressModeV: 'clamp-to-edge',
			magFilter: sourceFilter,
			minFilter: sourceFilter,
		});
		const auxiliary = auxiliaryTexture
			? {
					texture: device.createTexture({
						size: [auxiliaryTexture.width, auxiliaryTexture.height],
						format: auxiliaryTexture.format,
						usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
					}),
					width: auxiliaryTexture.width,
					height: auxiliaryTexture.height,
					format: auxiliaryTexture.format,
					uploadedData: null,
				}
			: null;
		state.resources = {
			device,
			shader,
			uniformBufferSize,
			sourceFilter,
			auxiliary,
			pipeline,
			uniforms,
			sampler,
			bindGroupLayout,
			source: null,
		};
	}

	const {resources} = state;
	if (
		resources.source &&
		(resources.source.width !== width || resources.source.height !== height)
	) {
		resources.source.texture.destroy();
		resources.source = null;
	}

	if (!resources.source) {
		const texture = device.createTexture({
			size: [width, height],
			format: 'rgba8unorm',
			usage:
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.COPY_DST |
				GPUTextureUsage.RENDER_ATTACHMENT,
		});
		const bindGroup = device.createBindGroup({
			layout: resources.bindGroupLayout,
			entries: [
				...(resources.auxiliary
					? [{binding: 3, resource: resources.auxiliary.texture.createView()}]
					: []),
				{binding: 0, resource: texture.createView()},
				{binding: 1, resource: resources.sampler},
				{binding: 2, resource: {buffer: resources.uniforms}},
			],
		});
		resources.source = {texture, bindGroup, width, height};
	}

	if (
		auxiliaryTexture &&
		resources.auxiliary &&
		resources.auxiliary.uploadedData !== auxiliaryTexture.data
	) {
		device.queue.writeTexture(
			{texture: resources.auxiliary.texture},
			auxiliaryTexture.data,
			{
				bytesPerRow:
					auxiliaryTexture.width * 4 * auxiliaryTexture.data.BYTES_PER_ELEMENT,
			},
			[auxiliaryTexture.width, auxiliaryTexture.height],
		);
		resources.auxiliary.uploadedData = auxiliaryTexture.data;
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
