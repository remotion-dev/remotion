import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {
	BACKGROUND,
	LIGHT_TEXT,
	TIMELINE_TRACK_SEPARATOR,
	TRANSPARENT,
	WHITE,
} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';
import {TIMELINE_PACKED_TRACK_HEIGHT} from './timeline-track-groups';
import {
	getTimelineSelectionFromNodePathInfo,
	useTimelineSelection,
} from './TimelineSelection';
import {TimelineSequence} from './TimelineSequence';
import {TimelineWidthContext} from './TimelineWidthProvider';

const noConnectedCompositions = [] as const;

export const TimelinePackedTrackName: React.FC<{
	readonly items: readonly TimelineTrackWithDisplayGroup[];
}> = ({items}) => {
	const {canSelect, selectItem} = useTimelineSelection();
	const name = items[0].sequence.timelineTrack?.name ?? 'Track';

	return (
		<div
			style={{
				height: TIMELINE_PACKED_TRACK_HEIGHT + 1,
				borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
				display: 'flex',
				alignItems: 'center',
				padding: '0 8px',
			}}
		>
			<select
				aria-label={`Select an item in ${name}`}
				className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
				value=""
				onPointerDown={(event) => event.stopPropagation()}
				onChange={(event) => {
					const item = items.find(
						(candidate) => candidate.sequence.id === event.target.value,
					);
					const selection = getTimelineSelectionFromNodePathInfo(
						item?.nodePathInfo ?? null,
					);
					if (selection && canSelect) {
						selectItem(selection, undefined, undefined, {
							reveal: true,
							revealInInspector: true,
						});
					}
				}}
				style={{
					...hoverableStyle({
						idleBackground: TRANSPARENT,
						hoverBackground: TRANSPARENT,
						idleColor: LIGHT_TEXT,
						hoverColor: WHITE,
					}),
					border: 0,
					cursor: 'default',
					fontSize: 12,
					minWidth: 0,
					width: '100%',
				}}
			>
				<option
					value=""
					disabled
					style={{background: BACKGROUND, fontSize: 12}}
				>
					{name} · {items.length} items
				</option>
				{items.map((item) => (
					<option
						key={item.sequence.id}
						value={item.sequence.id}
						disabled={!canSelect || item.nodePathInfo === null}
						style={{background: BACKGROUND, color: WHITE, fontSize: 12}}
					>
						{item.sequence.displayName} ({Math.round(item.sequence.from)}–
						{Math.round(item.sequence.from + item.sequence.duration)})
					</option>
				))}
			</select>
		</div>
	);
};

export const TimelinePackedTrack: React.FC<{
	readonly items: readonly TimelineTrackWithDisplayGroup[];
}> = ({items}) => {
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
			data-timeline-track={items[0].sequence.timelineTrack?.name}
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
						if (frame < 0 || frame > video.durationInFrames) {
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
