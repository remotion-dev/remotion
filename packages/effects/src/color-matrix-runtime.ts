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

// Three affine RGB rows, then flags for byte brightness/contrast and identity.
// Byte conversion matches the getImageData()/Uint8ClampedArray path used by
// brightness and contrast; CSS color filters retain fractional channel values.
const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec4 uRed;
uniform vec4 uGreen;
uniform vec4 uBlue;
uniform vec4 uFlags;
void main() {
	vec4 source = texture(uSource, vUv);
	if (uFlags.z > 0.0 || source.a == 0.0) { fragColor = source; return; }
	vec3 rgb = source.rgb / source.a;
	if (uFlags.x > 0.0) {
		vec3 bytes = floor(rgb * 255.0 + 0.5);
		bytes = uFlags.x == 1.0 ? bytes + uRed.w : (bytes - 128.0) * uRed.x + 128.0;
		rgb = roundEven(clamp(bytes, 0.0, 255.0)) / 255.0;
	} else {
		vec4 color = vec4(rgb, 1.0);
		rgb = clamp(vec3(dot(uRed, color), dot(uGreen, color), dot(uBlue, color)), 0.0, 1.0);
	}
	fragColor = vec4(rgb * source.a, source.a);
}
`;

const WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params {
	red: vec4f,
	green: vec4f,
	blue: vec4f,
	flags: vec4f,
}
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let sampled = textureSample(source, sourceSampler, input.uv);
	if (params.flags.z > 0.0 || sampled.a == 0.0) { return sampled; }
	var rgb = sampled.rgb / sampled.a;
	if (params.flags.x > 0.0) {
		var bytes = floor(rgb * 255.0 + vec3f(0.5));
		if (params.flags.x == 1.0) {
			bytes += vec3f(params.red.w);
		} else {
			bytes = (bytes - vec3f(128.0)) * params.red.x + vec3f(128.0);
		}
		bytes = clamp(bytes, vec3f(0.0), vec3f(255.0));
		let lower = floor(bytes);
		let fraction = bytes - lower;
		let odd = lower - floor(lower * 0.5) * 2.0 == vec3f(1.0);
		let aboveHalf = fraction > vec3f(0.5);
		let halfway = fraction == vec3f(0.5);
		rgb = (lower + select(vec3f(0.0), vec3f(1.0), aboveHalf | (halfway & odd))) / 255.0;
	} else {
		let color = vec4f(rgb, 1.0);
		rgb = clamp(vec3f(dot(params.red, color), dot(params.green, color), dot(params.blue, color)), vec3f(0.0), vec3f(1.0));
	}
	return vec4f(rgb * sampled.a, sampled.a);
}
`;

export const createColorMatrixImplementations = <P>(
	label: string,
	getUniformData: (params: P) => Float32Array<ArrayBuffer>,
) => ({
	webgl2: Internals.createEffectImplementation<P, SinglePassState>({
		setup: (target) =>
			setupSinglePass(target, FRAGMENT_SHADER, label, [
				'uRed',
				'uGreen',
				'uBlue',
				'uFlags',
			]),
		apply: ({source, width, height, params, state, flipSourceY}) => {
			prepareSinglePassSource({
				state,
				source: source as TexImageSource,
				width,
				height,
				flipSourceY,
			});
			const data = getUniformData(params);
			const {gl, uniforms} = state;
			gl.uniform4fv(uniforms.uRed, data.subarray(0, 4));
			gl.uniform4fv(uniforms.uGreen, data.subarray(4, 8));
			gl.uniform4fv(uniforms.uBlue, data.subarray(8, 12));
			gl.uniform4fv(uniforms.uFlags, data.subarray(12, 16));
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

			applyWebGpuSinglePass({
				state,
				source,
				width,
				height,
				device: gpuDevice as GPUDevice,
				shader: WEBGPU_SHADER,
				uniformData: getUniformData(params),
			});
		},
		cleanup: cleanupWebGpuSinglePass,
	}),
});
