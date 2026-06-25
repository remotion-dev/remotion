import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineSelection} from './TimelineSelection';

type AnimationItemSelection = Extract<
	TimelineSelection,
	{type: 'keyframe'} | {type: 'easing'}
>;

type AnimationKeyframe = {
	readonly frame: number;
};

const getKeyframeSelection = ({
	keyframe,
	keyframeDisplayOffset,
	nodePathInfo,
}: {
	readonly keyframe: AnimationKeyframe;
	readonly keyframeDisplayOffset: number;
	readonly nodePathInfo: SequenceNodePathInfo;
}): AnimationItemSelection => {
	return {
		type: 'keyframe',
		nodePathInfo,
		frame: keyframe.frame + keyframeDisplayOffset,
	};
};

export const getAnimationItemSelectionForSourceFrame = ({
	includeEasings,
	keyframeDisplayOffset,
	keyframes,
	nodePathInfo,
	sourceFrame,
}: {
	readonly includeEasings: boolean;
	readonly keyframeDisplayOffset: number;
	readonly keyframes: readonly AnimationKeyframe[];
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sourceFrame: number;
}): AnimationItemSelection | null => {
	const firstKeyframe = keyframes[0];
	if (!firstKeyframe) {
		return null;
	}

	for (let i = 0; i < keyframes.length; i++) {
		const keyframe = keyframes[i];
		if (keyframe.frame === sourceFrame) {
			return getKeyframeSelection({
				keyframe,
				keyframeDisplayOffset,
				nodePathInfo,
			});
		}

		const nextKeyframe = keyframes[i + 1];
		if (!nextKeyframe) {
			continue;
		}

		if (sourceFrame > keyframe.frame && sourceFrame < nextKeyframe.frame) {
			if (!includeEasings) {
				return null;
			}

			return {
				type: 'easing',
				nodePathInfo,
				fromFrame: keyframe.frame + keyframeDisplayOffset,
				toFrame: nextKeyframe.frame + keyframeDisplayOffset,
				segmentIndex: i,
			};
		}
	}

	const lastKeyframe = keyframes[keyframes.length - 1];
	return getKeyframeSelection({
		keyframe: sourceFrame < firstKeyframe.frame ? firstKeyframe : lastKeyframe,
		keyframeDisplayOffset,
		nodePathInfo,
	});
};
