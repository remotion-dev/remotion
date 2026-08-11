import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey} from 'remotion';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export const timelineSequenceNodePathToKey = (
	key: SequencePropsSubscriptionKey,
): string => `${key.absolutePath}:${JSON.stringify(key.nodePath)}`;

export const timelineNodePathInfoToKey = (info: SequenceNodePathInfo): string =>
	[
		stringifySequenceExpandedRowKey(info.sequenceSubscriptionKey),
		info.auxiliaryKeys.join('.'),
		info.index,
	].join('.');
