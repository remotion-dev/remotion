import {PlayerInternals} from '@remotion/player';
import React, {useEffect} from 'react';
import {Internals} from 'remotion';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {sliderAreaRef} from './timeline-refs';
import {
	TimelineInPointerHandle,
	TimelineOutPointerHandle,
} from './TimelineInOutPointerHandle';

const container: React.CSSProperties = {
	position: 'absolute',
	bottom: 0,
	top: 0,
};

const areaHighlight: React.CSSProperties = {
	position: 'absolute',
	backgroundColor: '#448cc059',
	height: '100%',
	bottom: 0,
	top: 0,
};

export const TimelineInOutPointer: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {
		inFrame,
		outFrame,
	} = Internals.Timeline.useTimelineInOutFramePosition();
	const {
		setInFrame,
		setOutFrame,
	} = Internals.Timeline.useTimelineSetInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {playing} = PlayerInternals.usePlayer();
	const size = PlayerInternals.useElementSize(sliderAreaRef, {
		triggerOnWindowResize: false,
	});
	const width = size?.width ?? 0;

	useEffect(() => {
		if (playing) {
			if (inFrame && timelinePosition < inFrame) {
				setInFrame(inFrame);
			} else if (outFrame && timelinePosition > outFrame) {
				setOutFrame(outFrame);
			}
		}
	}, [timelinePosition, playing, inFrame, outFrame, setInFrame, setOutFrame]);

	if (!videoConfig) {
		return null;
	}

	const getLeft = (frame: number) =>
		(frame / (videoConfig.durationInFrames - 1)) *
			(width - TIMELINE_PADDING * 2) +
		TIMELINE_PADDING;

	return (
		<>
			{(inFrame !== null || outFrame !== null) && (
				<div
					style={{
						...areaHighlight,
						left: getLeft(inFrame ?? 0),
						width:
							getLeft(outFrame ?? videoConfig.durationInFrames - 1) -
							getLeft(inFrame ?? 0),
					}}
				/>
			)}
			{inFrame !== null && (
				<div
					style={{
						...container,
						transform: `translateX(${getLeft(inFrame)}px)`,
					}}
				>
					<TimelineInPointerHandle />
				</div>
			)}
			{outFrame !== null && (
				<div
					style={{
						...container,
						transform: `translateX(${getLeft(outFrame)}px)`,
					}}
				>
					<TimelineOutPointerHandle />
				</div>
			)}
		</>
	);
};
