import {WEBGPU_SINGLE_PASS_VERTEX} from './webgpu-single-pass-runtime.js';

export const WEBGPU_MULTIPASS_BINDINGS = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var secondary: texture_2d<f32>;
`;

export type WebGpuPass = {
	readonly shader: string;
	readonly uniforms: Float32Array<ArrayBuffer>;
	// -1 selects the original image; other indices select a preceding pass.
	// The secondary input can also use -2 for the auxiliary canvas.
	readonly source: number;
	readonly secondary: number;
};

type PassResources = {
	readonly shader: string;
	readonly size: number;
	readonly format: GPUTextureFormat;
	readonly pipeline: GPURenderPipeline;
	readonly uniforms: GPUBuffer;
};

export type WebGpuMultipassState = {
	readonly context: GPUCanvasContext;
	readonly label: string;
	resources: {
		readonly device: GPUDevice;
		readonly layout: GPUBindGroupLayout;
		readonly sampler: GPUSampler;
		readonly format: GPUTextureFormat;
		readonly passes: PassResources[];
		readonly textures: GPUTexture[];
		auxiliary: {
			readonly texture: GPUTexture;
			readonly width: number;
			readonly height: number;
		} | null;
		width: number;
		height: number;
		source: {
			readonly texture: GPUTexture;
			readonly width: number;
			readonly height: number;
		} | null;
	} | null;
};

export const setupWebGpuMultipass = (
	target: HTMLCanvasElement,
	label: string,
): WebGpuMultipassState => {
	const context = target.getContext('webgpu');
	if (!context)
		throw new Error(`WebGPU is not available for the ${label} effect`);
	return {context: context as GPUCanvasContext, label, resources: null};
};

export const cleanupWebGpuMultipass = (state: WebGpuMultipassState): void => {
	state.resources?.source?.texture.destroy();
	state.resources?.auxiliary?.texture.destroy();
	state.resources?.textures.forEach((texture) => texture.destroy());
	state.resources?.passes.forEach((pass) => pass.uniforms.destroy());
	state.resources = null;
	state.context.unconfigure();
};

export const applyWebGpuMultipass = ({
	state,
	source,
	width,
	height,
	device,
	passes,
	auxiliarySource,
}: {
	state: WebGpuMultipassState;
	source: CanvasImageSource;
	width: number;
	height: number;
	device: GPUDevice;
	passes: readonly WebGpuPass[];
	auxiliarySource: HTMLCanvasElement | null;
}): void => {
	if (state.resources && state.resources.device !== device)
		cleanupWebGpuMultipass(state);
	if (!state.resources) {
		const format = navigator.gpu.getPreferredCanvasFormat();
		state.context.configure({device, format, alphaMode: 'premultiplied'});
		const layout = device.createBindGroupLayout({
			entries: [
				{binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {}},
				{binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {}},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {type: 'uniform'},
				},
				{binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: {}},
			],
		});
		state.resources = {
			device,
			format,
			layout,
			sampler: device.createSampler({magFilter: 'linear', minFilter: 'linear'}),
			passes: [],
			textures: [],
			source: null,
			auxiliary: null,
			width,
			height,
		};
	}

	const r = state.resources;
	const sourceWidth =
		'displayWidth' in source
			? source.displayWidth
			: 'videoWidth' in source
				? source.videoWidth
				: 'naturalWidth' in source
					? source.naturalWidth
					: typeof source.width === 'number'
						? source.width
						: source.width.baseVal.value;
	const sourceHeight =
		'displayHeight' in source
			? source.displayHeight
			: 'videoHeight' in source
				? source.videoHeight
				: 'naturalHeight' in source
					? source.naturalHeight
					: typeof source.height === 'number'
						? source.height
						: source.height.baseVal.value;
	if (
		r.source &&
		(r.source.width !== sourceWidth || r.source.height !== sourceHeight)
	) {
		r.source.texture.destroy();
		r.source = null;
	}

	if (!r.source) {
		r.source = {
			width: sourceWidth,
			height: sourceHeight,
			texture: device.createTexture({
				size: [sourceWidth, sourceHeight],
				format: 'rgba8unorm',
				usage:
					GPUTextureUsage.TEXTURE_BINDING |
					GPUTextureUsage.COPY_DST |
					GPUTextureUsage.RENDER_ATTACHMENT,
			}),
		};
	}

	device.queue.copyExternalImageToTexture(
		{source: source as GPUCopyExternalImageSource},
		{texture: r.source.texture, premultipliedAlpha: true},
		[sourceWidth, sourceHeight],
	);
	if (
		r.auxiliary &&
		(!auxiliarySource ||
			r.auxiliary.width !== auxiliarySource.width ||
			r.auxiliary.height !== auxiliarySource.height)
	) {
		r.auxiliary.texture.destroy();
		r.auxiliary = null;
	}

	if (auxiliarySource) {
		if (!r.auxiliary)
			r.auxiliary = {
				width: auxiliarySource.width,
				height: auxiliarySource.height,
				texture: device.createTexture({
					size: [auxiliarySource.width, auxiliarySource.height],
					format: 'rgba8unorm',
					usage:
						GPUTextureUsage.TEXTURE_BINDING |
						GPUTextureUsage.COPY_DST |
						GPUTextureUsage.RENDER_ATTACHMENT,
				}),
			};
		device.queue.copyExternalImageToTexture(
			{source: auxiliarySource},
			{texture: r.auxiliary.texture, premultipliedAlpha: true},
			[auxiliarySource.width, auxiliarySource.height],
		);
	}

	if (r.width !== width || r.height !== height) {
		r.textures.forEach((texture) => texture.destroy());
		r.textures.length = 0;
		r.width = width;
		r.height = height;
	}

	// Reuse an intermediate after its last reader. Long shadows can use many
	// extension passes, but only need two full-size intermediate textures.
	const lastReaders = passes.map((_, index) => index);
	for (let index = 0; index < passes.length; index++) {
		for (const input of [passes[index].source, passes[index].secondary]) {
			if (input >= 0) lastReaders[input] = index;
		}
	}

	const outputSlots: number[] = [];
	const freeAfter: number[] = [];
	for (let index = 0; index < passes.length - 1; index++) {
		let slot = freeAfter.findIndex((lastReader) => lastReader < index);
		if (slot === -1) slot = freeAfter.length;
		freeAfter[slot] = lastReaders[index];
		outputSlots.push(slot);
	}

	while (r.textures.length < freeAfter.length) {
		r.textures.push(
			device.createTexture({
				size: [width, height],
				format: 'rgba8unorm',
				usage:
					GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
			}),
		);
	}

	// Release temporary targets and uniform buffers when an animated effect uses fewer passes.
	while (r.textures.length > freeAfter.length) r.textures.pop()?.destroy();
	while (r.passes.length > passes.length) r.passes.pop()?.uniforms.destroy();
	const encoder = device.createCommandEncoder();
	for (let index = 0; index < passes.length; index++) {
		const pass = passes[index];
		const format = index === passes.length - 1 ? r.format : 'rgba8unorm';
		const size = Math.max(16, Math.ceil(pass.uniforms.byteLength / 16) * 16);
		let resources = r.passes[index];
		if (
			!resources ||
			resources.shader !== pass.shader ||
			resources.size !== size ||
			resources.format !== format
		) {
			resources?.uniforms.destroy();
			const module = device.createShaderModule({
				code: pass.shader,
				label: state.label,
			});
			resources = {
				shader: pass.shader,
				size,
				format,
				pipeline: device.createRenderPipeline({
					label: state.label,
					layout: device.createPipelineLayout({bindGroupLayouts: [r.layout]}),
					vertex: {module, entryPoint: 'vertex'},
					fragment: {module, entryPoint: 'fragment', targets: [{format}]},
					primitive: {topology: 'triangle-list'},
				}),
				uniforms: device.createBuffer({
					size,
					usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
				}),
			};
			r.passes[index] = resources;
		}

		device.queue.writeBuffer(resources.uniforms, 0, pass.uniforms);
		const bindGroup = device.createBindGroup({
			layout: r.layout,
			entries: [
				{
					binding: 0,
					resource: (pass.source === -1
						? r.source.texture
						: r.textures[outputSlots[pass.source]]
					).createView(),
				},
				{binding: 1, resource: r.sampler},
				{binding: 2, resource: {buffer: resources.uniforms}},
				{
					binding: 3,
					resource: (pass.secondary === -2 && r.auxiliary
						? r.auxiliary.texture
						: pass.secondary === -1
							? r.source.texture
							: r.textures[outputSlots[pass.secondary]]
					).createView(),
				},
			],
		});
		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: (index === passes.length - 1
						? state.context.getCurrentTexture()
						: r.textures[outputSlots[index]]
					).createView(),
					clearValue: {r: 0, g: 0, b: 0, a: 0},
					loadOp: 'clear',
					storeOp: 'store',
				},
			],
		});
		renderPass.setPipeline(resources.pipeline);
		renderPass.setBindGroup(0, bindGroup);
		renderPass.draw(3);
		renderPass.end();
	}

	device.queue.submit([encoder.finish()]);
};
