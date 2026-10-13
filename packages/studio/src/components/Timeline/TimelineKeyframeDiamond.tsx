import React, {useContext, useMemo, useRef} from 'react';
import {useVideoConfig} from 'remotion';
import {BLACK_ALPHA_40, BLUE, LIGHT_TEXT} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import type {TimelineCanvasDraw} from './TimelineCanvas';
import {useTimelineCanvasDrawing} from './TimelineCanvas';
import {useTimelineKeyframeDragState} from './TimelineKeyframeDragState';
import {
	TIMELINE_MARQUEE_ITEM_ATTR,
	useTimelineKeyframeSelection,
	useTimelineMarqueeSelectableItem,
} from './TimelineSelection';
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
	const ref = useRef<HTMLButtonElement>(null);
	const {selected, onSelect, selectable, selectionItem} =
		useTimelineKeyframeSelection(nodePathInfo, frame);
	useTimelineMarqueeSelectableItem(selectionItem, ref, null);
	const {isKeyframeDragging} = useTimelineKeyframeDragState();
	const visuallySelected =
		selected || isKeyframeDragging({nodePathInfo, frame});

	const style = useMemo((): React.CSSProperties | null => {
		if (timelineWidth === null) {
			return null;
		}

		return {
			...diamondBase,
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
	const drawing = useMemo<TimelineCanvasDraw>(
		() => ({
			onScroll: false,
			revision: visuallySelected,
			draw: (graphics, width, height, resolveColor) => {
				if (visuallySelected) {
					graphics
						.poly([
							width / 2,
							height / 16,
							(width * 15) / 16,
							height / 2,
							width / 2,
							(height * 15) / 16,
							width / 16,
							height / 2,
						])
						.stroke({color: resolveColor(BLUE), width: 1.5, join: 'round'});
				}

				graphics
					.poly([
						width / 2,
						height / 8,
						(width * 7) / 8,
						height / 2,
						width / 2,
						(height * 7) / 8,
						width / 8,
						height / 2,
					])
					.fill(resolveColor(LIGHT_TEXT))
					.stroke({
						color: resolveColor(BLACK_ALPHA_40),
						width: 1,
						join: 'round',
					});
			},
		}),
		[visuallySelected],
	);
	useTimelineCanvasDrawing(ref, style === null ? null : drawing);

	if (style === null) {
		return null;
	}

	return (
		<button
			ref={ref}
			{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
			type="button"
			style={style}
			aria-label={`Select keyframe at frame ${frame}`}
			onPointerDown={selectable ? onPointerDown : undefined}
		/>
	);
};

export const TimelineKeyframeDiamond = React.memo(
	TimelineKeyframeDiamondUnmemoized,
);
