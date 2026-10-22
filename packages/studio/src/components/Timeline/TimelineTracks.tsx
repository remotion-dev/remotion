import React, {useContext, useImperativeHandle, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {
	getTimelineSceneClipPath,
	TIMELINE_CHILD_TRANSITION_SEAM_Y,
} from './get-timeline-scene-clip-path';
import {MaxTimelineTracksReached} from './MaxTimelineTracks';
import {timelineDurationRef, timelineLayerLayoutsRef} from './timeline-refs';
import type {TimelineSceneRange} from './timeline-series-layout';
import {getTimelineSequenceHeight} from './timeline-track-groups';
import {TimelineExpandedTrackKeyframes} from './TimelineExpandedTrackKeyframes';
import {TimelinePackedTrack} from './TimelinePackedTrack';
import {
	TimelineInheritedSceneRangeContext,
	TimelineSceneClipHeightContext,
	TimelineSceneRangeContext,
} from './TimelineSceneRangeContext';
import {TimelineTrack} from './TimelineTrack';
import {TimelineTrimOutlineContainer} from './TimelineTrimOutline';
import {TimelineViewportContext} from './TimelineViewport';
import {
	type TimelineVirtualRow,
	useTimelineVirtualization,
} from './TimelineVirtualization';
import {TimelineWidthContext} from './TimelineWidthProvider';

const content: React.CSSProperties = {
	paddingLeft: TIMELINE_PADDING,
	paddingRight: TIMELINE_PADDING,
	position: 'relative',
	// Keep trim handles below the pinned ruler and its scrubbing target.
	isolation: 'isolate',
};

const timelineContent: React.CSSProperties = {
	minHeight: '100%',
};

// Keep the frame subscription here so the track contents do not rerender
// just to follow their scene's label visibility.
const TimelineSceneTrackContent: React.FC<{
	readonly children: React.ReactNode;
	readonly sceneRange: TimelineSceneRange;
	readonly height: number;
}> = React.memo(({children, sceneRange, height}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	const active = frame >= sceneRange.activeFrom && frame < sceneRange.activeEnd;
	return (
		<TimelineSceneClipHeightContext.Provider value={height}>
			<TimelineInheritedSceneRangeContext.Provider value={sceneRange}>
				<TimelineSceneRangeContext.Provider value={sceneRange}>
					<div style={{opacity: active ? 1 : 0.5}}>{children}</div>
				</TimelineSceneRangeContext.Provider>
			</TimelineInheritedSceneRangeContext.Provider>
		</TimelineSceneClipHeightContext.Provider>
	);
});

// Row styles and children must be created inside the memo boundary so a
// different clip changing does not rerender this row's outline and contents.
const TimelineTrackRow: React.FC<{
	readonly row: TimelineVirtualRow;
	readonly start: number;
	readonly height: number;
}> = React.memo(({row, start, height}) => {
	const {sceneRange, track, items, auxiliaryRows, auxiliaryRowOffsets} = row;
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const showExpandedKeyframes =
		items === null &&
		track.nodePathInfo !== null &&
		previewServerState.type === 'connected' &&
		getIsExpanded(track.nodePathInfo);
	const clippedHeight =
		items === null
			? getTimelineSequenceHeight(track.sequence) + TIMELINE_ITEM_BORDER_BOTTOM
			: height;
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
		<TimelineTrackRowLayout
			sceneRange={sceneRange}
			start={start}
			height={height}
			clippedHeight={clippedHeight}
			keyframes={
				showExpandedKeyframes && track.nodePathInfo ? (
					<TimelineExpandedTrackKeyframes
						sequence={track.sequence}
						nodePathInfo={track.nodePathInfo}
						keyframeDisplayOffset={track.keyframeDisplayOffset}
						keyframePlaybackRate={track.keyframePlaybackRate}
					/>
				) : null
			}
		>
			{sceneRange === null ? (
				trackContent
			) : (
				<TimelineSceneTrackContent
					sceneRange={sceneRange}
					height={clippedHeight}
				>
					{trackContent}
				</TimelineSceneTrackContent>
			)}
		</TimelineTrackRowLayout>
	);
});

// Only horizontal geometry subscribes to width; track contents stay stable.
const TimelineTrackRowLayout: React.FC<{
	readonly sceneRange: TimelineSceneRange | null;
	readonly start: number;
	readonly height: number;
	readonly clippedHeight: number;
	readonly children: React.ReactNode;
	readonly keyframes: React.ReactNode;
}> = ({sceneRange, start, height, clippedHeight, children, keyframes}) => {
	const windowWidth = useContext(TimelineWidthContext);
	const video = Internals.useUnsafeVideoConfig();
	const durationInFrames = video?.durationInFrames ?? null;
	return (
		<div
			style={{
				height,
				left: TIMELINE_PADDING,
				position: 'absolute',
				right: TIMELINE_PADDING,
				// Sequence bars use the full zoomed timeline width, while this
				// row's parent only fills the viewport. Clip in the same space.
				width:
					sceneRange !== null && windowWidth !== null
						? windowWidth - TIMELINE_PADDING * 2
						: undefined,
				top: start,
				pointerEvents: 'none',
			}}
		>
			<TimelineTrimOutlineContainer
				style={{height: clippedHeight, position: 'relative'}}
				clipPath={
					durationInFrames !== null && windowWidth !== null
						? (getTimelineSceneClipPath({
								sceneRange,
								durationInFrames,
								offsetInFrames: 0,
								pixelsPerFrame:
									(windowWidth - TIMELINE_PADDING * 2) / durationInFrames,
								height: clippedHeight,
								seamY: TIMELINE_CHILD_TRANSITION_SEAM_Y,
								transitionCutout: null,
								cropHeight: null,
							}) ?? null)
						: null
				}
			>
				{children}
			</TimelineTrimOutlineContainer>
			{keyframes}
		</div>
	);
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
		<div style={timelineStyle}>
			<div style={{...content, height: tracksEnd}}>
				{virtualItems.map((virtualItem) => (
					<TimelineTrackRow
						key={virtualItem.key}
						row={rows[virtualItem.index]}
						start={virtualItem.start}
						height={virtualItem.size}
					/>
				))}
			</div>
			{hasBeenCut ? <MaxTimelineTracksReached /> : null}
		</div>
	);
};

export const TimelineTracks = React.memo(TimelineTracksInner);
