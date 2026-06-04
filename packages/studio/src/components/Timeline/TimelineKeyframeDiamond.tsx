import React, {useContext, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {LIGHT_TEXT} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {TimelineKeyframeDiamondIcon} from './TimelineKeyframeDiamondIcon';
import {useTimelineKeyframeDragState} from './TimelineKeyframeDragState';
import {useTimelineKeyframeSelection} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {useTimelineKeyframeDrag} from './use-timeline-keyframe-drag';

const diamondSize = 12;

const diamondBase: React.CSSProperties = {
	alignItems: 'center',
	background: 'none',
	border: 'none',
	display: 'flex',
	height: diamondSize,
	justifyContent: 'center',
	padding: 0,
	position: 'absolute',
	width: diamondSize,
};

const TimelineKeyframeDiamondUnmemoized: React.FC<{
	readonly frame: number;
	readonly rowHeight: number;
	readonly nodePathInfo: SequenceNodePathInfo;
}> = ({frame, rowHeight, nodePathInfo}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {selected, onSelect, selectable} = useTimelineKeyframeSelection(
		nodePathInfo,
		frame,
	);
	const {isKeyframeDragging} = useTimelineKeyframeDragState();
	const visuallySelected =
		selected || isKeyframeDragging({nodePathInfo, frame});

	const style = useMemo((): React.CSSProperties | null => {
		if (timelineWidth === null) {
			return null;
		}

		return {
			...diamondBase,
			cursor: 'pointer',
			left:
				getXPositionOfItemInTimelineImperatively(
					frame,
					videoConfig.durationInFrames,
					timelineWidth,
				) - TIMELINE_PADDING,
			pointerEvents: 'auto',
			top: rowHeight / 2,
			transform: 'translate(-50%, -50%)',
		};
	}, [frame, rowHeight, timelineWidth, videoConfig.durationInFrames]);

	const onPointerDown = useTimelineKeyframeDrag({
		frame,
		nodePathInfo,
		onSelect,
		selectable,
		selected,
	});

	if (style === null) {
		return null;
	}

	return (
		<button
			type="button"
			style={style}
			title={`Keyframe at frame ${frame}`}
			aria-label={`Select keyframe at frame ${frame}`}
			onPointerDown={selectable ? onPointerDown : undefined}
		>
			<TimelineKeyframeDiamondIcon
				color={LIGHT_TEXT}
				selected={visuallySelected}
				size={diamondSize}
			/>
		</button>
	);
};

export const TimelineKeyframeDiamond = React.memo(
	TimelineKeyframeDiamondUnmemoized,
);
