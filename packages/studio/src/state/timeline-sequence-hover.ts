import type {Dispatch, SetStateAction} from 'react';
import {createContext, useCallback, useContext, useMemo} from 'react';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	timelineNodePathInfoToKey,
	timelineSequenceNodePathToKey,
} from '../helpers/timeline-node-path-key';

export type TimelineSequenceHover = {
	readonly key: string;
	readonly nodePathKey: string;
	readonly source: 'canvas' | 'timeline';
};

type TimelineSequenceHoverState = {
	readonly hoveredSequence: TimelineSequenceHover | null;
	readonly setHoveredSequence: Dispatch<
		SetStateAction<TimelineSequenceHover | null>
	>;
};

export const TimelineSequenceHoverContext =
	createContext<TimelineSequenceHoverState>({
		hoveredSequence: null,
		setHoveredSequence: () => undefined,
	});

export const useTimelineSequenceHover = (
	nodePathInfo: SequenceNodePathInfo | null,
) => {
	const {hoveredSequence, setHoveredSequence} = useContext(
		TimelineSequenceHoverContext,
	);
	const sequenceKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: timelineNodePathInfoToKey({...nodePathInfo, auxiliaryKeys: []}),
		[nodePathInfo],
	);
	const nodePathKey = useMemo(
		() =>
			nodePathInfo === null
				? null
				: timelineSequenceNodePathToKey(nodePathInfo.sequenceSubscriptionKey),
		[nodePathInfo],
	);

	const onPointerEnter = useCallback(() => {
		if (sequenceKey === null || nodePathKey === null) {
			return;
		}

		setHoveredSequence({
			key: sequenceKey,
			nodePathKey,
			source: 'timeline',
		});
	}, [nodePathKey, sequenceKey, setHoveredSequence]);

	const onPointerLeave = useCallback(() => {
		setHoveredSequence((currentHover) => {
			if (
				currentHover?.source !== 'timeline' ||
				currentHover.key !== sequenceKey
			) {
				return currentHover;
			}

			return null;
		});
	}, [sequenceKey, setHoveredSequence]);

	const hovered =
		nodePathKey !== null && hoveredSequence?.nodePathKey === nodePathKey;

	return useMemo(
		() => ({hovered, onPointerEnter, onPointerLeave}),
		[hovered, onPointerEnter, onPointerLeave],
	);
};
