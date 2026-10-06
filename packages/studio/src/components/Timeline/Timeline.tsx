import type {InsertCompositionElementRequest} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals, type TSequence} from 'remotion';
import {FastRefreshContext} from '../../fast-refresh-context';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND} from '../../helpers/colors';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {
	clearInsertedElementSelection,
	getInsertedElementSelection,
	subscribeToInsertedElementSelection,
	type PendingInsertedElementSelection,
} from '../../helpers/inserted-element-selection';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {getStudioMaxTimelineTracks} from '../../helpers/studio-runtime-config';
import {useSyncExternalStore} from '../../helpers/use-sync-external-store';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import {importAssets, pickFilesToImport} from '../import-assets';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {SequencePropsObserver} from './SequencePropsObserver';
import {shouldShowTrackInTimeline} from './should-show-track-in-timeline';
import {shouldSubscribeToSequenceProps} from './should-subscribe-to-sequence-props';
import {SubscribeToNodePaths} from './SubscribeToNodePaths';
import {TimelineAssetDropFrameContext} from './timeline-asset-drop-context';
import {
	addTimelineDisplayGroups,
	type TimelineTrackWithDisplayGroup,
} from './timeline-display-groups';
import {timelineVerticalScroll} from './timeline-refs';
import {
	filterTimelineTrackContents,
	getTimelineDisplayRows,
} from './timeline-track-groups';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineHeightContainer} from './TimelineHeightContainer';
import {TimelineInOutDragHandler} from './TimelineInOutDragHandler';
import {TimelineInOutPointer} from './TimelineInOutPointer';
import {TimelineKeyframeTracksProvider} from './TimelineKeyframeTracksContext';
import {
	TimelineLayerChildrenProvider,
	useTimelineLayerChildren,
} from './TimelineLayerChildren';
import {TimelineList} from './TimelineList';
import {TimelinePinchZoom} from './TimelinePinchZoom';
import {TimelinePlayCursorSyncer} from './TimelinePlayCursorSyncer';
import {TimelineScrollable} from './TimelineScrollable';
import {
	TimelineSelectableItemsProvider,
	TimelineSelectAllKeybindings,
	useCurrentTimelineSelectionStateAsRef,
} from './TimelineSelection';
import {TimelineEdgeHighlightProvider} from './TimelineSequence';
import {TimelineSequenceMediaDurationDragLimitsProvider} from './TimelineSequenceRightEdgeDragHandle';
import {TimelineSlider} from './TimelineSlider';
import {TimelineSnapIndicatorProvider} from './TimelineSnapIndicator';
import {
	TimelineTimeIndicators,
	TimelineTimePlaceholders,
} from './TimelineTimeIndicators';
import {TimelineTracks} from './TimelineTracks';
import {TimelineVirtualizationProvider} from './TimelineVirtualization';
import {TimelineWidthProvider} from './TimelineWidthProvider';
import {useResolvedStack} from './use-resolved-stack';
import {useTimelineAssetDrop} from './use-timeline-asset-drop';

const MIN_TIMELINE_LABELS_WIDTH = 240;

const container: React.CSSProperties = {
	minHeight: '100%',
	flex: 1,
	display: 'flex',
	height: 0,
	overflowY: 'auto',
	backgroundColor: BACKGROUND,
};

const noop = () => undefined;

