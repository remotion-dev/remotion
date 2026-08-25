export type WhisperWebGpuBackend = 'auto' | 'webgpu' | 'wasm';
export type ResolvedWhisperWebGpuBackend = Exclude<
	WhisperWebGpuBackend,
	'auto'
>;

const requestWebGpuAdapter = async (): Promise<unknown | null> => {
	if (
		typeof navigator === 'undefined' ||
		!('gpu' in navigator) ||
		globalThis.isSecureContext === false
	) {
		return null;
	}

	const {gpu} = navigator as unknown as {
		gpu: {requestAdapter: () => Promise<unknown | null>};
	};

	try {
		return await gpu.requestAdapter();
	} catch {
		return null;
	}
};

export const resolveBackend = async (
	backend: WhisperWebGpuBackend,
): Promise<ResolvedWhisperWebGpuBackend> => {
	if (backend === 'wasm') {
		return 'wasm';
	}

	const adapter = await requestWebGpuAdapter();
	if (adapter) {
		return 'webgpu';
	}

	if (backend === 'webgpu') {
		throw new Error('No usable WebGPU adapter is available in this browser.');
	}

	return 'wasm';
};
