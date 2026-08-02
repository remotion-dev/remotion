import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export const timelineNodePathInfoToKey = (info: SequenceNodePathInfo): string =>
	[
		stringifySequenceExpandedRowKey(info.sequenceSubscriptionKey),
		info.auxiliaryKeys.join('.'),
		info.index,
	].join('.');

export const timelineNodePathInfoToIdentityKey = (
	info: SequenceNodePathInfo,
): string =>
	JSON.stringify({
		sequenceSubscriptionKey: {
			absolutePath: info.sequenceSubscriptionKey.absolutePath,
			nodePath: info.sequenceSubscriptionKey.nodePath,
			sequenceKeys: info.sequenceSubscriptionKey.sequenceKeys,
			effectKeys: info.sequenceSubscriptionKey.effectKeys,
			videoConfigValues: info.sequenceSubscriptionKey.videoConfigValues
				? {
						durationInFrames:
							info.sequenceSubscriptionKey.videoConfigValues.durationInFrames,
						fps: info.sequenceSubscriptionKey.videoConfigValues.fps,
						height: info.sequenceSubscriptionKey.videoConfigValues.height,
						width: info.sequenceSubscriptionKey.videoConfigValues.width,
					}
				: null,
		},
		auxiliaryKeys: info.auxiliaryKeys,
		index: info.index,
		numberOfSequencesWithThisNodePath: info.numberOfSequencesWithThisNodePath,
		supportsEffects: info.supportsEffects,
	} satisfies SequenceNodePathInfo);
