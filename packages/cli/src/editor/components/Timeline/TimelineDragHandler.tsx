import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useState} from 'react';
import {Internals, interpolate} from 'remotion';
import styled from 'styled-components';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {persistCurrentFrame} from '../FramePersistor';
import {sliderAreaRef} from './timeline-refs';

const Container = styled.div`
	user-select: none;
	overflow: hidden;
	position: absolute;
	width: 100%;
	height: 100%;
`;

const Inner = styled.div`
	overflow-y: auto;
	overflow-x: hidden;
`;

const getFrameFromX = (
	clientX: number,
	durationInFrames: number,
	width: number
) => {
	const pos = clientX - TIMELINE_PADDING;
	const frame = Math.round(
		interpolate(
			pos,
			[0, width - TIMELINE_PADDING * 2],
			[0, durationInFrames - 1 ?? 0],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}
		)
	);
	return frame;
};

export const TimelineDragHandler: React.FC = ({children}) => {
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: true,
	});
	const width = size?.width ?? 0;
	const left = size?.left ?? 0;
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
	const {playing, play, pause, seek} = PlayerInternals.usePlayer();
	const videoConfig = Internals.useUnsafeVideoConfig();

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!videoConfig) {
				return;
			}

			const frame = getFrameFromX(
				e.clientX - left,
				videoConfig.durationInFrames,
				width
			);
			seek(frame);
			setDragging({
				dragging: true,
				wasPlaying: playing,
			});
			pause();
		},
		[pause, playing, seek, left, videoConfig, width]
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!dragging.dragging) {
				return;
			}

			if (!videoConfig) {
				return;
			}

			const frame = getFrameFromX(
				e.clientX - left,
				videoConfig.durationInFrames,
				width
			);
			seek(frame);
		},
		[dragging.dragging, seek, left, videoConfig, width]
	);

	const onPointerUp = useCallback(
		(e: PointerEvent) => {
			setDragging({
				dragging: false,
			});
			if (!dragging.dragging) {
				return;
			}

			if (!videoConfig) {
				return;
			}

			const frame = getFrameFromX(
				e.clientX - left,
				videoConfig.durationInFrames,
				width
			);

			persistCurrentFrame(frame);

			if (dragging.wasPlaying) {
				play();
			}
		},
		[dragging, left, play, videoConfig, width]
	);

	useEffect(() => {
		if (!dragging.dragging) {
			return;
		}

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};
	}, [dragging.dragging, onPointerMove, onPointerUp]);

	return (
		<Container ref={sliderAreaRef} onPointerDown={onPointerDown}>
			<Inner>{children}</Inner>
		</Container>
	);
};
