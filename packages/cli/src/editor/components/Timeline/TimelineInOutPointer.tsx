import React, {createRef} from 'react';
import {Internals} from 'remotion';
import {useGetXPositionOfItemInTimeline} from '../../helpers/get-left-of-timeline-slider';
import {useTimelineInOutFramePosition} from '../../state/in-out';

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
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {get, width} = useGetXPositionOfItemInTimeline();

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
