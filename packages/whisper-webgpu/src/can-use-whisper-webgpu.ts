export enum WhisperWebGpuUnsupportedReason {
	WindowUndefined = 'window-undefined',
	WebGpuUnavailable = 'webgpu-unavailable',
	WebGpuRequiresSecureContext = 'webgpu-requires-secure-context',
}

export type CanUseWhisperWebGpuResult =
	| {
			supported: true;
	  }
	| {
			supported: false;
			reason: WhisperWebGpuUnsupportedReason;
			detailedReason: string;
	  };

export const canUseWhisperWebGpu =
	async (): Promise<CanUseWhisperWebGpuResult> => {
		if (typeof window === 'undefined') {
			if (typeof process !== 'undefined' && process.release?.name === 'node') {
				try {
					const {probeNodeWebGpu} = await import('./probe-node-webgpu');
					await probeNodeWebGpu();
					return {supported: true};
				} catch (error) {
					const message =
						error instanceof Error ? error.message : String(error);
					return {
						supported: false,
						reason: WhisperWebGpuUnsupportedReason.WebGpuUnavailable,
						detailedReason: `ONNX Runtime could not initialize WebGPU: ${message}`,
					};
				}
			}

			return {
				supported: false,
				reason: WhisperWebGpuUnsupportedReason.WindowUndefined,
				detailedReason: 'WebGPU is not available in this environment.',
			};
		}

		if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
			return {
				supported: false,
				reason: WhisperWebGpuUnsupportedReason.WebGpuUnavailable,
				detailedReason: 'WebGPU is not available in this browser.',
			};
		}

		if (!window.isSecureContext) {
			return {
				supported: false,
				reason: WhisperWebGpuUnsupportedReason.WebGpuRequiresSecureContext,
				detailedReason:
					'WebGPU requires HTTPS in production or localhost during development.',
			};
		}

		let adapter: unknown | null;
		try {
			const {gpu} = navigator as unknown as {
				gpu: {requestAdapter: () => Promise<unknown | null>};
			};
			adapter = await gpu.requestAdapter();
		} catch {
			adapter = null;
		}

		if (!adapter) {
			return {
				supported: false,
				reason: WhisperWebGpuUnsupportedReason.WebGpuUnavailable,
				detailedReason:
					'No usable WebGPU adapter is available in this browser.',
			};
		}

		return {supported: true};
	};
