import type {CanUpdateSequencePropStatusKeyframed} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineEasingSelection} from './TimelineSelection';

export const getEasingSelectionAfterKeyframeDelete = ({
	deletedSourceFrames,
	keyframeDisplayOffset,
	nodePathInfo,
	propStatus,
	timelinePosition,
}: {
	readonly deletedSourceFrames: readonly number[];
	readonly keyframeDisplayOffset: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly timelinePosition: number;
}): TimelineEasingSelection | null => {
	const deletedSourceFrameSet = new Set(deletedSourceFrames);
	const remainingKeyframes = propStatus.keyframes.filter(
		(keyframe) => !deletedSourceFrameSet.has(keyframe.frame),
	);
	const sourceFrame = timelinePosition - keyframeDisplayOffset;

	for (let i = 0; i < remainingKeyframes.length - 1; i++) {
		const keyframe = remainingKeyframes[i];
		const nextKeyframe = remainingKeyframes[i + 1];
		if (!keyframe || !nextKeyframe) {
			continue;
		}

		if (sourceFrame > keyframe.frame && sourceFrame < nextKeyframe.frame) {
			return {
				type: 'easing',
				nodePathInfo,
				fromFrame: keyframe.frame + keyframeDisplayOffset,
				toFrame: nextKeyframe.frame + keyframeDisplayOffset,
				segmentIndex: i,
			};
		}
	}

	return null;
};
