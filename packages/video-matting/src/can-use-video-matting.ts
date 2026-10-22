import {getVideoMattingModelInfo, type VideoMattingModel} from './models';

export enum VideoMattingUnsupportedReason {
	WindowUndefined = 'window-undefined',
	WebGpuUnavailable = 'webgpu-unavailable',
	WebGpuRequiresSecureContext = 'webgpu-requires-secure-context',
	ShaderF16Unavailable = 'shader-f16-unavailable',
}

export type CanUseVideoMattingResult =
	| {
			supported: true;
	  }
	| {
			supported: false;
			reason: VideoMattingUnsupportedReason;
			detailedReason: string;
	  };

export type CanUseVideoMattingOptions = {
	model?: VideoMattingModel;
};

type WebGpuAdapter = {
	features?: {
		has: (feature: string) => boolean;
	};
};

export const canUseVideoMatting = async ({
	model = 'modnet',
}: CanUseVideoMattingOptions = {}): Promise<CanUseVideoMattingResult> => {
	const modelInfo = getVideoMattingModelInfo(model);

	if (
		typeof window === 'undefined' &&
		typeof process !== 'undefined' &&
		process.release?.name === 'node'
	) {
		try {
			const {probeNodeWebGpu} = await import('./probe-node-webgpu');
			await probeNodeWebGpu({requiresShaderF16: modelInfo.requiresShaderF16});
			return {supported: true};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return {
				supported: false,
				reason: VideoMattingUnsupportedReason.WebGpuUnavailable,
				detailedReason: `ONNX Runtime could not run WebGPU inference for "${model}": ${message}`,
			};
		}
	}

	if (typeof window === 'undefined' && typeof OffscreenCanvas === 'undefined') {
		return {
			supported: false,
			reason: VideoMattingUnsupportedReason.WindowUndefined,
			detailedReason:
				'No browser, worker canvas, or Node.js environment is available.',
		};
	}

	const isSecureContext =
		typeof window === 'undefined'
			? (globalThis as {isSecureContext?: boolean}).isSecureContext
			: window.isSecureContext;
	if (isSecureContext === false) {
		return {
			supported: false,
			reason: VideoMattingUnsupportedReason.WebGpuRequiresSecureContext,
			detailedReason:
				'WebGPU requires HTTPS in production or localhost during development.',
		};
	}

	if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
		return {
			supported: false,
			reason: VideoMattingUnsupportedReason.WebGpuUnavailable,
			detailedReason: 'WebGPU is not available in this browser.',
		};
	}

	let adapter: WebGpuAdapter | null;
	try {
		const {gpu} = navigator as unknown as {
			gpu: {requestAdapter: () => Promise<WebGpuAdapter | null>};
		};
		adapter = await gpu.requestAdapter();
	} catch {
		adapter = null;
	}

	if (!adapter) {
		return {
			supported: false,
			reason: VideoMattingUnsupportedReason.WebGpuUnavailable,
			detailedReason: 'No usable WebGPU adapter is available in this browser.',
		};
	}

	if (
		modelInfo.requiresShaderF16 &&
		adapter.features?.has('shader-f16') !== true
	) {
		return {
			supported: false,
			reason: VideoMattingUnsupportedReason.ShaderF16Unavailable,
			detailedReason: `The video matting model "${model}" requires the WebGPU shader-f16 feature, which is unavailable on this adapter.`,
		};
	}

	return {supported: true};
};
