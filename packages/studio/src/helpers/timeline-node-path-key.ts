import {CanvasInternals} from '@remotion/sdk';
import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export const {timelineSequenceNodePathToKey}: typeof CanvasInternals =
	CanvasInternals;

export const timelineNodePathInfoToKey = (info: SequenceNodePathInfo): string =>
	[
		stringifySequenceExpandedRowKey(info.sequenceSubscriptionKey),
		info.auxiliaryKeys.join('.'),
		info.index,
	].join('.');

export const timelineNodePathInfoToStableKey = (
	info: SequenceNodePathInfo,
): string => {
	if (info.auxiliaryKeys[0] !== 'effects' || info.auxiliaryKeys.length < 2)
		return timelineNodePathInfoToKey(info);
	const item = Internals.OptimisticEffects.getItems(
		info.sequenceSubscriptionKey,
		null,
	)[Number(info.auxiliaryKeys[1])];
	return item
		? JSON.stringify([
				'effect',
				item.id,
				info.index,
				info.auxiliaryKeys.slice(2),
			])
		: timelineNodePathInfoToKey(info);
};
