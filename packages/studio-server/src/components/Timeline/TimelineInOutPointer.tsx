import React, {createRef, useContext} from 'react';
import {Internals} from 'remotion';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {useTimelineInOutFramePosition} from '../../state/in-out';
import {TimelineWidthContext} from './TimelineWidthProvider';

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
	const timelineWidth = useContext(TimelineWidthContext);

	if (!videoConfig || timelineWidth === null) {
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
						width: getXPositionOfItemInTimelineImperatively(
							inFrame,
							videoConfig.durationInFrames,
							timelineWidth,
						),
					}}
				/>
			)}

			{outFrame !== null && (
				<div
					ref={outMarkerAreaRef}
					style={{
						...areaHighlight,
						left: getXPositionOfItemInTimelineImperatively(
							outFrame,
							videoConfig.durationInFrames,
							timelineWidth,
						),
						width:
							timelineWidth -
							getXPositionOfItemInTimelineImperatively(
								outFrame,
								videoConfig.durationInFrames,
								timelineWidth,
							),
					}}
				/>
			)}
		</>
	);
};
