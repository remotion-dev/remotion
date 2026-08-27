import type {SequencePropsSubscriptionKey} from 'remotion';

const pendingExpansionKeys = new Set<string>();
const listeners = new Set<() => void>();

const getExpansionRequestKey = (nodePath: SequencePropsSubscriptionKey) => {
	return JSON.stringify([nodePath.absolutePath, nodePath.nodePath]);
};

export const requestEffectsInspectorExpansion = (
	nodePath: SequencePropsSubscriptionKey,
) => {
	pendingExpansionKeys.add(getExpansionRequestKey(nodePath));
	for (const listener of listeners) {
		listener();
	}
};

export const hasPendingEffectsInspectorExpansion = (
	nodePath: SequencePropsSubscriptionKey,
) => {
	return pendingExpansionKeys.has(getExpansionRequestKey(nodePath));
};

export const clearPendingEffectsInspectorExpansion = (
	nodePath: SequencePropsSubscriptionKey,
) => {
	pendingExpansionKeys.delete(getExpansionRequestKey(nodePath));
};

export const subscribeToEffectsInspectorExpansionRequests = (
	listener: () => void,
) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
