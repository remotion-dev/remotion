import {PlayerInternals} from '@remotion/player';
import React, {createRef, useEffect} from 'react';
import {Internals} from 'remotion';
import {useGetXPositionOfItemInTimeline} from '../../helpers/get-left-of-timeline-slider';

const areaHighlight: React.CSSProperties = {
	position: 'absolute',
	backgroundColor: 'rgba(0, 0, 0, 0.5)',
	height: '100%',
	bottom: 0,
	top: 0,
};

export const inMarkerAreaRef = createRef<HTMLDivElement>();
export const outMarkerAreaRef = createRef<HTMLDivElement>();

export const TimelineInOutPointer: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {
		inFrame,
		outFrame,
	} = Internals.Timeline.useTimelineInOutFramePosition();
	const {
		setInAndOutFrames,
	} = Internals.Timeline.useTimelineSetInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {playing} = PlayerInternals.usePlayer();
	const {get, width} = useGetXPositionOfItemInTimeline();

	useEffect(() => {
		if (playing) {
			if (inFrame && timelinePosition < inFrame) {
				setInAndOutFrames((prev) => ({
					...prev,
					inFrame,
				}));
			} else if (outFrame && timelinePosition > outFrame) {
				setInAndOutFrames((prev) => ({
					...prev,
					outFrame,
				}));
			}
		}
	}, [timelinePosition, playing, inFrame, outFrame, setInAndOutFrames]);

	if (!videoConfig) {
		return null;
	}

	return (
		<>
			{inFrame !== null && (
				<div
					ref={inMarkerAreaRef}
					style={{
						...areaHighlight,
						left: 0,
						width: get(inFrame ?? 0),
					}}
				/>
			)}

			{outFrame !== null && (
				<div
					ref={outMarkerAreaRef}
					style={{
						...areaHighlight,
						left: get(outFrame),
						width: width - get(outFrame),
					}}
				/>
			)}
		</>
	);
};
