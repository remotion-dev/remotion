import type {
	WhisperWebGpuBackend,
	ResolvedWhisperWebGpuBackend,
} from './backend';
import {resolveBackend} from './backend';

export enum WhisperWebGpuUnsupportedReason {
	WindowUndefined = 'window-undefined',
	WebAssemblyUnavailable = 'webassembly-unavailable',
	WebGpuUnavailable = 'webgpu-unavailable',
	WebGpuRequiresSecureContext = 'webgpu-requires-secure-context',
}

export type CanUseWhisperWebGpuResult =
	| {
			supported: true;
			backend: ResolvedWhisperWebGpuBackend;
			wasmThreads: number | null;
	  }
	| {
			supported: false;
			reason: WhisperWebGpuUnsupportedReason;
			detailedReason: string;
	  };

export type CanUseWhisperWebGpuOptions = {
	backend?: WhisperWebGpuBackend;
};

export const canUseWhisperWebGpu = ({
	backend = 'auto',
}: CanUseWhisperWebGpuOptions = {}): CanUseWhisperWebGpuResult => {
	if (typeof window === 'undefined') {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.WindowUndefined,
			detailedReason:
				'`window` is not defined. @remotion/whisper-webgpu is intended for browser environments.',
		};
	}

	if (backend === 'webgpu' && !('gpu' in navigator)) {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.WebGpuUnavailable,
			detailedReason: 'WebGPU is not available in this browser.',
		};
	}

	if (backend === 'webgpu' && !window.isSecureContext) {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.WebGpuRequiresSecureContext,
			detailedReason:
				'WebGPU requires HTTPS in production or localhost during development.',
		};
	}

	const resolvedBackend = resolveBackend(backend);
	if (resolvedBackend === 'wasm' && typeof WebAssembly === 'undefined') {
		return {
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.WebAssemblyUnavailable,
			detailedReason: 'WebAssembly is not available in this browser.',
		};
	}

	return {
		supported: true,
		backend: resolvedBackend,
		wasmThreads:
			resolvedBackend === 'wasm'
				? window.crossOriginIsolated
					? Math.max(1, navigator.hardwareConcurrency || 1)
					: 1
				: null,
	};
};
