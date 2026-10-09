import React, {useContext, useImperativeHandle, useMemo} from 'react';
import {Internals} from 'remotion';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {getTimelineSceneMask} from './get-timeline-scene-mask';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {timelineDurationRef, timelineLayerLayoutsRef} from './timeline-refs';
import type {TimelineSceneRange} from './timeline-series-layout';
import {TimelinePackedTrack} from './TimelinePackedTrack';
import {TimelineSceneRangeContext} from './TimelineSceneRangeContext';
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

// Keep the frame subscription here so the track contents do not rerender
// just to follow their scene's label visibility.
const TimelineSceneTrackContent: React.FC<{
	readonly children: React.ReactNode;
	readonly sceneRange: TimelineSceneRange;
}> = React.memo(({children, sceneRange}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const active = frame >= sceneRange.from && frame < sceneRange.end;
	return (
		<TimelineSceneRangeContext.Provider value={sceneRange}>
			<div style={{opacity: active ? 1 : 0.5}}>{children}</div>
		</TimelineSceneRangeContext.Provider>
	);
});

const TimelineTracksInner: React.FC<{
	readonly hasBeenCut: boolean;
}> = ({hasBeenCut}) => {
	const {rows, tracksEnd, virtualItems} = useTimelineVirtualization();
	const video = Internals.useUnsafeVideoConfig();
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
				{virtualItems.map((virtualItem) => {
					const {sceneRange, track, items, auxiliaryRows, auxiliaryRowOffsets} =
						rows[virtualItem.index];
					const trackContent =
						items === null ? (
							<TimelineTrack track={track} />
						) : (
							<TimelinePackedTrack
								track={track}
								items={items}
								auxiliaryRows={auxiliaryRows}
								auxiliaryRowOffsets={auxiliaryRowOffsets}
							/>
						);

					return (
						<div
							key={virtualItem.key}
							style={{
								height: virtualItem.size,
								left: TIMELINE_PADDING,
								position: 'absolute',
								right: TIMELINE_PADDING,
								// Sequence bars use the full zoomed timeline width, while this
								// row's parent only fills the viewport. Clip in the same space.
								width:
									sceneRange !== null && windowWidth !== null
										? windowWidth - TIMELINE_PADDING * 2
										: undefined,
								top: virtualItem.start,
								// Fade the shared rows on either side of the transition midpoint.
								maskImage: video
									? getTimelineSceneMask({
											sceneRange,
											durationInFrames: video.durationInFrames,
											offsetInFrames: 0,
										})
									: undefined,
								clipPath:
									sceneRange === null || !video
										? undefined
										: `inset(0 ${Math.max(0, 100 - (sceneRange.end / video.durationInFrames) * 100)}% 0 ${Math.max(0, (sceneRange.from / video.durationInFrames) * 100)}%)`,
							}}
						>
							{sceneRange === null ? (
								trackContent
							) : (
								<TimelineSceneTrackContent sceneRange={sceneRange}>
									{trackContent}
								</TimelineSceneTrackContent>
							)}
						</div>
					);
				})}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};

export const TimelineTracks = React.memo(TimelineTracksInner);
