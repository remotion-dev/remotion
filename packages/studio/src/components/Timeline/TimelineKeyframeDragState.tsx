import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';

export type TimelineDraggedKeyframe = {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly frame: number;
};

const emptyDraggedKeyframes = new Set<string>();

export const getTimelineKeyframeDragKey = ({
	nodePathInfo,
	frame,
}: TimelineDraggedKeyframe): string => {
	return `${timelineNodePathInfoToKey(nodePathInfo)}.keyframe.${frame}`;
};

type TimelineKeyframeDragStateContextValue = {
	readonly clearDraggedKeyframes: () => void;
	readonly isKeyframeDragging: (keyframe: TimelineDraggedKeyframe) => boolean;
	readonly setDraggedKeyframes: (
		keyframes: readonly TimelineDraggedKeyframe[],
	) => void;
};

const TimelineKeyframeDragStateContext =
	createContext<TimelineKeyframeDragStateContextValue>({
		clearDraggedKeyframes: () => undefined,
		isKeyframeDragging: () => false,
		setDraggedKeyframes: () => undefined,
	});

export const TimelineKeyframeDragStateProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [draggedKeys, setDraggedKeys] = useState<ReadonlySet<string>>(
		emptyDraggedKeyframes,
	);

	const setDraggedKeyframes = useCallback(
		(keyframes: readonly TimelineDraggedKeyframe[]) => {
			setDraggedKeys(new Set(keyframes.map(getTimelineKeyframeDragKey)));
		},
		[],
	);

	const clearDraggedKeyframes = useCallback(() => {
		setDraggedKeys(emptyDraggedKeyframes);
	}, []);

	const isKeyframeDragging = useCallback(
		(keyframe: TimelineDraggedKeyframe) => {
			return draggedKeys.has(getTimelineKeyframeDragKey(keyframe));
		},
		[draggedKeys],
	);

	const value = useMemo(
		(): TimelineKeyframeDragStateContextValue => ({
			clearDraggedKeyframes,
			isKeyframeDragging,
			setDraggedKeyframes,
		}),
		[clearDraggedKeyframes, isKeyframeDragging, setDraggedKeyframes],
	);

	return (
		<TimelineKeyframeDragStateContext.Provider value={value}>
			{children}
		</TimelineKeyframeDragStateContext.Provider>
	);
};

export const useTimelineKeyframeDragState = () => {
	return useContext(TimelineKeyframeDragStateContext);
};
