import type {SequencePropsSubscriptionKey} from 'remotion';

export type FocusInspectorFieldRequest = {
	readonly fieldKey: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly requestId: number;
};

const listeners = new Set<(request: FocusInspectorFieldRequest) => void>();

export const requestFocusInspectorField = ({
	fieldKey,
	nodePath,
}: {
	readonly fieldKey: string;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const request = {
		fieldKey,
		nodePath,
		requestId: Date.now(),
	};

	for (const listener of listeners) {
		listener(request);
	}
};

export const subscribeToFocusInspectorFieldRequests = (
	listener: (request: FocusInspectorFieldRequest) => void,
) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
