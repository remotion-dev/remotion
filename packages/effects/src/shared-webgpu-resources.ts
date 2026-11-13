const deviceResources = new WeakMap<GPUDevice, Map<string, unknown>>();
const lostDevices = new WeakSet<GPUDevice>();

export const getSharedWebGpuResources = <T>({
	device,
	key,
	create,
}: {
	device: GPUDevice;
	key: string;
	create: () => T;
}): T => {
	if (lostDevices.has(device)) {
		throw new Error('Cannot create WebGPU resources with a lost device');
	}

	let resources = deviceResources.get(device);
	if (!resources) {
		resources = new Map();
		deviceResources.set(device, resources);
		const cached = resources;
		device.lost.then(() => {
			lostDevices.add(device);
			cached.clear();
			deviceResources.delete(device);
		});
	}

	if (resources.has(key)) {
		return resources.get(key) as T;
	}

	const shared = create();
	resources.set(key, shared);
	return shared;
};
