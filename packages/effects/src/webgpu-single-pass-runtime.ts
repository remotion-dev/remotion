import {Internals, type EffectContentRect} from 'remotion';
import {
	createEffectGeometryBuffer,
	type EffectGeometryBuffer,
	EFFECT_COORDINATES_WGSL,
	writeEffectGeometry,
} from './effect-coordinates.js';
import {getSharedWebGpuResources} from './shared-webgpu-resources.js';

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
		readonly format: GPUTextureFormat;
		readonly pipelines: Map<OutputVariant, GPURenderPipeline>;
		readonly pipelineLayout: GPUPipelineLayout;
		readonly uniforms: GPUBuffer;
		readonly geometry: EffectGeometryBuffer;
		readonly sampler: GPUSampler;
		readonly bindGroupLayout: GPUBindGroupLayout;
		source: {
			readonly texture: GPUTexture;
			readonly bindGroup: GPUBindGroup;
			readonly width: number;
			readonly height: number;
			readonly format: GPUTextureFormat;
		} | null;
		readonly upstreamBindGroups: WeakMap<PreciseImage, GPUBindGroup>;
		precise: PreciseImage | null;
	} | null;
};

// An effect's output kept at 16-bit float precision, handed to the next
// single-pass effect through the chain link so it skips the 8-bit canvas.
type PreciseImage = {
	readonly texture: GPUTexture;
	readonly view: GPUTextureView;
	readonly device: GPUDevice;
	readonly width: number;
	readonly height: number;
	destroyed: boolean;
};

type OutputVariant = 'plain' | 'float' | 'dither';

const FRAGMENT_ENTRY =
	'@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {';

// An 8-bit canvas clamps on store. Intermediates keep that contract.
const FLOAT_OUTPUT = /* wgsl */ `
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	return clamp(effectFragment(input), vec4f(0.0), vec4f(1.0));
}
`;

// The last effect of a chain writes the 8-bit canvas. Without dither, smooth
// gradients from a precise chain still round into visible steps.
const DITHERED_OUTPUT = /* wgsl */ `
fn ditherHash(pixel: vec2u) -> f32 {
	var value = pixel.x * 1664525u + pixel.y * 1013904223u;
	value = value ^ (value >> 16u);
	value = value * 2246822519u;
	value = value ^ (value >> 13u);
	return f32(value & 65535u) / 65535.0;
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let color = effectFragment(input);
	let alpha = clamp(color.a, 0.0, 1.0);
	// +/- 0.36 of an 8-bit step, so values that are exact 8-bit codes still
	// round back to themselves after float16 storage.
	let pixel = vec2i(floor(input.position.xy - effectGeometry.contentRect.xy));
	let noise = (ditherHash(bitcast<vec2u>(pixel)) - 0.5) * (0.72 / 255.0);
	return vec4f(clamp(color.rgb + vec3f(noise), vec3f(0.0), vec3f(alpha)), alpha);
}
`;

const shaderForVariant = (shader: string, variant: OutputVariant): string =>
	variant === 'plain'
		? shader
		: shader.replace(
				FRAGMENT_ENTRY,
				'fn effectFragment(input: VertexOutput) -> vec4f {',
			) + (variant === 'float' ? FLOAT_OUTPUT : DITHERED_OUTPUT);

// Devices on which a float frame failed validation keep the 8-bit path.
const floatRejected = new WeakSet<GPUDevice>();

const releasePrecise = (
	resources: NonNullable<WebGpuSinglePassState['resources']>,
): void => {
	if (!resources.precise) return;
	resources.precise.destroyed = true;
	resources.precise.texture.destroy();
	resources.precise = null;
};

