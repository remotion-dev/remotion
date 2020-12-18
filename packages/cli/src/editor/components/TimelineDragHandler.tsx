import React, {useCallback, useState} from 'react';
import {interpolate, useTimelineSetFrame, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import {
	TIMELINE_LEFT_PADDING,
	TIMELINE_RIGHT_PADDING,
} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';

const Container = styled.div`
	position: relative;
	padding: 10px;
	padding-top: 20px;
	margin-top: -10px;
	user-select: none;
`;

const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number
) => {
	const pos = clientX - TIMELINE_LEFT_PADDING;
	const frame = Math.round(
		interpolate(
			pos,
			[0, width - TIMELINE_LEFT_PADDING - TIMELINE_RIGHT_PADDING],
			[0, durationInFrames ?? 0],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}
		)
	);
	return frame;
};

export const TimelineDragHandler: React.FC = ({children}) => {
	const {width} = useWindowSize();
	const [dragging, setDragging] = useState(false);
	const setTimelinePosition = useTimelineSetFrame();
	const videoConfig = useVideoConfig();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const frame = getFrameFromX(
				e.clientX,
				videoConfig.durationInFrames,
				width
			);
			setTimelinePosition(frame);
			setDragging(true);
		},
		[setTimelinePosition, videoConfig.durationInFrames, width]
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!dragging) {
				return;
			}
			const frame = getFrameFromX(
				e.clientX,
				videoConfig.durationInFrames,
				width
			);
			setTimelinePosition(frame);
		},
		[dragging, setTimelinePosition, videoConfig.durationInFrames, width]
	);

	const onPointerLeave = useCallback(() => {
		setDragging(false);
	}, []);

	const onPointerUp = useCallback(() => {
		setDragging(false);
	}, []);

	return (
		<Container
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
			onPointerUp={onPointerUp}
		>
			{children}
		</Container>
	);
};
