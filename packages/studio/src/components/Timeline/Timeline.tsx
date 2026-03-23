import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getExpandedTrackHeight,
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {ExpandedTracksContext} from '../ExpandedTracksProvider';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {isTrackHidden} from './is-collapsed';
import {
	MAX_TIMELINE_TRACKS,
	MAX_TIMELINE_TRACKS_NOTICE_HEIGHT,
} from './MaxTimelineTracks';
import {timelineVerticalScroll} from './timeline-refs';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineInOutPointer} from './TimelineInOutPointer';
import {TimelineList} from './TimelineList';
import {TimelinePlayCursorSyncer} from './TimelinePlayCursorSyncer';
import {TimelineScrollable} from './TimelineScrollable';
import {TimelineSlider} from './TimelineSlider';
import {
	TIMELINE_TIME_INDICATOR_HEIGHT,
	TimelineTimeIndicators,
	TimelineTimePlaceholders,
} from './TimelineTimeIndicators';
import {TimelineTracks} from './TimelineTracks';
import {TimelineWidthProvider} from './TimelineWidthProvider';

const container: React.CSSProperties = {
	minHeight: '100%',
	flex: 1,
	display: 'flex',
	height: 0,
	overflowY: 'auto',
	backgroundColor: BACKGROUND,
};

const noop = () => undefined;

const TimelineInner: React.FC = () => {
	const {sequences} = useContext(Internals.SequenceManager);
	const {expandedTracks} = useContext(ExpandedTracksContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const visualModeEnabled =
		Boolean(process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED) &&
		previewServerState.type === 'connected';
	const videoConfig = Internals.useUnsafeVideoConfig();

	const timeline = useMemo((): TrackWithHash[] => {
		if (!videoConfig) {
			return [];
		}

		return calculateTimeline({
			sequences,
			sequenceDuration: videoConfig.durationInFrames,
		});
	}, [sequences, videoConfig]);

	const durationInFrames = videoConfig?.durationInFrames ?? 0;

	const filtered = useMemo(() => {
		const withoutHidden = timeline.filter((t) => !isTrackHidden(t));

		const withoutAfter = withoutHidden.filter((t) => {
			return t.sequence.from <= durationInFrames && t.sequence.duration > 0;
		});

		return withoutAfter.filter((t) => t.sequence.showInTimeline);
	}, [durationInFrames, timeline]);

	const shown = filtered.slice(0, MAX_TIMELINE_TRACKS);
	const hasBeenCut = filtered.length > shown.length;

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height:
				shown.reduce((acc, track) => {
					const isExpanded =
						visualModeEnabled && (expandedTracks[track.sequence.id] ?? false);
					return (
						acc +
						getTimelineLayerHeight(
							track.sequence.type === 'video' ? 'video' : 'other',
						) +
						Number(TIMELINE_ITEM_BORDER_BOTTOM) +
						(isExpanded
							? getExpandedTrackHeight(track.sequence.controls) +
								TIMELINE_ITEM_BORDER_BOTTOM
							: 0)
					);
				}, 0) +
				TIMELINE_ITEM_BORDER_BOTTOM +
				(hasBeenCut ? MAX_TIMELINE_TRACKS_NOTICE_HEIGHT : 0) +
				TIMELINE_TIME_INDICATOR_HEIGHT,
			display: 'flex',
			flex: 1,
			minHeight: '100%',
			overflowX: 'hidden',
		};
	}, [hasBeenCut, shown, expandedTracks, visualModeEnabled]);

	return (
		<div
			ref={timelineVerticalScroll}
			style={container}
			className={'css-reset ' + VERTICAL_SCROLLBAR_CLASSNAME}
		>
			<TimelineWidthProvider>
				<div style={inner}>
					<SplitterContainer
						orientation="vertical"
						defaultFlex={0.2}
						id="names-to-timeline"
						maxFlex={0.5}
						minFlex={0.15}
					>
						<SplitterElement
							type="flexer"
							sticky={<TimelineTimePlaceholders />}
						>
							<TimelineList timeline={shown} />
						</SplitterElement>
						<SplitterHandle onCollapse={noop} allowToCollapse="none" />
						<SplitterElement type="anti-flexer" sticky={null}>
							<TimelineScrollable>
								<TimelineTracks timeline={shown} hasBeenCut={hasBeenCut} />
								<TimelineInOutPointer />
								<TimelinePlayCursorSyncer />
								<TimelineDragHandler />
								<TimelineTimeIndicators />
								<TimelineSlider />
							</TimelineScrollable>
						</SplitterElement>
					</SplitterContainer>
				</div>
			</TimelineWidthProvider>
		</div>
	);
};

export const Timeline = React.memo(TimelineInner);
