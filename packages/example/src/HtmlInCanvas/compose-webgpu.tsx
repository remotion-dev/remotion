import React, {useCallback, useRef} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	type HtmlInCanvasOnInit,
	type HtmlInCanvasOnPaint,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Minimal WebGPU types — `@webgpu/types` is intentionally not a dependency,
// matching the convention in `packages/core/src/effects/gpu-device.ts`.
type Gpu = {
	requestAdapter(): Promise<GpuAdapter | null>;
	getPreferredCanvasFormat(): string;
};
type GpuAdapter = {requestDevice(): Promise<GpuDevice>};
type GpuTextureView = unknown;
type GpuTexture = {createView(): GpuTextureView; destroy(): void};
type GpuBuffer = {destroy(): void};
type GpuBindGroup = unknown;
type GpuPipeline = unknown;
type GpuSampler = unknown;
type GpuShaderModule = unknown;
type GpuDevice = {
	createShaderModule(d: {code: string}): GpuShaderModule;
	createRenderPipeline(d: unknown): GpuPipeline;
	createTexture(d: unknown): GpuTexture;
	createSampler(d?: unknown): GpuSampler;
	createBindGroup(d: unknown): GpuBindGroup;
	createBuffer(d: unknown): GpuBuffer;
	createCommandEncoder(): {
		beginRenderPass(d: unknown): {
			setPipeline(p: GpuPipeline): void;
			setBindGroup(i: number, b: GpuBindGroup): void;
			draw(n: number): void;
			end(): void;
		};
		finish(): unknown;
	};
	queue: {
		submit(c: unknown[]): void;
		writeBuffer(b: GpuBuffer, offset: number, data: BufferSource): void;
		copyElementImageToTexture(
			source: Element | ElementImage,
			width: number,
			height: number,
			destination: {texture: GpuTexture},
		): void;
	};
};
type GpuCanvasContext = {
	configure(d: {
		device: GpuDevice;
		format: string;
		alphaMode: 'premultiplied' | 'opaque';
	}): void;
	getCurrentTexture(): GpuTexture;
};

const WGSL = /* wgsl */ `
struct VsOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs(@builtin(vertex_index) i: u32) -> VsOut {
  // Fullscreen triangle (slightly oversized — clipped to viewport).
  var p = array(vec2f(-1.0, -3.0), vec2f(-1.0, 1.0), vec2f(3.0, 1.0));
  var uv = array(vec2f(0.0, 2.0), vec2f(0.0, 0.0), vec2f(2.0, 0.0));
  var o: VsOut;
  o.pos = vec4f(p[i], 0.0, 1.0);
  o.uv = uv[i];
  return o;
}

struct U {
  time: f32,
  _pad: f32,
  resolution: vec2f,
};

@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var<uniform> u: U;

@fragment
fn fs(in: VsOut) -> @location(0) vec4f {
  // Animate pixel cell size with a slow breathing motion.
  let cell = 6.0 + sin(u.time * 0.8) * 4.0;
  let snapped = floor(in.uv * u.resolution / cell) * cell / u.resolution;

  // Slight chromatic offset between channels — sampled from snapped centers.
  let off = vec2f(2.0, 0.0) / u.resolution;
  let r = textureSample(tex, samp, snapped + off).r;
  let g = textureSample(tex, samp, snapped).g;
  let b = textureSample(tex, samp, snapped - off).b;
  let a = textureSample(tex, samp, snapped).a;

  // Posterize to 5 levels per channel for a flatter, screenprint look.
  let levels = 5.0;
  let q = floor(vec3f(r, g, b) * levels) / (levels - 1.0);

  return vec4f(q, a);
}
`;

type GpuState = {
	device: GpuDevice;
	context: GpuCanvasContext;
	pipeline: GpuPipeline;
	sampler: GpuSampler;
	texture: GpuTexture;
	uniformBuffer: GpuBuffer;
	bindGroup: GpuBindGroup;
	width: number;
	height: number;
};

