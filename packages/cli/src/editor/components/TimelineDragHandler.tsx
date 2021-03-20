import React, {useCallback, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import styled from 'styled-components';
import {useWindowSize} from '../hooks/use-window-size';

const PADDING = 16;

const Container = styled.div`
	flex: 1;
	position: relative;
	padding: ${PADDING}px;
	user-select: none;
	overflow-y: auto;
`;

const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number
) => {
	const pos = clientX - PADDING;
	const frame = Math.round(
		interpolate(pos, [0, width - PADDING * 2], [0, durationInFrames - 1 ?? 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
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
	const [playing, setPlaying] = Internals.Timeline.usePlayingState();
	const setTimelinePosition = Internals.Timeline.useTimelineSetFrame();
	const videoConfig = Internals.useUnsafeVideoConfig();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!videoConfig) {
				return;
			}
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
		[playing, setPlaying, setTimelinePosition, videoConfig, width]
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!dragging.dragging) {
				return;
			}
			if (!videoConfig) {
				return;
			}
			const frame = getFrameFromX(
				e.clientX,
				videoConfig.durationInFrames,
				width
			);
			setTimelinePosition(frame);
		},
		[dragging.dragging, setTimelinePosition, videoConfig, width]
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
