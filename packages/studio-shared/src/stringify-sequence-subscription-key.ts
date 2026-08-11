import type {SequencePropsSubscriptionKey} from 'remotion';

export const stringifySequenceSubscriptionKey = (
	key: SequencePropsSubscriptionKey,
): string => {
	return `${key.absolutePath}:${JSON.stringify(key.nodePath)}:${key.sequenceKeys.join('\0')}:${key.effectKeys.map((keys) => keys.join('\0')).join('\0\0')}`;
};

// deliberately not including effect keys, keeping expanded if changing effects
export const stringifySequenceExpandedRowKey = (
	key: SequencePropsSubscriptionKey,
): string => {
	return `${key.absolutePath}:${JSON.stringify(key.nodePath)}:${key.sequenceKeys.join('\0')}`;
};
