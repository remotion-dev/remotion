import {PlayerInternals} from '@remotion/player';
import React, {useRef} from 'react';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TimelineListItem} from './TimelineListItem';
import {TimelineTimePadding} from './TimelineTimeIndicators';

const container: React.CSSProperties = {
	flex: 1,
	background: BACKGROUND,
};

export const TimelineList: React.FC<{
	readonly timeline: TrackWithHash[];
}> = ({timeline}) => {
	const ref = useRef<HTMLDivElement>(null);
	const size = PlayerInternals.useElementSize(ref, {
		shouldApplyCssTransforms: false,
		triggerOnWindowResize: false,
	});

	const isCompact = size ? size.width < 250 : false;

	return (
		<div ref={ref} style={container}>
			<TimelineTimePadding />
			{timeline.map((track) => {
				return (
					<div key={track.sequence.id}>
						<TimelineListItem
							key={track.sequence.id}
							nestedDepth={track.depth}
							sequence={track.sequence}
							isCompact={isCompact}
						/>
					</div>
				);
			})}
		</div>
	);
};
