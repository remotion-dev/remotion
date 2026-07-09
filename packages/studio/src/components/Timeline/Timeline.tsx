import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BACKGROUND} from '../../helpers/colors';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useIsStill} from '../../helpers/is-current-selected-still';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import {importAssets, pickFilesToImport} from '../import-assets';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {SplitterContainer} from '../Splitter/SplitterContainer';
import {SplitterElement} from '../Splitter/SplitterElement';
import {SplitterHandle} from '../Splitter/SplitterHandle';
import {MAX_TIMELINE_TRACKS} from './MaxTimelineTracks';
import {SequencePropsObserver} from './SequencePropsObserver';
import {shouldShowTrackInTimeline} from './should-show-track-in-timeline';
import {shouldSubscribeToSequenceProps} from './should-subscribe-to-sequence-props';
import {SubscribeToNodePaths} from './SubscribeToNodePaths';
import {timelineVerticalScroll} from './timeline-refs';
import {TimelineDragHandler} from './TimelineDragHandler';
import {TimelineHeightContainer} from './TimelineHeightContainer';
import {TimelineInOutDragHandler} from './TimelineInOutDragHandler';
import {TimelineInOutPointer} from './TimelineInOutPointer';
import {TimelineKeyframeTracksProvider} from './TimelineKeyframeTracksContext';
import {TimelineList} from './TimelineList';
import {TimelinePinchZoom} from './TimelinePinchZoom';
import {TimelinePlayCursorSyncer} from './TimelinePlayCursorSyncer';
import {TimelineScrollable} from './TimelineScrollable';
import {
	TimelineSelectableItemsProvider,
	TimelineSelectAllKeybindings,
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

const TimelineContextMenuArea: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [isAddingSolid, setIsAddingSolid] = useState(false);
	const [isAddingAsset, setIsAddingAsset] = useState(false);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && studioInteractivityEnabled;

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
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile,
		compositionId: currentCompositionId,
	});

	const canInsertSolid =
		previewInteractive &&
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
			const result = await callApi('/api/insert-jsx-element', {
				compositionFile,
				compositionId: currentCompositionId,
				element: {
					type: 'solid',
					width: videoConfig.width,
					height: videoConfig.height,
					position: null,
				},
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
	}, [canInsertSolid, compositionFile, currentCompositionId, videoConfig]);

	const insertAsset = useCallback(async () => {
		if (
			!canInsertAsset ||
			currentCompositionId === null ||
			compositionFile === null
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
				compositionFile,
				compositionId: currentCompositionId,
				dropPosition: null,
			});
		} finally {
			setIsAddingAsset(false);
		}
	}, [canInsertAsset, compositionFile, currentCompositionId]);

	const contextMenuItems = useMemo((): ComboboxValue[] => {
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
			values={contextMenuItems}
			onOpen={null}
			style={container}
			className={'css-reset ' + VERTICAL_SCROLLBAR_CLASSNAME}
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
	const previewInteractive = previewConnected && studioInteractivityEnabled;

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
			{studioInteractivityEnabled ? <SequencePropsObserver /> : null}
			<TimelineKeyframeTracksProvider tracks={filtered}>
				<TimelineSelectableItemsProvider timeline={shown}>
					{studioInteractivityEnabled ? (
						<TimelineSelectAllKeybindings timeline={shown} />
					) : null}
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
											<TimelineTracks
												timeline={shown}
												hasBeenCut={hasBeenCut}
											/>
											<TimelinePlayCursorSyncer />
											<TimelineInOutPointer />
											<TimelineTimeIndicators />
											<TimelineDragHandler />
											{studioInteractivityEnabled ? (
												<TimelineInOutDragHandler />
											) : null}
											<TimelineSlider />
										</TimelineScrollable>
									</SplitterElement>
								</SplitterContainer>
							</TimelineWidthProvider>
						)}
					</TimelineHeightContainer>
				</TimelineSelectableItemsProvider>
			</TimelineKeyframeTracksProvider>
		</TimelineContextMenuArea>
	);
};

export const Timeline = React.memo(TimelineInner);
