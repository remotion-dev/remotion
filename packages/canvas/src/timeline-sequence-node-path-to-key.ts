import type {SequencePropsSubscriptionKey} from 'remotion';

export const timelineSequenceNodePathToKey = (
	key: SequencePropsSubscriptionKey,
): string => `${key.absolutePath}:${JSON.stringify(key.nodePath)}`;
