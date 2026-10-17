import type {CylinderRender} from './index.js';
import {CYLINDER_SHADER} from './shader.js';

export type CylinderState = {
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

export const cleanupCylinder = (state: CylinderState): void => {
	state.resources?.texture.destroy();
	state.resources?.uniforms.destroy();
	state.resources = null;
	state.context.unconfigure();
};

export const applyCylinder = ({
	state,
	source,
	width,
	height,
	device,
	radius,
	rotation,
	rotationX,
	rotationY,
	rotationZ,
	position,
	render,
	shading,
}: {
	state: CylinderState;
	source: CanvasImageSource;
	width: number;
	height: number;
	device: GPUDevice;
	radius: number;
	rotation: number;
	rotationX: number;
	rotationY: number;
	rotationZ: number;
	position: readonly [number, number];
	render: CylinderRender;
	shading: number;
}): void => {
	if (
		state.resources &&
		(state.resources.device !== device ||
			state.resources.width !== width ||
			state.resources.height !== height)
	) {
		cleanupCylinder(state);
	}

	if (!state.resources) {
		const format = navigator.gpu.getPreferredCanvasFormat();
		state.context.configure({device, format, alphaMode: 'premultiplied'});
		const module = device.createShaderModule({code: CYLINDER_SHADER});
		const pipeline = device.createRenderPipeline({
			layout: 'auto',
			vertex: {module, entryPoint: 'vertex'},
			fragment: {module, entryPoint: 'fragment', targets: [{format}]},
			primitive: {topology: 'triangle-list'},
		});
		const uniforms = device.createBuffer({
			size: 48,
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
	const radians = Math.PI / 180;
	device.queue.writeBuffer(
		resources.uniforms,
		0,
		new Float32Array([
			width,
			height,
			position[0] * width,
			position[1] * height,
			radius,
			(rotation % 360) * radians,
			shading,
			render === 'front' ? 1 : render === 'back' ? 2 : 0,
			(rotationX % 360) * radians,
			(rotationY % 360) * radians,
			(rotationZ % 360) * radians,
			0,
		]),
	);
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
