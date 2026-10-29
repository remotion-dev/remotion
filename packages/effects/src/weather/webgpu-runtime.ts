import {parseColorRgba, type ParsedColorRgba} from '../color-utils.js';
import type {WeatherRenderParams} from './runtime.js';
import {WEATHER_WEBGPU_SHADER} from './webgpu-shader.js';

export type WeatherWebGpuState = {
	readonly context: GPUCanvasContext;
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string | null;
	cachedColorRgba: ParsedColorRgba;
	resources: {
		readonly device: GPUDevice;
		readonly particles: GPURenderPipeline;
		readonly composite: GPURenderPipeline;
		readonly uniforms: GPUBuffer;
		readonly sampler: GPUSampler;
		textures: {
			readonly source: GPUTexture;
			readonly weather: GPUTexture;
			readonly particleGroup: GPUBindGroup;
			readonly compositeGroup: GPUBindGroup;
			readonly width: number;
			readonly height: number;
			readonly sourceWidth: number;
			readonly sourceHeight: number;
		} | null;
	} | null;
};

export const setupWeatherWebGpu = (
	target: HTMLCanvasElement,
): WeatherWebGpuState => {
	const context = target.getContext('webgpu');
	if (!context) throw new Error('WebGPU is not available for weather effects');
	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;
	const colorCtx = canvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx)
		throw new Error('Could not create weather color parsing context');
	return {
		context: context as GPUCanvasContext,
		colorCtx,
		cachedColor: null,
		cachedColorRgba: [0, 0, 0, 0],
		resources: null,
	};
};

export const cleanupWeatherWebGpu = (state: WeatherWebGpuState): void => {
	state.resources?.textures?.source.destroy();
	state.resources?.textures?.weather.destroy();
	state.resources?.uniforms.destroy();
	state.resources = null;
	state.context.unconfigure();
};

export const drawWeatherWebGpu = ({
	state,
	source,
	width,
	height,
	device,
	params,
	type,
}: {
	state: WeatherWebGpuState;
	source: CanvasImageSource;
	width: number;
	height: number;
	device: GPUDevice;
	params: WeatherRenderParams;
	type: 'rain' | 'snow';
}): void => {
	if (state.cachedColor !== params.color) {
		state.cachedColorRgba = parseColorRgba(state.colorCtx, params.color);
		state.cachedColor = params.color;
	}

	if (state.resources && state.resources.device !== device)
		cleanupWeatherWebGpu(state);
	if (!state.resources) {
		const format = navigator.gpu.getPreferredCanvasFormat();
		state.context.configure({device, format, alphaMode: 'premultiplied'});
		const module = device.createShaderModule({
			code: WEATHER_WEBGPU_SHADER,
			label: 'weather',
		});
		const particles = device.createRenderPipeline({
			layout: 'auto',
			vertex: {module, entryPoint: 'particleVertex'},
			fragment: {
				module,
				entryPoint: 'particleFragment',
				targets: [
					{
						format: 'rgba16float',
						blend: {
							color: {srcFactor: 'one', dstFactor: 'one-minus-src-alpha'},
							alpha: {srcFactor: 'one', dstFactor: 'one-minus-src-alpha'},
						},
					},
				],
			},
			primitive: {topology: 'triangle-strip'},
		});
		const composite = device.createRenderPipeline({
			layout: 'auto',
			vertex: {module, entryPoint: 'vertex'},
			fragment: {module, entryPoint: 'fragment', targets: [{format}]},
			primitive: {topology: 'triangle-list'},
		});
		const uniforms = device.createBuffer({
			size: 112,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		const sampler = device.createSampler({
			minFilter: 'linear',
			magFilter: 'linear',
		});
		state.resources = {
			device,
			particles,
			composite,
			uniforms,
			sampler,
			textures: null,
		};
	}

	const {resources} = state;
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
		resources.textures &&
		(resources.textures.width !== width ||
			resources.textures.height !== height ||
			resources.textures.sourceWidth !== sourceWidth ||
			resources.textures.sourceHeight !== sourceHeight)
	) {
		resources.textures.source.destroy();
		resources.textures.weather.destroy();
		resources.textures = null;
	}

	if (!resources.textures) {
		const sourceTexture = device.createTexture({
			size: [sourceWidth, sourceHeight],
			format: 'rgba8unorm',
			usage:
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.COPY_DST |
				GPUTextureUsage.RENDER_ATTACHMENT,
		});
		const weather = device.createTexture({
			size: [width, height],
			format: 'rgba16float',
			usage:
				GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
		});
		const particleGroup = device.createBindGroup({
			layout: resources.particles.getBindGroupLayout(0),
			entries: [
				{binding: 0, resource: sourceTexture.createView()},
				{binding: 2, resource: {buffer: resources.uniforms}},
			],
		});
		const compositeGroup = device.createBindGroup({
			layout: resources.composite.getBindGroupLayout(0),
			entries: [
				{binding: 0, resource: sourceTexture.createView()},
				{binding: 1, resource: resources.sampler},
				{binding: 2, resource: {buffer: resources.uniforms}},
				{binding: 3, resource: weather.createView()},
			],
		});
		resources.textures = {
			source: sourceTexture,
			weather,
			particleGroup,
			compositeGroup,
			width,
			height,
			sourceWidth,
			sourceHeight,
		};
	}

	const {textures} = resources;
	const color = state.cachedColorRgba;
	const uniformData = new Float32Array([
		width,
		height,
		params.offset[0],
		params.offset[1],
		color[0] / 255,
		color[1] / 255,
		color[2] / 255,
		color[3] / 255,
		type === 'snow' ? 1 : 0,
		params.time,
		0,
		params.size,
		params.sizeVariation,
		params.sceneDepth,
		params.speed,
		params.speedVariation,
		params.wind,
		params.windVariation,
		params.spread,
		params.wiggleAmount,
		params.wiggleAmountVariation,
		params.wiggleFrequency,
		params.wiggleFrequencyVariation,
		params.opacity,
		params.appearance === 'refracting' ? 1 : 0,
		params.compositeWithOriginal ? 1 : 0,
		params.transferMode === 'lighten' ? 1 : 0,
		0,
	]);
	new Uint32Array(uniformData.buffer)[10] = params.seed;
	device.queue.writeBuffer(resources.uniforms, 0, uniformData);
	device.queue.copyExternalImageToTexture(
		{source: source as GPUCopyExternalImageSource},
		{texture: textures.source, premultipliedAlpha: true},
		[sourceWidth, sourceHeight],
	);
	const encoder = device.createCommandEncoder();
	const particlePass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: textures.weather.createView(),
				clearValue: {r: 0, g: 0, b: 0, a: 0},
				loadOp: 'clear',
				storeOp: 'store',
			},
		],
	});
	particlePass.setPipeline(resources.particles);
	particlePass.setBindGroup(0, textures.particleGroup);
	particlePass.draw(4, params.count);
	particlePass.end();
	const compositePass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: state.context.getCurrentTexture().createView(),
				clearValue: {r: 0, g: 0, b: 0, a: 0},
				loadOp: 'clear',
				storeOp: 'store',
			},
		],
	});
	compositePass.setPipeline(resources.composite);
	compositePass.setBindGroup(0, textures.compositeGroup);
	compositePass.draw(3);
	compositePass.end();
	device.queue.submit([encoder.finish()]);
};
