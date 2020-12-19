import React, {useCallback, useState} from 'react';
import {
	interpolate,
	usePlayingState,
	useTimelineSetFrame,
	useVideoConfig,
} from 'remotion';
import styled from 'styled-components';
import {
	TIMELINE_LEFT_PADDING,
	TIMELINE_RIGHT_PADDING,
} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';

const Container = styled.div`
	position: relative;
	padding-left: ${TIMELINE_LEFT_PADDING}px;
	padding-right: ${TIMELINE_RIGHT_PADDING}px;
	padding-top: 20px;
	margin-top: -10px;
	user-select: none;
	overflow-y: auto;
	height: 300px;
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
	const [dragging, setDragging] = useState<
		| {
				dragging: false;
		  }
		| {
				dragging: true;
				wasPlaying: boolean;
		  }
	>({
		dragging: false,
	});
	const [playing, setPlaying] = usePlayingState();
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
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
			setPlaying(false);
		},
		[
			playing,
			setPlaying,
			setTimelinePosition,
			videoConfig.durationInFrames,
			width,
		]
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!dragging.dragging) {
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
		setDragging({
			dragging: false,
		});
		if (!dragging.dragging) {
			return;
		}
		setPlaying(dragging.wasPlaying);
	}, [dragging, setPlaying]);

	const onPointerUp = useCallback(() => {
		setDragging({
			dragging: false,
		});
		if (!dragging.dragging) {
			return;
		}
		setPlaying(dragging.wasPlaying);
	}, [dragging, setPlaying]);

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
