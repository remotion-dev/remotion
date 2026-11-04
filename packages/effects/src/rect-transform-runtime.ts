import {Internals} from 'remotion';
import {
	cleanupSinglePass,
	drawSinglePass,
	prepareSinglePassSource,
	setupSinglePass,
	type SinglePassState,
} from './single-pass-runtime.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	WEBGPU_SINGLE_PASS_VERTEX,
	type WebGpuSinglePassState,
} from './webgpu-single-pass-runtime.js';

type DestinationRect = {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
};

const WEBGL_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform vec4 uRect;
void main() {
	vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
	vec2 coverage = clamp(min(p + 0.5, uRect.xy + uRect.zw) - max(p - 0.5, uRect.xy), 0.0, 1.0);
	vec2 uv = (p - uRect.xy) / uRect.zw;
	if (any(lessThanEqual(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) { fragColor = vec4(0.0); return; }
	fragColor = texture(uSource, vec2(uv.x, 1.0 - uv.y)) * min(coverage.x, coverage.y);
}
`;

const WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params {
	resolution: vec2f,
	padding: vec2f,
	rect: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let p = input.position.xy;
	let coverage = clamp(min(p + vec2f(0.5), params.rect.xy + params.rect.zw) - max(p - vec2f(0.5), params.rect.xy), vec2f(0), vec2f(1));
	let uv = (p - params.rect.xy) / params.rect.zw;
	if (any(uv <= vec2f(0)) || any(uv > vec2f(1))) { return vec4f(0); }
	return textureSampleLevel(source, sourceSampler, uv, 0) * min(coverage.x, coverage.y);
}
`;

// Match drawImage() rasterization: sample centers on the leading edge are
// excluded, trailing-edge centers are included, and corners use the smaller
// edge coverage. Keep that coverage separate from texture filtering.
export const createRectTransformImplementations = <P>(
	label: string,
	getRect: (params: P, width: number, height: number) => DestinationRect,
) => ({
	webgl2: Internals.createEffectImplementation<P, SinglePassState>({
		setup: (target) =>
			setupSinglePass(target, WEBGL_SHADER, label, ['uResolution', 'uRect']),
		apply: ({source, width, height, params, state, flipSourceY}) => {
			const rect = getRect(params, width, height);
			prepareSinglePassSource({
				state,
				source: source as TexImageSource,
				width,
				height,
				flipSourceY,
			});
			state.gl.uniform2f(state.uniforms.uResolution, width, height);
			state.gl.uniform4f(
				state.uniforms.uRect,
				rect.x,
				rect.y,
				rect.width,
				rect.height,
			);
			drawSinglePass(state);
		},
		cleanup: cleanupSinglePass,
	}),
	webgpu: Internals.createEffectImplementation<P, WebGpuSinglePassState>({
		setup: (target) => setupWebGpuSinglePass(target, label),
		apply: ({source, width, height, params, state, gpuDevice}) => {
			if (!gpuDevice) {
				throw new Error(`A WebGPU device is required for the ${label} effect`);
			}

			const rect = getRect(params, width, height);
			applyWebGpuSinglePass({
				state,
				source,
				width,
				height,
				device: gpuDevice as GPUDevice,
				shader: WEBGPU_SHADER,
				uniformData: new Float32Array([
					width,
					height,
					0,
					0,
					rect.x,
					rect.y,
					rect.width,
					rect.height,
				]),
			});
		},
		cleanup: cleanupWebGpuSinglePass,
	}),
});
