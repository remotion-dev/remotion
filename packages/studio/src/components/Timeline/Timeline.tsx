import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {MAX_TIMELINE_TRACKS} from './MaxTimelineTracks';
import {SequencePropsObserver} from './SequencePropsObserver';
import {shouldShowTrackInTimeline} from './should-show-track-in-timeline';
import {SubscribeToNodePaths} from './SubscribeToNodePaths';
import {timelineVerticalScroll} from './timeline-refs';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineHeightContainer} from './TimelineHeightContainer';
import {TimelineInOutDragHandler} from './TimelineInOutDragHandler';
import {TimelineInOutPointer} from './TimelineInOutPointer';
import {TimelineList} from './TimelineList';
import {TimelinePinchZoom} from './TimelinePinchZoom';
import {TimelinePlayCursorSyncer} from './TimelinePlayCursorSyncer';
import {TimelineScrollable} from './TimelineScrollable';
import {
	TimelineSelectAllKeybindings,
	useTimelineSelection,
} from './TimelineSelection';
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

const TimelineClearSelectionArea: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
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
		<div
			ref={timelineVerticalScroll}
			style={container}
			className={'css-reset ' + VERTICAL_SCROLLBAR_CLASSNAME}
			onPointerDown={onPointerDown}
		>
			{children}
		</div>
	);
};

const TimelineInner: React.FC = () => {
	const {sequences} = useContext(Internals.SequenceManager);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const isStill = useIsStill();
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);

	const {previewServerState} = useContext(StudioServerConnectionCtx);

	const previewConnected = previewServerState.type === 'connected';

	const videoConfigIsNull = videoConfig === null;

	const timeline = useMemo((): TrackWithHash[] => {
		if (videoConfigIsNull) {
			return [];
		}

		return calculateTimeline({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		});
	}, [sequences, videoConfigIsNull, overrideIdToNodePathMappings]);

	const durationInFrames = videoConfig?.durationInFrames ?? 0;

	const filtered = useMemo(() => {
		return timeline.filter((t) =>
			shouldShowTrackInTimeline(t, durationInFrames),
		);
	}, [durationInFrames, timeline]);

	const shown = useMemo(() => {
		return filtered.length > MAX_TIMELINE_TRACKS
			? filtered.slice(0, MAX_TIMELINE_TRACKS)
			: filtered;
	}, [filtered]);

	const hasBeenCut = filtered.length > shown.length;

	return (
		<TimelineClearSelectionArea>
			{sequences.map((sequence) => {
				if (!sequence.controls || !previewConnected || !sequence.getStack()) {
					return null;
				}

				return (
					<SubscribeToNodePaths
						key={sequence.id}
						overrideId={sequence.controls.overrideId}
						schema={sequence.controls.schema}
						getStack={sequence.getStack}
						effects={sequence.effects}
					/>
				);
			})}
			<SequencePropsObserver />
			<TimelineSelectAllKeybindings timeline={shown} />
			<TimelineHeightContainer shown={shown} hasBeenCut={hasBeenCut}>
				{isStill ? (
					<TimelineList timeline={shown} />
				) : (
					<TimelineWidthProvider>
						<TimelinePinchZoom />
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
									<TimelinePlayCursorSyncer />
									<TimelineInOutPointer />
									<TimelineTimeIndicators />
									<TimelineDragHandler />
									<TimelineInOutDragHandler />
									<TimelineSlider />
								</TimelineScrollable>
							</SplitterElement>
						</SplitterContainer>
					</TimelineWidthProvider>
				)}
			</TimelineHeightContainer>
		</TimelineClearSelectionArea>
	);
};

export const Timeline = React.memo(TimelineInner);
