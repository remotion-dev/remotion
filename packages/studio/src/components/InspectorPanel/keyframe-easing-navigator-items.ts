import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineSelection} from '../Timeline/TimelineSelection';

export type KeyframeNavigatorItem = {
	readonly selection: Extract<TimelineSelection, {type: 'keyframe'}>;
	readonly type: 'keyframe';
};

export type EasingNavigatorItem = {
	readonly selection: Extract<TimelineSelection, {type: 'easing'}>;
	readonly type: 'easing';
};

export type NavigatorItem = KeyframeNavigatorItem | EasingNavigatorItem;

export type NavigatorKeyframe = {
	readonly frame: number;
};

export const getKeyframeEasingNavigatorItems = ({
	includeEasings,
	keyframes,
	nodePathInfo,
}: {
	readonly includeEasings: boolean;
	readonly keyframes: readonly NavigatorKeyframe[];
	readonly nodePathInfo: SequenceNodePathInfo;
}): NavigatorItem[] => {
	return keyframes.flatMap((keyframe, index): NavigatorItem[] => {
		const keyframeItem: NavigatorItem = {
			type: 'keyframe',
			selection: {
				type: 'keyframe',
				nodePathInfo,
				frame: keyframe.frame,
			},
		};
		const nextKeyframe = keyframes[index + 1];
		if (!includeEasings || !nextKeyframe) {
			return [keyframeItem];
		}

		return [
			keyframeItem,
			{
				type: 'easing',
				selection: {
					type: 'easing',
					nodePathInfo,
					fromFrame: keyframe.frame,
					toFrame: nextKeyframe.frame,
					segmentIndex: index,
				},
			},
		];
	});
};

export const getNavigatorItemPlayheadFrame = (item: NavigatorItem): number => {
	if (item.type === 'keyframe') {
		return item.selection.frame;
	}

	return Math.round((item.selection.fromFrame + item.selection.toFrame) / 2);
};