// WebGPU texture coordinates and fragment positions have a top-left origin.
// WebGL shaders using vUv must invert its Y coordinate when porting their math.
export const WEBGPU_SINGLE_PASS_VERTEX = /* wgsl */ `
${EFFECT_COORDINATES_WGSL}
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
	state.resources?.geometry.buffer.destroy();
	state.resources?.auxiliary?.texture.destroy();
	if (state.resources) releasePrecise(state.resources);
	state.resources = null;
	state.context.unconfigure();
};

export const applyWebGpuSinglePass = (
	{
		state,
		source,
		device,
		width: outputWidth,
		height: outputHeight,
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
	contentRect: EffectContentRect | null = null,
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
	const target = state.context.canvas as HTMLCanvasElement;
	const link = Internals.getEffectChainLink(target);
	// Shaders with a different fragment signature keep the 8-bit path.
	const floatCapable =
		link !== null &&
		shader.split(FRAGMENT_ENTRY).length === 2 &&
		!floatRejected.has(device);
	const upstreamCandidate = floatCapable
		? (Internals.getEffectChainLink(source)?.precise as PreciseImage | null)
		: null;
	const upstream =
		upstreamCandidate &&
		!upstreamCandidate.destroyed &&
		upstreamCandidate.device === device
			? upstreamCandidate
			: null;
	// The last effect only gains from 16-bit input handed over by a previous
	// effect. On an 8-bit source it renders exactly as without this path.
	const float = floatCapable && (!link.final || upstream !== null);
	const variant: OutputVariant = !float
		? 'plain'
		: link.final
			? 'dither'
			: 'float';
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
		const shared = getSharedWebGpuResources({
			device,
			key: JSON.stringify([
				'single-pass-layout',
				sourceFilter,
				auxiliaryTexture?.format ?? null,
			]),
			create: () => {
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
						{
							binding: 4,
							visibility: GPUShaderStage.FRAGMENT,
							buffer: {type: 'uniform'},
						},
					],
				});
				const pipelineLayout = device.createPipelineLayout({
					bindGroupLayouts: [bindGroupLayout],
				});
				const sampler = device.createSampler({
					addressModeU: 'clamp-to-edge',
					addressModeV: 'clamp-to-edge',
					magFilter: sourceFilter,
					minFilter: sourceFilter,
				});
				return {sampler, bindGroupLayout, pipelineLayout};
			},
		});
		const uniforms = device.createBuffer({
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
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
			format,
			pipelines: new Map(),
			pipelineLayout: shared.pipelineLayout,
			uniforms,
			geometry: createEffectGeometryBuffer(device),
			sampler: shared.sampler,
			bindGroupLayout: shared.bindGroupLayout,
			source: null,
			upstreamBindGroups: new WeakMap(),
			precise: null,
		};
	}

	const {resources} = state;
	const pipelineFor = (
		pipelineVariant: OutputVariant,
		targetFormat: GPUTextureFormat,
	): GPURenderPipeline => {
		const cached = resources.pipelines.get(pipelineVariant);
		if (cached) return cached;
		const pipeline = getSharedWebGpuResources({
			device,
			key: JSON.stringify([
				'single-pass',
				shader,
				targetFormat,
				pipelineVariant,
			]),
			create: () => {
				const module = device.createShaderModule({
					code: shaderForVariant(shader, pipelineVariant),
					label: state.label,
				});
				return device.createRenderPipeline({
					label: state.label,
					layout: resources.pipelineLayout,
					vertex: {module, entryPoint: 'vertex'},
					fragment: {
						module,
						entryPoint: 'fragment',
						targets: [{format: targetFormat}],
					},
					primitive: {topology: 'triangle-list'},
				});
			},
		});
		resources.pipelines.set(pipelineVariant, pipeline);
		return pipeline;
	};

	const createBindGroup = (view: GPUTextureView) =>
		device.createBindGroup({
			layout: resources.bindGroupLayout,
			entries: [
				...(resources.auxiliary
					? [{binding: 3, resource: resources.auxiliary.texture.createView()}]
					: []),
				{binding: 0, resource: view},
				{binding: 1, resource: resources.sampler},
				{binding: 2, resource: {buffer: resources.uniforms}},
				{binding: 4, resource: {buffer: resources.geometry.buffer}},
			],
		});

	const sourceFormat = float ? 'rgba16float' : 'rgba8unorm';
	if (
		!upstream &&
		resources.source &&
		(resources.source.width !== width ||
			resources.source.height !== height ||
			resources.source.format !== sourceFormat)
	) {
		resources.source.texture.destroy();
		resources.source = null;
	}

	if (
		resources.precise &&
		(!float ||
			resources.precise.width !== target.width ||
			resources.precise.height !== target.height)
	) {
		releasePrecise(resources);
	}

	const upstreamBindGroup = upstream
		? (resources.upstreamBindGroups.get(upstream) ?? null)
		: null;
	const canvasVariant = variant === 'dither' ? 'dither' : 'plain';
	const validationLink =
		float &&
		((upstream ? upstreamBindGroup === null : resources.source === null) ||
			(variant === 'float' &&
				(resources.precise === null || !resources.pipelines.has('float'))) ||
			!resources.pipelines.has(canvasVariant))
			? link
			: null;
	if (validationLink) {
		device.pushErrorScope('out-of-memory');
		device.pushErrorScope('validation');
	}

	try {
		let bindGroup: GPUBindGroup;
		if (upstream) {
			bindGroup = upstreamBindGroup ?? createBindGroup(upstream.view);
			if (!upstreamBindGroup) {
				resources.upstreamBindGroups.set(upstream, bindGroup);
			}
		} else {
			if (!resources.source) {
				const texture = device.createTexture({
					size: [width, height],
					format: sourceFormat,
					usage:
						GPUTextureUsage.TEXTURE_BINDING |
						GPUTextureUsage.COPY_DST |
						GPUTextureUsage.RENDER_ATTACHMENT,
				});
				resources.source = {
					texture,
					bindGroup: createBindGroup(texture.createView()),
					width,
					height,
					format: sourceFormat,
				};
			}

			device.queue.copyExternalImageToTexture(
				{source: source as GPUCopyExternalImageSource},
				{texture: resources.source.texture, premultipliedAlpha: true},
				[width, height],
			);
			bindGroup = resources.source.bindGroup;
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
						auxiliaryTexture.width *
						4 *
						auxiliaryTexture.data.BYTES_PER_ELEMENT,
				},
				[auxiliaryTexture.width, auxiliaryTexture.height],
			);
			resources.auxiliary.uploadedData = auxiliaryTexture.data;
		}

		device.queue.writeBuffer(resources.uniforms, 0, uniformData);
		writeEffectGeometry(
			device,
			resources.geometry,
			contentRect ?? link?.contentRect ?? null,
			outputWidth,
			outputHeight,
		);
		const encoder = device.createCommandEncoder();
		const draw = (view: GPUTextureView, pipeline: GPURenderPipeline) => {
			const pass = encoder.beginRenderPass({
				colorAttachments: [
					{
						view,
						clearValue: {r: 0, g: 0, b: 0, a: 0},
						loadOp: 'clear',
						storeOp: 'store',
					},
				],
			});
			pass.setPipeline(pipeline);
			pass.setBindGroup(0, bindGroup);
			pass.draw(3);
			pass.end();
		};

		if (variant === 'float' && link) {
			if (!resources.precise) {
				const texture = device.createTexture({
					size: [target.width, target.height],
					format: 'rgba16float',
					usage:
						GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
				});
				resources.precise = {
					texture,
					view: texture.createView(),
					device,
					width: target.width,
					height: target.height,
					destroyed: false,
				};
			}

			draw(resources.precise.view, pipelineFor('float', 'rgba16float'));
			link.precise = resources.precise;
		}

		// Bridges to other backends, effect source observers and the chain's
		// output still read the canvas, so it is always written.
		draw(
			state.context.getCurrentTexture().createView(),
			pipelineFor(canvasVariant, resources.format),
		);
		device.queue.submit([encoder.finish()]);
	} finally {
		if (validationLink) {
			validationLink.check = Promise.allSettled([
				device.popErrorScope(),
				device.popErrorScope(),
			]).then((results) => {
				const valid = results.every(
					(result) => result.status === 'fulfilled' && result.value === null,
				);
				if (!valid) floatRejected.add(device);
				return valid;
			});
		}
	}
};
