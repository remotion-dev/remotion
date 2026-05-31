import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {loadCompositionComponentInfo} from '../../helpers/open-in-editor';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
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
import {useResolvedStack} from './use-resolved-stack';

const container: React.CSSProperties = {
	minHeight: '100%',
	flex: 1,
	display: 'flex',
	height: 0,
	overflowY: 'auto',
	backgroundColor: BACKGROUND,
};

const noop = () => undefined;

type AddSolidAvailability =
	| {
			type: 'unavailable';
	  }
	| {
			type: 'loading';
	  }
	| {
			type: 'loaded';
			canAddSequence: boolean;
	  };

const TimelineClearSelectionArea: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {clearSelection} = useTimelineSelection();
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [addSolidAvailability, setAddSolidAvailability] =
		useState<AddSolidAvailability>({
			type: 'unavailable',
		});
	const [isAddingSolid, setIsAddingSolid] = useState(false);

	const currentCompositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const currentComposition = useMemo(() => {
		if (currentCompositionId === null) {
			return null;
		}

		return (
			compositions.find(
				(composition) => composition.id === currentCompositionId,
			) ?? null
		);
	}, [compositions, currentCompositionId]);
	const resolvedCompositionLocation = useResolvedStack(
		currentComposition?.stack ?? null,
	);
	const compositionFile = resolvedCompositionLocation?.source ?? null;

	useEffect(() => {
		let cancelled = false;

		if (currentCompositionId === null || compositionFile === null) {
			setAddSolidAvailability({type: 'unavailable'});
			return () => {
				cancelled = true;
			};
		}

		setAddSolidAvailability({type: 'loading'});
		loadCompositionComponentInfo({
			compositionFile,
			compositionId: currentCompositionId,
		})
			.then(({canAddSequence}) => {
				if (cancelled) {
					return;
				}

				setAddSolidAvailability({type: 'loaded', canAddSequence});
			})
			.catch((err) => {
				if (cancelled) {
					return;
				}

				// eslint-disable-next-line no-console
				console.error('Could not resolve composition component', err);
				setAddSolidAvailability({type: 'unavailable'});
			});

		return () => {
			cancelled = true;
		};
	}, [compositionFile, currentCompositionId]);

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

	const canAddSolid =
		addSolidAvailability.type === 'loaded' &&
		addSolidAvailability.canAddSequence &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		videoConfig !== null &&
		!isAddingSolid;

	const addSolid = useCallback(async () => {
		if (
			!canAddSolid ||
			currentCompositionId === null ||
			compositionFile === null ||
			videoConfig === null
		) {
			return;
		}

		setIsAddingSolid(true);
		try {
			const result = await callApi('/api/add-solid', {
				compositionFile,
				compositionId: currentCompositionId,
				width: videoConfig.width,
				height: videoConfig.height,
			});

			if (result.success) {
				showNotification('Added <Solid> to source file', 2000);
				return;
			}

			showNotification(result.reason, 4000);
		} catch (err) {
			showNotification((err as Error).message, 4000);
		} finally {
			setIsAddingSolid(false);
		}
	}, [canAddSolid, compositionFile, currentCompositionId, videoConfig]);

	const contextMenuItems = useMemo((): ComboboxValue[] => {
		return [
			{
				type: 'item',
				id: 'add-solid',
				label: 'Add <Solid>',
				value: 'add-solid',
				onClick: addSolid,
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
				disabled: !canAddSolid,
			},
		];
	}, [addSolid, canAddSolid]);

	return (
		<ContextMenu
			ref={timelineVerticalScroll}
			values={contextMenuItems}
			onOpen={null}
			style={container}
			className={'css-reset ' + VERTICAL_SCROLLBAR_CLASSNAME}
			onPointerDown={onPointerDown}
		>
			{children}
		</ContextMenu>
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
