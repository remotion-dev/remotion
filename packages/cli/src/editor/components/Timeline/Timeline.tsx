import React, {
	useContext,
	useImperativeHandle,
	useMemo,
	useReducer,
} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	TIMELINE_BORDER,
	TIMELINE_LAYER_HEIGHT,
} from '../../helpers/timeline-layout';
import {timelineRef} from '../../state/timeline-ref';
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
import {timelineStateReducer} from './timeline-state-reducer';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineInOutPointer} from './TimelineInOutPointer';
import {TimelineList} from './TimelineList';
import {TimelinePlayCursorSyncer} from './TimelinePlayCursorSyncer';
import {TimelineScrollable} from './TimelineScrollable';
import {TimelineSlider} from './TimelineSlider';
import {TIMELINE_TIME_INDICATOR_HEIGHT} from './TimelineTimeIndicators';
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

export const Timeline: React.FC = () => {
	const {sequences} = useContext(Internals.SequenceManager);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const [state, dispatch] = useReducer(timelineStateReducer, {
		collapsed: {},
	});

	const timeline = useMemo((): TrackWithHash[] => {
		if (!videoConfig) {
			return [];
		}

		return calculateTimeline({
			sequences,
			sequenceDuration: videoConfig.durationInFrames,
		});
	}, [sequences, videoConfig]);

	useImperativeHandle(
		timelineRef,
		() => {
			return {
				expandAll: () => {
					dispatch({
						type: 'expand-all',
						allHashes: timeline.map((t) => t.hash),
					});
				},
				collapseAll: () => {
					dispatch({
						type: 'collapse-all',
						allHashes: timeline.map((t) => t.hash),
					});
				},
			};
		},
		[timeline]
	);

	const durationInFrames = videoConfig?.durationInFrames ?? 0;

	const filtered = useMemo(() => {
		const withoutHidden = timeline.filter(
			(t) => !isTrackHidden(t, timeline, state)
		);

		const withoutAfter = withoutHidden.filter((t) => {
			return t.sequence.from <= durationInFrames && t.sequence.duration > 0;
		});

		return withoutAfter;
	}, [durationInFrames, state, timeline]);

	const shown = filtered.slice(0, MAX_TIMELINE_TRACKS);
	const hasBeenCut = filtered.length > shown.length;

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height:
				shown.length * (TIMELINE_LAYER_HEIGHT + TIMELINE_BORDER * 2) +
				(hasBeenCut ? MAX_TIMELINE_TRACKS_NOTICE_HEIGHT : 0) +
				TIMELINE_TIME_INDICATOR_HEIGHT,
			display: 'flex',
			flex: 1,
			minHeight: '100%',
			overflowX: 'hidden',
		};
	}, [hasBeenCut, shown.length]);

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
						<SplitterElement type="flexer">
							<TimelineList
								dispatchStateChange={dispatch}
								viewState={state}
								timeline={shown}
							/>
						</SplitterElement>
						<SplitterHandle onCollapse={noop} allowToCollapse="none" />
						<SplitterElement type="anti-flexer">
							<TimelineScrollable>
								<TimelineTracks
									viewState={state}
									timeline={shown}
									hasBeenCut={hasBeenCut}
								/>
								<TimelineInOutPointer />
								<TimelineDragHandler />
								<TimelineSlider />
								<TimelinePlayCursorSyncer />
							</TimelineScrollable>
						</SplitterElement>
					</SplitterContainer>
				</div>
			</TimelineWidthProvider>
		</div>
	);
};
