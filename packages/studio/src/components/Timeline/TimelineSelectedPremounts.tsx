import React, {useContext} from 'react';
import {Internals} from 'remotion';
import {getStudioShowPremounting} from '../../helpers/studio-runtime-config';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {timelinePremountStyle} from './timeline-premount-style';
import {
	TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
	TIMELINE_PACKED_TRACK_HEIGHT,
} from './timeline-track-groups';
import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from './TimelineSelection';
import {TimelineViewportContext} from './TimelineViewport';
import {useTimelineVirtualization} from './TimelineVirtualization';
import {TimelineWidthContext} from './TimelineWidthProvider';

const ActiveTimelineSelectedPremounts: React.FC<{
	readonly selectedItems: readonly TimelineSelection[];
}> = ({selectedItems}) => {
	const {rows, virtualItems} = useTimelineVirtualization();
	const video = Internals.useUnsafeVideoConfig();
	const windowWidth = useContext(TimelineWidthContext);
	const renderWindow = useContext(TimelineViewportContext);
	if (video === null || windowWidth === null || renderWindow === null) {
		return null;
	}

	const selectedKeys = new Set(
		selectedItems.flatMap((item) =>
			item.type === 'sequence-prop' && item.key === 'premountFor'
				? [getTimelineSequenceSelectionKey(item.nodePathInfo)]
				: [],
		),
	);
	const frameIncrement =
		(windowWidth - TIMELINE_PADDING * 2) / video.durationInFrames;
	const showPremounting = getStudioShowPremounting();
	const indicators: React.ReactNode[] = [];
	for (const virtualItem of virtualItems) {
		const row = rows[virtualItem.index];
		for (const track of row.items ?? [row.track]) {
			const {sequence, nodePathInfo} = track;
			if (
				nodePathInfo === null ||
				!selectedKeys.has(getTimelineSequenceSelectionKey(nodePathInfo)) ||
				!sequence.premountDisplay
			) {
				continue;
			}

			// With the setting enabled, ordinary bars already paint the part
			// inside their scene. Only draw the missing region before that scene.
			const end =
				!sequence.timelineTrack && showPremounting
					? Math.min(sequence.from, row.sceneRange?.from ?? -Infinity)
					: sequence.from;
			const left = Math.max(
				0,
				(sequence.from - sequence.premountDisplay) * frameIncrement,
				renderWindow.left - TIMELINE_PADDING,
			);
			const right = Math.min(
				end * frameIncrement,
				renderWindow.left - TIMELINE_PADDING + renderWindow.width,
			);
			if (right <= left) {
				continue;
			}

			const auxiliaryIndex = row.auxiliaryRows.findIndex((items) =>
				items.some((item) => item.sequence.id === sequence.id),
			);
			const top =
				virtualItem.start +
				(auxiliaryIndex === -1 ? 0 : row.auxiliaryRowOffsets[auxiliaryIndex]);
			const height =
				sequence.timelineTrack?.role === 'overlay'
					? TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT - TIMELINE_ITEM_BORDER_BOTTOM
					: sequence.timelineTrack
						? TIMELINE_PACKED_TRACK_HEIGHT
						: getTimelineLayerHeight(sequence.type);
			indicators.push(
				<div
					key={sequence.id}
					aria-hidden="true"
					style={{
						...timelinePremountStyle,
						top,
						left: TIMELINE_PADDING + left,
						width: right - left,
						height,
						pointerEvents: 'none',
						zIndex: 1,
					}}
				/>,
			);
		}
	}

	return indicators;
};

export const TimelineSelectedPremounts: React.FC = () => {
	const {selectedItems} = useTimelineSelection();
	if (
		!selectedItems.some(
			(item) => item.type === 'sequence-prop' && item.key === 'premountFor',
		)
	) {
		return null;
	}

	return <ActiveTimelineSelectedPremounts selectedItems={selectedItems} />;
};
