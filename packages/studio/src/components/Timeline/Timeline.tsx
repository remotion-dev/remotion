import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {isTrackHidden} from './is-collapsed';
import {MAX_TIMELINE_TRACKS} from './MaxTimelineTracks';
import {SubscribeToNodePaths} from './SubscribeToNodePaths';
import {timelineVerticalScroll} from './timeline-refs';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineHeightContainer} from './TimelineHeightContainer';
import {TimelineInOutPointer} from './TimelineInOutPointer';
import {TimelineList} from './TimelineList';
import {TimelinePinchZoom} from './TimelinePinchZoom';
import {TimelinePlayCursorSyncer} from './TimelinePlayCursorSyncer';
import {TimelineScrollable} from './TimelineScrollable';
import {TimelineSlider} from './TimelineSlider';
import {
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
	const videoConfig = Internals.useUnsafeVideoConfig();
	const videoConfigIsNull = videoConfig === null;

	const timeline = useMemo((): TrackWithHash[] => {
		if (videoConfigIsNull) {
			return [];
		}

		return calculateTimeline({
			sequences,
		});
	}, [sequences, videoConfigIsNull]);

	const durationInFrames = videoConfig?.durationInFrames ?? 0;

	const filtered = useMemo(() => {
		return timeline.filter(
			(t) =>
				!isTrackHidden(t) &&
				t.sequence.from <= durationInFrames &&
				t.sequence.duration > 0 &&
				t.sequence.showInTimeline,
		);
	}, [durationInFrames, timeline]);

	const shown = filtered.slice(0, MAX_TIMELINE_TRACKS);
	const hasBeenCut = filtered.length > shown.length;

	return (
		<div
			ref={timelineVerticalScroll}
			style={container}
			className={'css-reset ' + VERTICAL_SCROLLBAR_CLASSNAME}
		>
			{sequences.map((sequence) => (
				<SubscribeToNodePaths key={sequence.id} sequence={sequence} />
			))}
			<TimelineWidthProvider>
				<TimelinePinchZoom />
				<TimelineHeightContainer shown={shown} hasBeenCut={hasBeenCut}>
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
				</TimelineHeightContainer>
			</TimelineWidthProvider>
		</div>
	);
};

export const Timeline = React.memo(TimelineInner);
