import type {CanUpdateSequencePropStatusKeyframed} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {getKeyframeDisplayOffset as resolveKeyframeDisplayOffset} from '../Timeline/get-timeline-keyframes';
import type {TimelineEasingSelection} from '../Timeline/TimelineSelection';

export const getEasingSelectionFromCurrentKeyframes = ({
	keyframeDisplayOffset,
	nodePathInfo,
	propStatus,
	segmentIndex,
}: {
	readonly keyframeDisplayOffset: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly segmentIndex: number;
}): TimelineEasingSelection | null => {
	const fromKeyframe = propStatus.keyframes[segmentIndex];
	const toKeyframe = propStatus.keyframes[segmentIndex + 1];
	if (!fromKeyframe || !toKeyframe) {
		return null;
	}

	const resolvedKeyframeDisplayOffset = resolveKeyframeDisplayOffset({
		propStatus,
		keyframeDisplayOffset,
	});

	return {
		type: 'easing',
		nodePathInfo,
		fromFrame: fromKeyframe.frame + resolvedKeyframeDisplayOffset,
		toFrame: toKeyframe.frame + resolvedKeyframeDisplayOffset,
		segmentIndex,
	};
};
