import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export const areSequenceNodePathInfosEqual = (
	first: SequenceNodePathInfo,
	second: SequenceNodePathInfo,
) => {
	if (
		first.index !== second.index ||
		first.numberOfSequencesWithThisNodePath !==
			second.numberOfSequencesWithThisNodePath ||
		first.supportsEffects !== second.supportsEffects ||
		stringifySequenceSubscriptionKey(first.sequenceSubscriptionKey) !==
			stringifySequenceSubscriptionKey(second.sequenceSubscriptionKey) ||
		first.auxiliaryKeys.length !== second.auxiliaryKeys.length ||
		!first.auxiliaryKeys.every(
			(key, index) => key === second.auxiliaryKeys[index],
		)
	) {
		return false;
	}

	const firstVideoConfig = first.sequenceSubscriptionKey.videoConfigValues;
	const secondVideoConfig = second.sequenceSubscriptionKey.videoConfigValues;
	return (
		firstVideoConfig === secondVideoConfig ||
		(firstVideoConfig !== null &&
			secondVideoConfig !== null &&
			firstVideoConfig.durationInFrames ===
				secondVideoConfig.durationInFrames &&
			firstVideoConfig.fps === secondVideoConfig.fps &&
			firstVideoConfig.height === secondVideoConfig.height &&
			firstVideoConfig.width === secondVideoConfig.width)
	);
};
