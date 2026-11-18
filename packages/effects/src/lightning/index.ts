import {Internals} from 'remotion';
import {parseColorRgba} from '../color-utils.js';
import {
	cleanupSinglePass,
	drawSinglePass,
	prepareSinglePassSource,
	setupSinglePass,
	type SinglePassState,
} from '../single-pass-runtime.js';
import {
	applyWebGpuSinglePass,
	cleanupWebGpuSinglePass,
	setupWebGpuSinglePass,
	type WebGpuSinglePassState,
} from '../webgpu-single-pass-runtime.js';
import {makeLightningMask} from './mask.js';
import {
	lightningSchema,
	resolve,
	validateLightningParams,
	type LightningParams,
} from './params.js';
import {LIGHTNING_FRAGMENT_SHADER, LIGHTNING_WEBGPU_SHADER} from './shaders.js';

type LightningState = {
	readonly ctx: CanvasRenderingContext2D;
	mask: {key: string; data: Uint8Array<ArrayBuffer>} | null;
};

const setupLightning = (): LightningState => {
	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;
	const ctx = canvas.getContext('2d', {willReadFrequently: true});
	if (!ctx) throw new Error('Could not acquire a 2D context for lightning');
	return {ctx, mask: null};
};

const prepareLightning = ({
	state,
	params,
	source,
	width,
	height,
	sourceIsFlipped,
}: {
	state: LightningState;
	params: LightningParams;
	source: CanvasImageSource;
	width: number;
	height: number;
	sourceIsFlipped: boolean;
}) => {
	const p = resolve(params);
	const {
		coreColor,
		coreOpacity,
		glowColor,
		glowOpacity,
		compositeOnOriginal,
		...shape
	} = p;
	const key = JSON.stringify([width, height, shape]);
	const {ctx} = state;
	if (state.mask?.key !== key || p.alphaObstacle !== 0) {
		let alpha: ImageData | null = null;
		if (p.alphaObstacle !== 0) {
			if (ctx.canvas.width !== width) ctx.canvas.width = width;
			if (ctx.canvas.height !== height) ctx.canvas.height = height;
			ctx.clearRect(0, 0, width, height);
			ctx.save();
			try {
				if (sourceIsFlipped) {
					ctx.translate(0, height);
					ctx.scale(1, -1);
				}

				ctx.drawImage(source, 0, 0, width, height);
			} finally {
				ctx.restore();
			}

			alpha = ctx.getImageData(0, 0, width, height);
		}

		state.mask = {key, data: makeLightningMask(p, width, height, alpha)};
	}

	const core = parseColorRgba(ctx, coreColor);
	const glow = parseColorRgba(ctx, glowColor);
	return {
		data: state.mask.data,
		uniforms: new Float32Array([
			core[0] / 255,
			core[1] / 255,
			core[2] / 255,
			(core[3] / 255) * coreOpacity,
			glow[0] / 255,
			glow[1] / 255,
			glow[2] / 255,
			(glow[3] / 255) * glowOpacity,
			Number(compositeOnOriginal),
			0,
			0,
			0,
		]),
	};
};

export const lightning = Internals.createEffect<LightningParams>({
	type: 'remotion/lightning',
	label: 'lightning()',
	documentationLink: 'https://www.remotion.dev/docs/effects/lightning',
	calculateKey: (params) => `lightning-${JSON.stringify(resolve(params))}`,
	schema: lightningSchema,
	validateParams: validateLightningParams,
	implementations: {
		webgl2: Internals.createEffectImplementation<
			LightningParams,
			LightningState & SinglePassState & {maskTexture: WebGLTexture}
		>({
			setup: (target) => {
				const shared = setupLightning();
				const pass = setupSinglePass(
					target,
					LIGHTNING_FRAGMENT_SHADER,
					'lightning',
					['uMask', 'uCore', 'uGlow', 'uComposite'],
				);
				const {gl} = pass;
				const maskTexture = gl.createTexture();
				if (!maskTexture) {
					cleanupSinglePass(pass);
					throw new Error('Could not allocate lightning mask texture');
				}

				gl.bindTexture(gl.TEXTURE_2D, maskTexture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				return {...shared, ...pass, maskTexture};
			},
			apply: ({source, width, height, params, state, flipSourceY}) => {
				const previous = state.mask?.data;
				const {data, uniforms} = prepareLightning({
					state,
					params,
					source,
					width,
					height,
					sourceIsFlipped: !flipSourceY,
				});
				const {gl} = state;
				prepareSinglePassSource({
					state,
					source: source as TexImageSource,
					width,
					height,
					flipSourceY,
				});
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, state.maskTexture);
				if (previous !== data) {
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
					gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
					gl.texImage2D(
						gl.TEXTURE_2D,
						0,
						gl.RGBA,
						width,
						height,
						0,
						gl.RGBA,
						gl.UNSIGNED_BYTE,
						data,
					);
					gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
				}

				gl.uniform1i(state.uniforms.uMask, 1);
				gl.uniform4fv(state.uniforms.uCore, uniforms, 0, 4);
				gl.uniform4fv(state.uniforms.uGlow, uniforms, 4, 4);
				gl.uniform1f(state.uniforms.uComposite, uniforms[8]);
				drawSinglePass(state);
				gl.activeTexture(gl.TEXTURE0);
			},
			cleanup: (state) => {
				state.gl.deleteTexture(state.maskTexture);
				cleanupSinglePass(state);
			},
		}),
		webgpu: Internals.createEffectImplementation<
			LightningParams,
			LightningState & WebGpuSinglePassState
		>({
			setup: (target) => ({
				...setupLightning(),
				...setupWebGpuSinglePass(target, 'lightning'),
			}),
			apply: ({source, width, height, params, state, gpuDevice}) => {
				if (!gpuDevice)
					throw new Error('A WebGPU device is required for lightning');
				const {data, uniforms} = prepareLightning({
					state,
					params,
					source,
					width,
					height,
					sourceIsFlipped: false,
				});
				applyWebGpuSinglePass(
					{
						state,
						source,
						width,
						height,
						device: gpuDevice as GPUDevice,
						shader: LIGHTNING_WEBGPU_SHADER,
						uniformData: uniforms,
					},
					{
						sourceFilter: null,
						auxiliaryTexture: {data, width, height, format: 'rgba8unorm'},
					},
				);
			},
			cleanup: cleanupWebGpuSinglePass,
		}),
	},
});
