import React, {useCallback} from 'react';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineListItem} from './TimelineListItem';
import {useTimelineSelection} from './TimelineSelection';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const container: React.CSSProperties = {
	flex: 1,
	background: BACKGROUND,
};

export const TimelineList: React.FC<{
	readonly timeline: TrackWithHash[];
}> = ({timeline}) => {
	const {clearSelection} = useTimelineSelection();

	// Selection-triggering click handlers in children call e.stopPropagation(),
	// so any pointerdown that bubbles up here is by definition on empty space
	// and should clear the current selection.
	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			clearSelection();
		},
		[clearSelection],
	);

	return (
		<div style={container} onPointerDown={onPointerDown}>
			<TimelineTimePadding />
			{timeline.map((track) => {
				return (
					<div key={track.sequence.id}>
						<TimelineListItem
							key={track.sequence.id}
							nestedDepth={track.depth}
							sequence={track.sequence}
							nodePathInfo={track.nodePathInfo}
						/>
					</div>
				);
			})}
		</div>
	);
};
