import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {WHITE} from '../../helpers/colors';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';
import {TIMELINE_PACKED_TRACK_HEIGHT} from './timeline-track-groups';
import {TimelineSequence} from './TimelineSequence';
import {TimelineWidthContext} from './TimelineWidthProvider';

const noConnectedCompositions = [] as const;

export const TimelinePackedTrack: React.FC<{
	readonly track: TimelineTrackWithDisplayGroup;
	readonly items: readonly TimelineTrackWithDisplayGroup[];
}> = ({track, items}) => {
	const width = useContext(TimelineWidthContext);
	const video = Internals.useVideo();
	const ordered = useMemo(() => {
		const clips = items.filter(
			(item) => item.sequence.timelineTrack?.role === 'clip',
		);
		const effects = items.filter(
			(item) => item.sequence.timelineTrack?.role !== 'clip',
		);
		return [...clips, ...effects];
	}, [items]);

	return (
		<div
			data-timeline-track={track.sequence.displayName}
			style={{height: TIMELINE_PACKED_TRACK_HEIGHT, position: 'relative'}}
		>
			{ordered.map((item) => (
				<TimelineSequence
					key={item.sequence.id}
					s={item.sequence}
					cascadedStart={item.cascadedStart}
					localStart={item.localStart}
					connectedCompositions={
						item.connectedCompositions ?? noConnectedCompositions
					}
					nodePathInfo={item.nodePathInfo}
					keyframeDisplayOffset={item.keyframeDisplayOffset}
					keyframePlaybackRate={item.keyframePlaybackRate}
					sequenceFrameOffset={item.sequenceFrameOffset}
				/>
			))}
			{width === null || video === null
				? null
				: items.map((item) => {
						const anchor = item.sequence.timelineTrack?.anchor ?? null;
						if (anchor === null) {
							return null;
						}

						const frame =
							item.cascadedStart +
							(anchor - item.localStart) / item.keyframePlaybackRate;
						if (
							frame < track.sequence.from ||
							frame > track.sequence.from + track.sequence.duration
						) {
							return null;
						}

						return (
							<div
								key={`anchor-${item.sequence.id}`}
								aria-hidden="true"
								style={{
									position: 'absolute',
									left:
										(frame / video.durationInFrames) *
										(width - TIMELINE_PADDING * 2),
									top: 0,
									height: TIMELINE_PACKED_TRACK_HEIGHT,
									borderLeft: `1px solid ${WHITE}`,
									pointerEvents: 'none',
								}}
							/>
						);
					})}
		</div>
	);
};
