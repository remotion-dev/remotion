// Singleton accessor for the WebGPU device.
//
// `navigator.gpu.requestAdapter()` and `adapter.requestDevice()` are async and
// non-trivially expensive (~10-100ms on first call). The device is cached
// globally so every webgpu effect / chain shares the same one.
//
// `GPUDevice` is intentionally typed as `unknown` here to avoid pulling
// `@webgpu/types` into core; effects targeting webgpu narrow the type
// themselves.

let deviceLost = false;
let devicePromise: Promise<unknown> | null = null;

export const getGpuDevice = (): Promise<unknown> => {
	if (
		deviceLost &&
		typeof window !== 'undefined' &&
		window.remotion_puppeteerTimeout !== undefined
	) {
		throw new Error(
			'WebGPU device was lost during rendering. Retry the render or use preferredEffectBackend: "webgl2".',
		);
	}

	if (devicePromise) {
		return devicePromise;
	}

	devicePromise = (async () => {
		if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
			return null;
		}

		const {gpu} = navigator as unknown as {
			gpu: {
				requestAdapter: () => Promise<unknown>;
				getPreferredCanvasFormat: () => string;
			};
		};
		const adapter = (await gpu.requestAdapter()) as {
			requestDevice: () => Promise<unknown>;
		} | null;
		if (!adapter) {
			return null;
		}

		const device = (await adapter.requestDevice()) as {
			lost: Promise<unknown>;
			destroy: () => void;
			pushErrorScope: (filter: 'validation') => void;
			popErrorScope: () => Promise<unknown | null>;
		};
		let supportsCanvasTargets = false;
		try {
			const canvas = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			const context = canvas.getContext('webgpu') as {
				configure: (configuration: {
					device: unknown;
					format: string;
					alphaMode: 'premultiplied';
				}) => void;
				getCurrentTexture: () => {createView: () => unknown};
				unconfigure: () => void;
			} | null;
			if (!context) return null;

			// Some headless browsers expose a device but return invalid canvas
			// textures. Detect this before an effect silently draws transparent pixels.
			// All callers share this initialization, so the scope cannot swallow an
			// effect's validation errors and adds no work to subsequent frames.
			let validationError: unknown = null;
			try {
				device.pushErrorScope('validation');
				try {
					context.configure({
						device,
						format: gpu.getPreferredCanvasFormat(),
						alphaMode: 'premultiplied',
					});
					context.getCurrentTexture().createView();
				} finally {
					validationError = await device.popErrorScope();
				}
			} finally {
				context.unconfigure();
			}

			if (validationError) return null;
			supportsCanvasTargets = true;
		} finally {
			if (!supportsCanvasTargets) device.destroy();
		}

		device.lost?.then(() => {
			// Keep the fallback stable for the lifetime of a render/preview session.
			deviceLost = true;
			devicePromise = Promise.resolve(null);
		});
		return device;
	})().catch(() => null);

	return devicePromise;
};

// Test-only: reset the cached device. Not exported from `remotion`.
export const _resetGpuDeviceForTesting = (): void => {
	devicePromise = null;
	deviceLost = false;
};
