export type WhisperWebGpuBackend = 'auto' | 'webgpu' | 'wasm';
export type ResolvedWhisperWebGpuBackend = Exclude<
	WhisperWebGpuBackend,
	'auto'
>;

const hasWebGpu = () => {
	return (
		typeof navigator !== 'undefined' &&
		'gpu' in navigator &&
		globalThis.isSecureContext !== false
	);
};

export const resolveBackend = (
	backend: WhisperWebGpuBackend,
): ResolvedWhisperWebGpuBackend => {
	if (backend === 'webgpu' && !hasWebGpu()) {
		throw new Error('WebGPU is not available in this browser.');
	}

	if (backend === 'auto') {
		return hasWebGpu() ? 'webgpu' : 'wasm';
	}

	return backend;
};
