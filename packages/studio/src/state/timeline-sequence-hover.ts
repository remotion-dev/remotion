import type {Dispatch, SetStateAction} from 'react';
import {createContext, useCallback, useContext, useMemo} from 'react';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {timelineNodePathInfoToKey} from '../helpers/timeline-node-path-key';

export type TimelineSequenceHover = {
	readonly key: string;
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

	const onPointerEnter = useCallback(() => {
		if (sequenceKey === null) {
			return;
		}

		setHoveredSequence({key: sequenceKey, source: 'timeline'});
	}, [sequenceKey, setHoveredSequence]);

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

	const hovered = sequenceKey !== null && hoveredSequence?.key === sequenceKey;

	return useMemo(
		() => ({hovered, onPointerEnter, onPointerLeave}),
		[hovered, onPointerEnter, onPointerLeave],
	);
};
