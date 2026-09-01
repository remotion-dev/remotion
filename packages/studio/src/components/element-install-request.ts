import type {ElementInstallRequest} from '@remotion/studio-shared';

const listeners = new Set<(request: ElementInstallRequest) => void>();

export const enqueueElementInstallRequest = (
	request: ElementInstallRequest,
) => {
	for (const listener of listeners) {
		listener(request);
	}
};

export const subscribeToElementInstallRequests = (
	listener: (request: ElementInstallRequest) => void,
) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
