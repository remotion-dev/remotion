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

const WEBGL_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec4 uBounds;
uniform vec4 uOptions;
void main() {
	vec2 p = vec2(gl_FragCoord.x, uOptions.y - gl_FragCoord.y);
	if (uOptions.z == 0.0 && uOptions.w == 0.0) {
		fragColor = texture(uSource, vUv);
		return;
	}
	if (uBounds.z <= 0.0 || uBounds.w <= 0.0) { fragColor = vec4(0.0); return; }
	vec2 q = (p - uBounds.xy) / uBounds.zw;
	if ((uOptions.z == 0.0 && (q.x < 0.0 || q.x >= 1.0)) || (uOptions.w == 0.0 && (q.y < 0.0 || q.y >= 1.0))) { fragColor = vec4(0.0); return; }
	vec2 local = mix(fract(q), 1.0 - fract(q), mod(floor(q), 2.0));
	vec2 samplePosition = uBounds.xy + local * uBounds.zw;
	vec2 sourceSize = vec2(textureSize(uSource, 0));
	if (any(lessThan(samplePosition, vec2(0.0))) || any(greaterThanEqual(samplePosition, sourceSize))) { fragColor = vec4(0.0); return; }
	vec2 uv = samplePosition / sourceSize;
	fragColor = texture(uSource, vec2(uv.x, 1.0 - uv.y));
}
`;

const WEBGPU_SHADER = /* wgsl */ `
${WEBGPU_SINGLE_PASS_VERTEX}
struct Params { bounds: vec4f, options: vec4f }
@group(0) @binding(0) var source: texture_2d<f32>;
@group(0) @binding(1) var sourceSampler: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let p = input.position.xy;
	if (params.options.z == 0.0 && params.options.w == 0.0) {
		return textureSampleLevel(source, sourceSampler, input.uv, 0);
	}
	if (params.bounds.z <= 0.0 || params.bounds.w <= 0.0) { return vec4f(0); }
	let q = (p - params.bounds.xy) / params.bounds.zw;
	if ((params.options.z == 0.0 && (q.x < 0.0 || q.x >= 1.0)) || (params.options.w == 0.0 && (q.y < 0.0 || q.y >= 1.0))) { return vec4f(0); }
	let tile = floor(q);
	let mirror = tile - 2.0 * floor(tile / 2.0);
	let local = mix(fract(q), vec2f(1) - fract(q), mirror);
	let samplePosition = params.bounds.xy + local * params.bounds.zw;
	let sourceSize = vec2f(textureDimensions(source));
	if (any(samplePosition < vec2f(0)) || any(samplePosition >= sourceSize)) { return vec4f(0); }
	return textureSampleLevel(source, sourceSampler, samplePosition / sourceSize, 0);
}
`;

type TileBounds = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export const createTileGpuImplementations = <P, S>({
	setupBounds,
	getBounds,
	resolve,
}: {
	setupBounds: (target: HTMLCanvasElement) => S;
	getBounds: (input: {
		source: CanvasImageSource;
		width: number;
		height: number;
		params: P;
		state: S;
	}) => TileBounds | null;
	resolve: (params: P) => {horizontal: boolean; vertical: boolean};
}) => ({
	webgl2: Internals.createEffectImplementation<
		P,
		{bounds: S; render: SinglePassState}
	>({
		setup: (target) => ({
			bounds: setupBounds(target),
			render: setupSinglePass(target, WEBGL_SHADER, 'tile', [
				'uBounds',
				'uOptions',
			]),
		}),
		apply: ({source, width, height, params, state, flipSourceY}) => {
			const r = resolve(params);
			const bounds =
				r.horizontal || r.vertical
					? getBounds({source, width, height, params, state: state.bounds})
					: null;
			prepareSinglePassSource({
				state: state.render,
				source: source as TexImageSource,
				width,
				height,
				flipSourceY,
			});
			const {gl, uniforms} = state.render;
			gl.uniform4f(
				uniforms.uBounds,
				bounds?.left ?? 0,
				bounds?.top ?? 0,
				bounds?.width ?? 0,
				bounds?.height ?? 0,
			);
			gl.uniform4f(
				uniforms.uOptions,
				width,
				height,
				Number(r.horizontal),
				Number(r.vertical),
			);
			drawSinglePass(state.render);
		},
		cleanup: (state) => cleanupSinglePass(state.render),
	}),
	webgpu: Internals.createEffectImplementation<
		P,
		{bounds: S; render: WebGpuSinglePassState}
	>({
		setup: (target) => ({
			bounds: setupBounds(target),
			render: setupWebGpuSinglePass(target, 'tile'),
		}),
		apply: ({source, width, height, params, state, gpuDevice}) => {
			if (!gpuDevice) {
				throw new Error('A WebGPU device is required for the tile effect');
			}

			const r = resolve(params);
			// Alpha-bound detection deliberately matches the 2D implementation,
			// including its one-pixel fringe trimming. Repetition runs on the GPU.
			const bounds =
				r.horizontal || r.vertical
					? getBounds({source, width, height, params, state: state.bounds})
					: null;
			applyWebGpuSinglePass({
				state: state.render,
				source,
				width,
				height,
				device: gpuDevice as GPUDevice,
				shader: WEBGPU_SHADER,
				uniformData: new Float32Array([
					bounds?.left ?? 0,
					bounds?.top ?? 0,
					bounds?.width ?? 0,
					bounds?.height ?? 0,
					width,
					height,
					Number(r.horizontal),
					Number(r.vertical),
				]),
			});
		},
		cleanup: (state) => cleanupWebGpuSinglePass(state.render),
	}),
});
