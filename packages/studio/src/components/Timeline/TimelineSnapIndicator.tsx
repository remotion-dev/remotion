import React, {useContext, useLayoutEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {SELECTED_OUTLINE_SNAP_COLOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {EditorSnappingContext} from '../../state/editor-snapping';
import {scrollableRef, sliderAreaRef} from './timeline-refs';
import {TimelineWidthContext} from './TimelineWidthProvider';

type UpdateTimelineSnapFrame = (frame: number | null) => void;

export const TimelineSnapIndicatorContext =
	React.createContext<React.RefObject<UpdateTimelineSnapFrame> | null>(null);

export const TimelineSnapIndicatorProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const updateSnapFrameRef = useRef<UpdateTimelineSnapFrame>(() => undefined);

	return (
		<TimelineSnapIndicatorContext.Provider value={updateSnapFrameRef}>
			{children}
		</TimelineSnapIndicatorContext.Provider>
	);
};

const indicator: React.CSSProperties = {
	backgroundColor: SELECTED_OUTLINE_SNAP_COLOR,
	bottom: 0,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	top: 0,
	width: 1,
};

export const TimelineSnapIndicator: React.FC = () => {
	const updateSnapFrameRef = useContext(TimelineSnapIndicatorContext);
	const [frame, setFrame] = useState<number | null>(null);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const timelineWidth = useContext(TimelineWidthContext);
	const videoConfig = Internals.useUnsafeVideoConfig();

	useLayoutEffect(() => {
		if (updateSnapFrameRef === null) {
			return;
		}

		setFrame(null);
		updateSnapFrameRef.current = setFrame;
		return () => {
			if (updateSnapFrameRef.current === setFrame) {
				updateSnapFrameRef.current = () => undefined;
			}
		};
	}, [updateSnapFrameRef, videoConfig?.id]);

	if (
		!editorSnapping ||
		frame === null ||
		timelineWidth === null ||
		videoConfig === null
	) {
		return null;
	}

	const left = getXPositionOfItemInTimelineImperatively(
		frame,
		videoConfig.durationInFrames,
		sliderAreaRef.current?.clientWidth ?? timelineWidth,
	);
	const viewportLeft =
		(scrollableRef.current?.getBoundingClientRect().left ?? 0) -
		(scrollableRef.current?.scrollLeft ?? 0);
	const alignedLeft =
		Math.round((viewportLeft + left) * window.devicePixelRatio) /
			window.devicePixelRatio -
		viewportLeft;

	return (
		<div
			aria-hidden="true"
			data-timeline-snap-indicator="true"
			style={{...indicator, transform: `translateX(${alignedLeft}px)`}}
		/>
	);
};
