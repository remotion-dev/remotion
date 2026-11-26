import type {EffectContentRect} from 'remotion';
import type {UvCoordinate} from './uv-coordinate.js';

export const elementUvToTextureUv = (
	uv: UvCoordinate,
	rect: EffectContentRect,
	width: number,
	height: number,
): [number, number] => [
	uv[0] * (rect.width / width) + rect.x / width,
	uv[1] * (rect.height / height) + rect.y / height,
];

export const setEffectCoordinateUniforms = (
	gl: WebGL2RenderingContext,
	contentRectLocation: WebGLUniformLocation | null,
	sizeLocation: WebGLUniformLocation | null,
	rect: EffectContentRect,
	width: number,
	height: number,
): void => {
	gl.uniform4f(contentRectLocation, rect.x, rect.y, rect.width, rect.height);
	gl.uniform2f(sizeLocation, width, height);
};

export const EFFECT_COORDINATES_GLSL = /* glsl */ `
uniform vec4 uContentRect;
uniform vec2 uEffectTextureSize;

vec2 textureUvToElementUv(vec2 uv, vec2 textureSize) {
	return uv * (textureSize / uContentRect.zw) - uContentRect.xy / uContentRect.zw;
}

vec2 elementUvToTextureUv(vec2 uv, vec2 textureSize) {
	return uv * (uContentRect.zw / textureSize) + uContentRect.xy / textureSize;
}

vec2 texturePixelToElementPixelBottomLeft(vec2 pixel, float textureHeight) {
	return pixel - vec2(uContentRect.x, textureHeight - (uContentRect.y + uContentRect.w));
}

vec2 textureUvToElementUvBottomLeft(vec2 uv, vec2 textureSize) {
	vec2 origin = vec2(uContentRect.x, textureSize.y - (uContentRect.y + uContentRect.w));
	return uv * (textureSize / uContentRect.zw) - origin / uContentRect.zw;
}

vec2 elementUvToTextureUvBottomLeft(vec2 uv, vec2 textureSize) {
	vec2 origin = vec2(uContentRect.x, textureSize.y - (uContentRect.y + uContentRect.w));
	return uv * (uContentRect.zw / textureSize) + origin / textureSize;
}
`;

export const EFFECT_COORDINATES_WGSL = /* wgsl */ `
struct EffectGeometry {
	contentRect: vec4f,
	textureSize: vec2f,
}
@group(0) @binding(4) var<uniform> effectGeometry: EffectGeometry;

fn textureUvToElementUv(uv: vec2f, textureSize: vec2f) -> vec2f {
	let rect = effectGeometry.contentRect;
	return uv * (textureSize / rect.zw) - rect.xy / rect.zw;
}

fn elementUvToTextureUv(uv: vec2f, textureSize: vec2f) -> vec2f {
	let rect = effectGeometry.contentRect;
	return uv * (rect.zw / textureSize) + rect.xy / textureSize;
}

fn texturePixelToElementPixelBottomLeft(pixel: vec2f, textureHeight: f32) -> vec2f {
	let rect = effectGeometry.contentRect;
	return pixel - vec2f(rect.x, textureHeight - (rect.y + rect.w));
}

fn textureUvToElementUvBottomLeft(uv: vec2f, textureSize: vec2f) -> vec2f {
	let rect = effectGeometry.contentRect;
	let origin = vec2f(rect.x, textureSize.y - (rect.y + rect.w));
	return uv * (textureSize / rect.zw) - origin / rect.zw;
}

fn elementUvToTextureUvBottomLeft(uv: vec2f, textureSize: vec2f) -> vec2f {
	let rect = effectGeometry.contentRect;
	let origin = vec2f(rect.x, textureSize.y - (rect.y + rect.w));
	return uv * (rect.zw / textureSize) + origin / textureSize;
}
`;

export type EffectGeometryBuffer = {
	readonly buffer: GPUBuffer;
	readonly data: Float32Array<ArrayBuffer>;
	lastRect: EffectContentRect | null;
};

export const createEffectGeometryBuffer = (
	device: GPUDevice,
): EffectGeometryBuffer => ({
	buffer: device.createBuffer({
		size: 32,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	}),
	data: new Float32Array(8),
	lastRect: null,
});

export const writeEffectGeometry = (
	device: GPUDevice,
	geometry: EffectGeometryBuffer,
	contentRect: EffectContentRect | null,
	width: number,
	height: number,
): void => {
	const {data} = geometry;
	if (
		geometry.lastRect === contentRect &&
		data[4] === width &&
		data[5] === height
	) {
		return;
	}

	data[0] = contentRect?.x ?? 0;
	data[1] = contentRect?.y ?? 0;
	data[2] = contentRect?.width ?? width;
	data[3] = contentRect?.height ?? height;
	data[4] = width;
	data[5] = height;
	device.queue.writeBuffer(geometry.buffer, 0, data);
	geometry.lastRect = contentRect;
};
