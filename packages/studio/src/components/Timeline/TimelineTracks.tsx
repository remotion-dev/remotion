import React, {useContext, useImperativeHandle, useMemo} from 'react';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {timelineDurationRef, timelineLayerLayoutsRef} from './timeline-refs';
import {TimelineTrack} from './TimelineTrack';
import {TimelineViewportContext} from './TimelineViewport';
import {useTimelineVirtualization} from './TimelineVirtualization';
import {TimelineWidthContext} from './TimelineWidthProvider';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
	position: 'relative',
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

const TimelineTracksInner: React.FC<{
	readonly hasBeenCut: boolean;
}> = ({hasBeenCut}) => {
	const {rows, tracksEnd, virtualItems} = useTimelineVirtualization();
	const windowWidth = useContext(TimelineWidthContext);
	const renderWindow = useContext(TimelineViewportContext);
	useImperativeHandle(timelineDurationRef, () => ({
		getDuration: (durationInFrames) => {
			// Only calculate when the duration dropdown asks for it. Incomplete
			// rendered rows or a cropped window may hide a later visual endpoint.
			if (
				hasBeenCut ||
				virtualItems.length !== rows.length ||
				windowWidth === null ||
				windowWidth <= TIMELINE_PADDING * 2 ||
				renderWindow === null ||
				renderWindow.left !== 0 ||
				renderWindow.width < windowWidth
			) {
				return null;
			}

			let end = 0;
			for (const layer of timelineLayerLayoutsRef.current.values()) {
				if (layer.media === null || layer.media.width <= 0) {
					continue;
				}

				end = Math.max(
					end,
					layer.marginLeft + layer.media.left + layer.media.width,
				);
			}

			const frames =
				(end / (windowWidth - TIMELINE_PADDING * 2)) * durationInFrames;
			const rounded = Math.round(frames);
			const duration =
				Math.abs(frames - rounded) < 0.001 ? rounded : Math.ceil(frames);
			// A bar at the composition boundary may be clipped or unlimited.
			return Number.isFinite(duration) &&
				duration > 0 &&
				duration < durationInFrames
				? duration
				: null;
		},
	}));
	const timelineStyle: React.CSSProperties = useMemo(() => {
		return {
			...timelineContent,
			width: 100 + '%',
		};
	}, []);

	return (
		<div style={timelineStyle} {...{'oai-annotation-container': ''}}>
			<div style={{...content, height: tracksEnd}}>
				{virtualItems.map((virtualItem) => (
					<div
						key={virtualItem.key}
						style={{
							height: virtualItem.size,
							left: TIMELINE_PADDING,
							position: 'absolute',
							right: TIMELINE_PADDING,
							top: virtualItem.start,
						}}
					>
						<TimelineTrack track={rows[virtualItem.index].track} />
					</div>
				))}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};

export const TimelineTracks = React.memo(TimelineTracksInner);