export const HtmlInCanvasComposeWebGPU: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const gpuRef = useRef<GpuState | null>(null);

	const time = frame / fps;

	const onInit: HtmlInCanvasOnInit = useCallback(async ({canvas}) => {
		if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
			throw new Error('WebGPU is not available in this environment');
		}

		const gpu = (navigator as unknown as {gpu: Gpu}).gpu;
		const adapter = await gpu.requestAdapter();
		if (!adapter) {
			throw new Error('No WebGPU adapter available');
		}

		const device = await adapter.requestDevice();
		const context = (
			canvas as unknown as {
				getContext(id: 'webgpu'): GpuCanvasContext | null;
			}
		).getContext('webgpu');
		if (!context) {
			throw new Error('WebGPU context unavailable on OffscreenCanvas');
		}

		// Use the device's preferred swap-chain format (typically `bgra8unorm`)
		// to avoid an extra format-conversion copy on present.
		const presentationFormat = gpu.getPreferredCanvasFormat();

		context.configure({
			device,
			format: presentationFormat,
			alphaMode: 'premultiplied',
		});

		const module = device.createShaderModule({code: WGSL});

		const pipeline = device.createRenderPipeline({
			layout: 'auto',
			vertex: {module, entryPoint: 'vs'},
			fragment: {
				module,
				entryPoint: 'fs',
				targets: [{format: presentationFormat}],
			},
			primitive: {topology: 'triangle-list'},
		});

		const TextureUsage = (
			globalThis as unknown as {
				GPUTextureUsage: {
					COPY_DST: number;
					TEXTURE_BINDING: number;
					RENDER_ATTACHMENT: number;
				};
			}
		).GPUTextureUsage;
		const BufferUsage = (
			globalThis as unknown as {
				GPUBufferUsage: {UNIFORM: number; COPY_DST: number};
			}
		).GPUBufferUsage;

		const texture = device.createTexture({
			size: {width: canvas.width, height: canvas.height},
			format: 'rgba8unorm',
			usage:
				TextureUsage.COPY_DST |
				TextureUsage.TEXTURE_BINDING |
				TextureUsage.RENDER_ATTACHMENT,
		});

		const sampler = device.createSampler({
			magFilter: 'linear',
			minFilter: 'linear',
			addressModeU: 'clamp-to-edge',
			addressModeV: 'clamp-to-edge',
		});

		// 16 bytes: time (f32), pad (f32), resolution (vec2f).
		const uniformBuffer = device.createBuffer({
			size: 16,
			usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
		});

		const bindGroup = device.createBindGroup({
			layout: (
				pipeline as unknown as {
					getBindGroupLayout(i: number): unknown;
				}
			).getBindGroupLayout(0),
			entries: [
				{binding: 0, resource: sampler},
				{binding: 1, resource: texture.createView()},
				{binding: 2, resource: {buffer: uniformBuffer}},
			],
		});

		gpuRef.current = {
			device,
			context,
			pipeline,
			sampler,
			texture,
			uniformBuffer,
			bindGroup,
			width: canvas.width,
			height: canvas.height,
		};

		return () => {
			texture.destroy();
			uniformBuffer.destroy();
			gpuRef.current = null;
		};
	}, []);

	const onPaint: HtmlInCanvasOnPaint = useCallback(
		({elementImage}) => {
			const gpu = gpuRef.current;
			if (!gpu) {
				return;
			}

			const {device, context, pipeline, texture, bindGroup, uniformBuffer} =
				gpu;

			device.queue.copyElementImageToTexture(
				elementImage,
				gpu.width,
				gpu.height,
				{texture},
			);

			const uniforms = new Float32Array([time, 0, gpu.width, gpu.height]);
			device.queue.writeBuffer(uniformBuffer, 0, uniforms);

			const encoder = device.createCommandEncoder();
			const view = context.getCurrentTexture().createView();
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
			device.queue.submit([encoder.finish()]);
		},
		[time],
	);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<HtmlInCanvas
				width={width}
				height={height}
				onInit={onInit}
				onPaint={onPaint}
			>
				<AbsoluteFill
					style={{
						backgroundColor: 'white',
						color: 'black',
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 120,
						fontFamily: 'sans-serif',
						fontWeight: 'bold',
					}}
				>
					<h1>Hello, World!</h1>
				</AbsoluteFill>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};
