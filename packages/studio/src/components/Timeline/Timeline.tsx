import type {InsertJsxElementRequest} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
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
} from '../../helpers/inserted-element-selection';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {getStudioMaxTimelineTracks} from '../../helpers/studio-runtime-config';
import {timelineSequenceNodePathToKey} from '../../helpers/timeline-node-path-key';
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
import {timelineVerticalScroll} from './timeline-refs';
import {
	EDGE_SCROLL_VERTICAL_INCREMENT,
	startTimelineEdgeAutoScroll,
} from './timeline-scroll-logic';
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
	useTimelineSelection,
} from './TimelineSelection';
import {SEQUENCE_REORDER_MIME_TYPE} from './TimelineSequenceItem';
import {TimelineSlider} from './TimelineSlider';
import {TimelineTickFormatProvider} from './TimelineTickFormatProvider';
import {
	TIMELINE_TIME_INDICATOR_HEIGHT,
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
	const isStill = useIsStill();
	const [isAddingSolid, setIsAddingSolid] = useState(false);
	const [isAddingAsset, setIsAddingAsset] = useState(false);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && isStudioInteractivityEnabled();
	const browserStudioOperations = getBrowserStudioOperations();
	const browserStudioCanInsertSolid = browserStudioOperations !== null;

	useEffect(() => {
		const verticalScroll = timelineVerticalScroll.current;
		if (!verticalScroll) {
			return;
		}

		const autoScroll = startTimelineEdgeAutoScroll({
			includeHorizontal: false,
			includeVertical: true,
			verticalTopOffset: isStill ? 0 : TIMELINE_TIME_INDICATOR_HEIGHT,
			onTick: (directions) => {
				if (directions.y === null) {
					return;
				}

				verticalScroll.scrollTop +=
					directions.y === 'up'
						? -EDGE_SCROLL_VERTICAL_INCREMENT
						: EDGE_SCROLL_VERTICAL_INCREMENT;
			},
		});

		const onDragOver = (event: DragEvent) => {
			if (
				!event.dataTransfer ||
				!Array.from(event.dataTransfer.types).includes(
					SEQUENCE_REORDER_MIME_TYPE,
				)
			) {
				autoScroll.stop();
				return;
			}

			autoScroll.update(event);
		};

		const stopAutoScroll = () => autoScroll.stop();

		verticalScroll.addEventListener('dragover', onDragOver, true);
		document.addEventListener('dragend', stopAutoScroll, true);
		document.addEventListener('drop', stopAutoScroll, true);

		return () => {
			autoScroll.stop();
			verticalScroll.removeEventListener('dragover', onDragOver, true);
			document.removeEventListener('dragend', stopAutoScroll, true);
			document.removeEventListener('drop', stopAutoScroll, true);
		};
	}, [isStill]);

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
			const request: InsertJsxElementRequest = {
				compositionFile,
				compositionId: currentCompositionId,
				from: null,
				element: {
					type: 'solid',
					width: videoConfig.width,
					height: videoConfig.height,
					position: null,
				},
			};
			const result = browserStudioOperations
				? await browserStudioOperations.insertSolid(request)
				: await callApi('/api/insert-jsx-element', request);

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
	const {sequences} = useContext(Internals.SequenceManager);
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

	const timeline = useMemo((): TimelineTrackData[] => {
		if (videoConfigIsNull) {
			return [];
		}

		return calculateTimeline({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			compositions,
		});
	}, [
		sequences,
		videoConfigIsNull,
		overrideIdToNodePathMappings,
		compositions,
	]);
	const pendingInsertedElementSelection = useSyncExternalStore(
		subscribeToInsertedElementSelection,
		getInsertedElementSelection,
		getInsertedElementSelection,
	);
	const {fastRefreshes} = useContext(FastRefreshContext);
	const pendingSelectionStart = useRef<{
		selection: NonNullable<typeof pendingInsertedElementSelection>;
		fastRefreshes: number;
		existingSequenceIds: Set<string>;
	} | null>(null);
	const {selectItems} = useTimelineSelection();
	useEffect(() => {
		if (pendingInsertedElementSelection === null) {
			pendingSelectionStart.current = null;
			return;
		}

		const matchesInsertedNodePath = (track: TimelineTrackData) =>
			track.nodePathInfo !== null &&
			(pendingInsertedElementSelection.nodePath === null ||
				(track.nodePathInfo.sequenceSubscriptionKey.absolutePath ===
					pendingInsertedElementSelection.nodePath.absolutePath &&
					JSON.stringify(
						track.nodePathInfo.sequenceSubscriptionKey.nodePath,
					) ===
						JSON.stringify(pendingInsertedElementSelection.nodePath.nodePath)));

		if (
			pendingSelectionStart.current?.selection !==
			pendingInsertedElementSelection
		) {
			pendingSelectionStart.current = {
				selection: pendingInsertedElementSelection,
				fastRefreshes,
				existingSequenceIds: new Set(
					timeline
						.filter(matchesInsertedNodePath)
						.map((track) => track.sequence.id),
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
		if (!insertedTrack || insertedTrack.nodePathInfo === null) {
			return;
		}

		selectItems(
			[{type: 'sequence', nodePathInfo: insertedTrack.nodePathInfo}],
			{reveal: true},
		);
		clearInsertedElementSelection(pendingInsertedElementSelection);
		if (pendingInsertedElementSelection.notification !== null) {
			showNotification(pendingInsertedElementSelection.notification, 3000);
		}
	}, [
		canvasContent,
		fastRefreshes,
		pendingInsertedElementSelection,
		selectItems,
		timeline,
	]);

	const durationInFrames = videoConfig?.durationInFrames ?? 0;

	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const filtered = useMemo(() => {
		return timeline.filter((t) => {
			// Moving outside the composition can reduce the displayed duration to
			// zero. Keep the drag owner mounted until its pending edit is saved.
			if (
				t.sequence.showInTimeline &&
				t.nodePathInfo !== null &&
				getDragOverrides(t.nodePathInfo.sequenceSubscriptionKey).from !==
					undefined
			) {
				return true;
			}

			return shouldShowTrackInTimeline(t, durationInFrames);
		});
	}, [durationInFrames, getDragOverrides, timeline]);

	// Keep `filtered` complete so a future toggle can show every programmatic
	// instance without recalculating the timeline or losing its instance index.
	const collapsed = useMemo(() => {
		const seenNodePaths = new Set<string>();
		return filtered.filter((track) => {
			if (track.nodePathInfo === null) {
				return true;
			}

			const key = timelineSequenceNodePathToKey(
				track.nodePathInfo.sequenceSubscriptionKey,
			);
			if (seenNodePaths.has(key)) {
				return false;
			}

			seenNodePaths.add(key);
			return true;
		});
	}, [filtered]);

	const {visibleTracks, value: layerChildrenValue} = useTimelineLayerChildren(
		collapsed,
		sequences,
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null,
	);
	const maxTimelineTracks = getStudioMaxTimelineTracks();
	const shown = useMemo(() => {
		return maxTimelineTracks !== null &&
			visibleTracks.length > maxTimelineTracks
			? visibleTracks.slice(0, maxTimelineTracks)
			: visibleTracks;
	}, [visibleTracks, maxTimelineTracks]);

	const hasBeenCut = visibleTracks.length > shown.length;

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
							timeline={shown}
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
		<TimelineTickFormatProvider>
			<MemoizedTimelineInner />
		</TimelineTickFormatProvider>
	);
};
