import React, {createRef, useContext} from 'react';
import {Internals} from 'remotion';
import {BLACK_ALPHA_50} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import {useTimelineInOutFramePosition} from '../../state/in-out';
import {TimelineWidthContext} from './TimelineWidthProvider';

const areaHighlight: React.CSSProperties = {
	position: 'absolute',
	backgroundColor: BLACK_ALPHA_50,
	height: '100%',
	bottom: 0,
	top: 0,
	pointerEvents: 'none',
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
								videoConfig.durationInFrames + 1, // last frame also has width of 1 frame
								timelineWidth,
							),
					}}
				/>
			)}
		</>
	);
};
