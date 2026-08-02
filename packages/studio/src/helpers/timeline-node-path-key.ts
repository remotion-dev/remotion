import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export const timelineNodePathInfoToKey = (info: SequenceNodePathInfo): string =>
	[
		stringifySequenceExpandedRowKey(info.sequenceSubscriptionKey),
		info.auxiliaryKeys.join('.'),
		info.index,
	].join('.');