const TimelineContextMenuArea: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const assetDropFrame = useTimelineAssetDrop();
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [isAddingSolid, setIsAddingSolid] = useState(false);
	const [isAddingAsset, setIsAddingAsset] = useState(false);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && isStudioInteractivityEnabled();
	const browserStudioOperations = getBrowserStudioOperations();
	const browserStudioCanInsertSolid = browserStudioOperations !== null;

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
	const compositionFile =
		resolvedCompositionLocation?.source ??
		(currentCompositionId && browserStudioOperations
			? browserStudioOperations.getCompositionFile(currentCompositionId)
			: null);
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile,
		compositionId: currentCompositionId,
	});

	const canInsertSolid =
		(previewInteractive || browserStudioCanInsertSolid) &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		videoConfig !== null &&
		!isAddingSolid;

	const canInsertAsset =
		previewInteractive &&
		!window.remotion_isReadOnlyStudio &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		!isAddingAsset;

	const insertSolid = useCallback(async () => {
		if (
			!canInsertSolid ||
			currentCompositionId === null ||
			compositionFile === null ||
			videoConfig === null
		) {
			return;
		}

		setIsAddingSolid(true);
		try {
			const request: InsertCompositionElementRequest = {
				compositionFile,
				compositionId: currentCompositionId,
				from: null,
				premountFor: videoConfig.fps,
				element: {
					type: 'solid',
					width: videoConfig.width,
					height: videoConfig.height,
					position: null,
				},
			};
			const result = browserStudioOperations
				? await browserStudioOperations.insertCompositionElement(request)
				: await callApi('/api/insert-composition-element', request);

			if (result.success) {
				return;
			}

			showNotification(result.reason, 4000);
		} catch (err) {
			showNotification((err as Error).message, 4000);
		} finally {
			setIsAddingSolid(false);
		}
	}, [
		browserStudioOperations,
		canInsertSolid,
		compositionFile,
		currentCompositionId,
		videoConfig,
	]);

	const insertAsset = useCallback(async () => {
		if (
			!canInsertAsset ||
			currentCompositionId === null ||
			compositionFile === null ||
			videoConfig === null
		) {
			return;
		}

		const files = await pickFilesToImport();
		if (files.length === 0) {
			return;
		}

		setIsAddingAsset(true);
		try {
			await importAssets({
				files,
				fps: videoConfig.fps,
				compositionFile,
				compositionId: currentCompositionId,
				destinationDimensions: null,
				dropPosition: null,
				from: null,
				preferCompositionStart: null,
				svgImportMode: 'image',
			});
		} finally {
			setIsAddingAsset(false);
		}
	}, [canInsertAsset, compositionFile, currentCompositionId, videoConfig]);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		return [
			{
				type: 'item',
				id: 'insert-solid',
				label: 'Add <Solid>',
				value: 'insert-solid',
				onClick: insertSolid,
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
				disabled: !canInsertSolid,
			},
			{
				type: 'item',
				id: 'insert-asset',
				label: 'Add asset',
				value: 'insert-asset',
				onClick: insertAsset,
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
				disabled: !canInsertAsset,
			},
		];
	}, [insertSolid, canInsertSolid, insertAsset, canInsertAsset]);

	return (
		<ContextMenu
			ref={timelineVerticalScroll}
			getItems={getContextMenuItems}
			style={container}
			className={'css-reset ' + VERTICAL_SCROLLBAR_CLASSNAME}
		>
			<TimelineAssetDropFrameContext.Provider value={assetDropFrame}>
				{children}
			</TimelineAssetDropFrameContext.Provider>
		</ContextMenu>
	);
};

