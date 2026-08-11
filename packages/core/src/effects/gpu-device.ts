// Singleton accessor for the WebGPU device.
//
// `navigator.gpu.requestAdapter()` and `adapter.requestDevice()` are async and
// non-trivially expensive (~10-100ms on first call). The device is cached
// globally so every webgpu effect / chain shares the same one.
//
// `GPUDevice` is intentionally typed as `unknown` here to avoid pulling
// `@webgpu/types` into core; effects targeting webgpu narrow the type
// themselves.

let devicePromise: Promise<unknown> | null = null;

export const getGpuDevice = (): Promise<unknown> => {
	if (devicePromise) {
		return devicePromise;
	}

	devicePromise = (async () => {
		if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
			throw new Error('WebGPU is not available in this environment');
		}

		const {gpu} = navigator as unknown as {
			gpu: {requestAdapter: () => Promise<unknown>};
		};
		const adapter = (await gpu.requestAdapter()) as {
			requestDevice: () => Promise<unknown>;
		} | null;
		if (!adapter) {
			throw new Error('No WebGPU adapter available');
		}

		return adapter.requestDevice();
	})();

	return devicePromise;
};

// Test-only: reset the cached device. Not exported from `remotion`.
export const _resetGpuDeviceForTesting = (): void => {
	devicePromise = null;
};