const TimelineInner: React.FC = () => {
	const sequences = Internals.useSequenceManagerSequences();
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const isStill = useIsStill();
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);

	const {previewServerState} = useContext(StudioServerConnectionCtx);

	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && isStudioInteractivityEnabled();

	const videoConfigIsNull = videoConfig === null;
	const previousTimelineRef = useRef<{
		readonly sequences: TSequence[];
		readonly overrideIdsToNodePaths: typeof overrideIdToNodePathMappings;
		readonly compositions: typeof compositions;
		readonly timeline: TimelineTrackWithDisplayGroup[];
	} | null>(null);

	const timeline = useMemo((): TimelineTrackWithDisplayGroup[] => {
		if (videoConfigIsNull) {
			return [];
		}

		const next = addTimelineDisplayGroups(
			calculateTimeline({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				compositions,
			}),
		);
		const previous = previousTimelineRef.current;
		if (
			previous === null ||
			previous.overrideIdsToNodePaths !== overrideIdToNodePathMappings ||
			previous.compositions !== compositions
		) {
			return next;
		}

		const previousSequencesById = new Map(
			previous.sequences.map((sequence) => [sequence.id, sequence]),
		);
		const currentSequencesById = new Map(
			sequences.map((sequence) => [sequence.id, sequence]),
		);
		const previousTracksById = new Map(
			previous.timeline.map((track) => [track.sequence.id, track]),
		);
		return next.map((track) => {
			const oldTrack = previousTracksById.get(track.sequence.id);
			const currentSource = currentSequencesById.get(track.sequence.id);
			const oldNodePath = oldTrack?.nodePathInfo;
			const nodePath = track.nodePathInfo;
			const oldLoop = oldTrack?.sequence.loopDisplay;
			const loop = track.sequence.loopDisplay;
			if (
				oldTrack === undefined ||
				currentSource !== previousSequencesById.get(track.sequence.id) ||
				oldTrack.depth !== track.depth ||
				oldTrack.cascadedStart !== track.cascadedStart ||
				oldTrack.localStart !== track.localStart ||
				oldTrack.keyframeDisplayOffset !== track.keyframeDisplayOffset ||
				oldTrack.keyframePlaybackRate !== track.keyframePlaybackRate ||
				oldTrack.sequenceFrameOffset !== track.sequenceFrameOffset ||
				oldTrack.sequence.from !== track.sequence.from ||
				oldTrack.sequence.duration !== track.sequence.duration ||
				oldTrack.sequence.sequencePlaybackRate !==
					track.sequence.sequencePlaybackRate ||
				oldTrack.sequence.premountDisplay !== track.sequence.premountDisplay ||
				oldTrack.sequence.postmountDisplay !==
					track.sequence.postmountDisplay ||
				oldTrack.displayGroup?.key !== track.displayGroup?.key ||
				oldTrack.displayGroup?.numberOfSequences !==
					track.displayGroup?.numberOfSequences ||
				(oldNodePath === null) !== (nodePath === null) ||
				(oldNodePath !== null &&
					nodePath !== null &&
					(oldNodePath?.sequenceSubscriptionKey !==
						nodePath.sequenceSubscriptionKey ||
						oldNodePath?.index !== nodePath.index ||
						oldNodePath?.numberOfSequencesWithThisNodePath !==
							nodePath.numberOfSequencesWithThisNodePath ||
						oldNodePath?.supportsEffects !== nodePath.supportsEffects)) ||
				(oldLoop === undefined) !== (loop === undefined) ||
				(oldLoop !== undefined &&
					loop !== undefined &&
					(oldLoop.durationInFrames !== loop.durationInFrames ||
						oldLoop.numberOfTimes !== loop.numberOfTimes ||
						oldLoop.startOffset !== loop.startOffset ||
						oldLoop.phaseOffsetInFrames !== loop.phaseOffsetInFrames ||
						oldLoop.mediaOffsetInFrames !== loop.mediaOffsetInFrames))
			) {
				return track;
			}

			return oldTrack;
		});
	}, [
		sequences,
		videoConfigIsNull,
		overrideIdToNodePathMappings,
		compositions,
	]);
	useLayoutEffect(() => {
		previousTimelineRef.current = {
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			compositions,
			timeline,
		};
	}, [compositions, overrideIdToNodePathMappings, sequences, timeline]);
	const durationInFrames = videoConfig?.durationInFrames ?? 0;

	const activeFromDragOverrideKeys = Internals.useActiveFromDragOverrideKeys();
	const filtered = useMemo(() => {
		return timeline.filter((t) => {
			// Moving outside the composition can reduce the displayed duration to
			// zero. Keep the drag owner mounted until its pending edit is saved.
			if (
				t.sequence.showInTimeline &&
				t.nodePathInfo !== null &&
				activeFromDragOverrideKeys.has(
					Internals.makeSequencePropsSubscriptionKey(
						t.nodePathInfo.sequenceSubscriptionKey,
					),
				)
			) {
				return true;
			}

			return shouldShowTrackInTimeline(t, durationInFrames);
		});
	}, [activeFromDragOverrideKeys, durationInFrames, timeline]);

	// Keep `filtered` complete so a future toggle can show every programmatic
	// instance without recalculating the timeline or losing its instance index.
	const collapsed = useMemo(() => {
		const seenDisplayGroups = new Set<string>();
		return filterTimelineTrackContents(filtered, sequences).filter((track) => {
			if (track.sequence.timelineTrack || track.displayGroup === null) {
				return true;
			}

			if (seenDisplayGroups.has(track.displayGroup.key)) {
				return false;
			}

			seenDisplayGroups.add(track.displayGroup.key);
			return true;
		});
	}, [filtered, sequences]);

	const {visibleTracks, value: layerChildrenValue} = useTimelineLayerChildren(
		collapsed,
		sequences,
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null,
	);
	const {fastRefreshes} = useContext(FastRefreshContext);
	const pendingSelectionStart = useRef<{
		selection: PendingInsertedElementSelection;
		fastRefreshes: number;
		existingSequenceIds: Set<string>;
	} | null>(null);
	const selectionBaselineRef = useRef({fastRefreshes, timeline});
	selectionBaselineRef.current = {fastRefreshes, timeline};
	const subscribeToPendingSelection = useCallback((listener: () => void) => {
		return subscribeToInsertedElementSelection(() => {
			const selection = getInsertedElementSelection();
			if (selection !== null) {
				// Capture before React handles the notification. Fast Refresh may have
				// already committed the inserted sequence by the next layout effect.
				pendingSelectionStart.current = {
					selection,
					fastRefreshes: selectionBaselineRef.current.fastRefreshes,
					existingSequenceIds: new Set(
						selectionBaselineRef.current.timeline.map(
							(track) => track.sequence.id,
						),
					),
				};
			}

			listener();
		});
	}, []);
	const pendingInsertedElementSelection = useSyncExternalStore(
		subscribeToPendingSelection,
		getInsertedElementSelection,
		getInsertedElementSelection,
	);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
	useLayoutEffect(() => {
		if (pendingInsertedElementSelection === null) {
			pendingSelectionStart.current = null;
			return;
		}

		const matchesInsertedNodePath = (track: TimelineTrackData) =>
			pendingInsertedElementSelection.nodePath === null ||
			(track.nodePathInfo !== null &&
				track.nodePathInfo.sequenceSubscriptionKey.absolutePath ===
					pendingInsertedElementSelection.nodePath.absolutePath &&
				JSON.stringify(track.nodePathInfo.sequenceSubscriptionKey.nodePath) ===
					JSON.stringify(pendingInsertedElementSelection.nodePath.nodePath));

		if (
			pendingSelectionStart.current?.selection !==
			pendingInsertedElementSelection
		) {
			pendingSelectionStart.current = {
				selection: pendingInsertedElementSelection,
				fastRefreshes,
				existingSequenceIds: new Set(
					timeline.map((track) => track.sequence.id),
				),
			};
			return;
		}

		if (pendingSelectionStart.current.fastRefreshes === fastRefreshes) {
			return;
		}

		if (
			canvasContent?.type === 'composition' &&
			canvasContent.compositionId !==
				pendingInsertedElementSelection.compositionId
		) {
			clearInsertedElementSelection(pendingInsertedElementSelection);
			return;
		}

		const insertedTrack = timeline.find(
			(track) =>
				matchesInsertedNodePath(track) &&
				!pendingSelectionStart.current?.existingSequenceIds.has(
					track.sequence.id,
				),
		);
		if (!insertedTrack) {
			return;
		}

		const layerKey = layerChildrenValue.keys.get(insertedTrack.sequence.id);
		if (layerKey !== undefined && !layerChildrenValue.collapsed[layerKey]) {
			layerChildrenValue.toggle(layerKey);
		}

		if (insertedTrack.nodePathInfo === null) {
			return;
		}

		currentSelection.current.selectItems(
			[{type: 'sequence', nodePathInfo: insertedTrack.nodePathInfo}],
			{reveal: true},
		);
		clearInsertedElementSelection(pendingInsertedElementSelection);
		if (pendingInsertedElementSelection.notification !== null) {
			showNotification(pendingInsertedElementSelection.notification, 3000);
		}
	}, [
		canvasContent,
		currentSelection,
		fastRefreshes,
		layerChildrenValue,
		pendingInsertedElementSelection,
		timeline,
	]);

	const maxTimelineTracks = getStudioMaxTimelineTracks();
	const displayRows = useMemo(
		() => getTimelineDisplayRows(visibleTracks),
		[visibleTracks],
	);
	const shownRows = useMemo(() => {
		return maxTimelineTracks !== null && displayRows.length > maxTimelineTracks
			? displayRows.slice(0, maxTimelineTracks)
			: displayRows;
	}, [displayRows, maxTimelineTracks]);
	const shown = useMemo(
		() => shownRows.flatMap((row) => [row.track, ...(row.items ?? [])]),
		[shownRows],
	);

	const hasBeenCut = displayRows.length > shownRows.length;

	return (
		<TimelineContextMenuArea>
			{sequences.map((sequence) => {
				if (!shouldSubscribeToSequenceProps(sequence, previewInteractive)) {
					return null;
				}

				return (
					<SubscribeToNodePaths
						key={sequence.id}
						overrideId={sequence.controls.overrideId}
						componentIdentity={sequence.controls.componentIdentity}
						schema={sequence.controls.schema}
						getStack={sequence.getStack}
						effects={sequence.effects}
					/>
				);
			})}
			{isStudioInteractivityEnabled() ? <SequencePropsObserver /> : null}
			<TimelineLayerChildrenProvider value={layerChildrenValue}>
				<TimelineKeyframeTracksProvider tracks={filtered}>
					<TimelineSelectableItemsProvider timeline={shown}>
						<TimelineVirtualizationProvider
							hasBeenCut={hasBeenCut}
							isStill={isStill}
							timeline={shownRows}
						>
							{isStudioInteractivityEnabled() ? (
								<TimelineSelectAllKeybindings timeline={shown} />
							) : null}
							<TimelineHeightContainer>
								{isStill ? (
									<TimelineList />
								) : (
									<TimelineWidthProvider>
										<TimelinePinchZoom />
										<SplitterContainer
											orientation="vertical"
											defaultFlex={0.2}
											id="names-to-timeline"
											maxFlex={0.5}
											minFlex={0.15}
											maxFlexerSize={null}
											minFlexerSize={MIN_TIMELINE_LABELS_WIDTH}
											maxAntiFlexerSize={null}
											minAntiFlexerSize={null}
										>
											<SplitterElement
												type="flexer"
												sticky={<TimelineTimePlaceholders />}
											>
												<TimelineList />
											</SplitterElement>
											<SplitterHandle
												onCollapse={noop}
												onCollapseDuringDrag={null}
												allowToCollapse="none"
											/>
											<SplitterElement
												type="anti-flexer"
												sticky={
													<>
														<TimelineTimeIndicators />
														<TimelineSlider />
													</>
												}
											>
												<TimelineScrollable>
													<TimelineTracks hasBeenCut={hasBeenCut} />
													<TimelinePlayCursorSyncer />
													<TimelineInOutPointer />
													<TimelineDragHandler />
													{isStudioInteractivityEnabled() ? (
														<TimelineInOutDragHandler />
													) : null}
												</TimelineScrollable>
											</SplitterElement>
										</SplitterContainer>
									</TimelineWidthProvider>
								)}
							</TimelineHeightContainer>
						</TimelineVirtualizationProvider>
					</TimelineSelectableItemsProvider>
				</TimelineKeyframeTracksProvider>
			</TimelineLayerChildrenProvider>
		</TimelineContextMenuArea>
	);
};

const MemoizedTimelineInner = React.memo(TimelineInner);

export const Timeline: React.FC = () => {
	return (
		<TimelineEdgeHighlightProvider>
			<TimelineSequenceMediaDurationDragLimitsProvider>
				<TimelineSnapIndicatorProvider>
					<MemoizedTimelineInner />
				</TimelineSnapIndicatorProvider>
			</TimelineSequenceMediaDurationDragLimitsProvider>
		</TimelineEdgeHighlightProvider>
	);
};
