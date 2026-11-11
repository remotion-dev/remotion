import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {SetSelectedModalContext} from '../../state/modals';
import {handleCanvasCaptureDrop} from '../canvas-capture-drop';
import {isFileDragEvent, isSupportedDropEvent} from '../drop-handler-data';
import {
	getEffectDragData,
	isEffectDragOverTarget,
	isLutEffectDrop,
} from '../effect-drag-and-drop';
import {
	getElementDragData,
	mayHaveElementDragData,
} from '../element-drag-and-drop';
import {handleDrop} from '../handle-drop';
import {showNotification} from '../Notifications/NotificationCenter';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {useSvgImportDialog} from '../SvgImportDialog';
import {getCurrentFrame} from './imperative-state';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {
	getFrameFromTimelineDrop,
	getTimelineContentWidth,
} from './timeline-scroll-logic';
import {
	createTrackDropPreview,
	getTrackDropTarget,
	insertElementIntoTimelineTrack,
	isTrackDropValid,
} from './track-drop';
import {useResolvedStack} from './use-resolved-stack';

const isEventTargetInsideElement = (event: DragEvent, element: HTMLElement) => {
	return event.target instanceof Node && element.contains(event.target);
};

export const useTimelineAssetDrop = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const chooseSvgImportMode = useSvgImportDialog();
	const calculate = useTimelineCalculator();
	const sequences = useContext(Internals.SequenceManagerRefContext);
	const mappings = useContext(OverrideIdToNodePathMappingsRefContext);
	const getTracks = useCallback(
		() =>
			calculate({
				sequences: sequences.current,
				overrideIdsToNodePaths: mappings.current,
			}).tracks,
		[calculate, mappings, sequences],
	);
	const trackPreview = useRef<ReturnType<typeof createTrackDropPreview> | null>(
		null,
	);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [isAddingAsset, setIsAddingAsset] = useState(false);
	const [assetDropFrame, setAssetDropFrame] = useState<number | null>(null);

	const currentCompositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const currentComposition = useMemo(() => {
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
		(currentCompositionId
			? getBrowserStudioOperations()?.getCompositionFile(currentCompositionId)
			: null) ??
		null;
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile,
		compositionId: currentCompositionId,
	});

	const previewInteractive =
		previewServerState.type === 'connected' && isStudioInteractivityEnabled();
	const canReceiveElementDrop =
		previewInteractive &&
		!window.remotion_isReadOnlyStudio &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		videoConfig !== null &&
		!isAddingAsset;
	const canInsertAsset =
		canReceiveElementDrop && compositionComponentInfo?.canAddSequence === true;

	const getDropFrame = useCallback(
		(event: DragEvent) => {
			if (videoConfig === null) {
				return null;
			}

			const scrollable = scrollableRef.current;
			return scrollable !== null &&
				isEventTargetInsideElement(event, scrollable)
				? getFrameFromTimelineDrop({
						clientX: event.clientX,
						durationInFrames: videoConfig.durationInFrames,
						scrollLeft: scrollable.scrollLeft,
						timelineLeft: scrollable.getBoundingClientRect().left,
						timelineWidth: getTimelineContentWidth(),
					})
				: getCurrentFrame();
		},
		[videoConfig],
	);

	const onAssetDragOver = useCallback(
		(event: DragEvent) => {
			const timeline = timelineVerticalScroll.current;
			const {dataTransfer} = event;
			if (
				timeline === null ||
				dataTransfer === null ||
				!isSupportedDropEvent(event) ||
				!isEventTargetInsideElement(event, timeline)
			) {
				setAssetDropFrame(null);
				trackPreview.current?.clear();
				return;
			}

			if (isEffectDragOverTarget(event)) {
				event.preventDefault();
				dataTransfer.dropEffect = 'copy';
				setAssetDropFrame(null);
				trackPreview.current?.clear();
				return;
			}

			const canDropElementIntoNewComposition =
				compositionComponentInfo?.canAddSequence === false &&
				canReceiveElementDrop &&
				mayHaveElementDragData(dataTransfer);

			event.preventDefault();
			event.stopPropagation();
			dataTransfer.dropEffect =
				canInsertAsset || canDropElementIntoNewComposition ? 'copy' : 'none';
			const scrollable = scrollableRef.current;
			const shouldShowDropFrame =
				canInsertAsset &&
				scrollable !== null &&
				isEventTargetInsideElement(event, scrollable);
			setAssetDropFrame(shouldShowDropFrame ? getDropFrame(event) : null);
			const tracks = getTracks();
			const target = getTrackDropTarget(event.clientX, event.clientY, tracks);
			const from = getDropFrame(event);
			if (target && from !== null && videoConfig) {
				trackPreview.current ??= createTrackDropPreview(
					videoConfig.durationInFrames,
				);
				const metadata = StudioProtocolInternals.getDragPreviewMetadata(
					dataTransfer.types,
				);
				const rate = target.track.sequence.sequencePlaybackRate;
				const knownDuration =
					metadata?.type === 'asset' ? metadata.durationInSeconds : undefined;
				const previewDuration = Math.max(
					1,
					Math.min(
						((knownDuration ?? 5) * videoConfig.fps) / rate,
						target.track.sequence.from + target.track.sequence.duration - from,
					),
				);
				const valid =
					canInsertAsset &&
					isTrackDropValid({
						target,
						tracks,
						spans: [{from, duration: previewDuration}],
						excludedIds: new Set(),
						fps: videoConfig.fps,
					});
				trackPreview.current.show(target, from, previewDuration, valid);
				dataTransfer.dropEffect =
					valid || (knownDuration === undefined && canInsertAsset)
						? 'copy'
						: 'none';
			} else trackPreview.current?.clear();
		},
		[
			canInsertAsset,
			canReceiveElementDrop,
			compositionComponentInfo?.canAddSequence,
			getDropFrame,
			getTracks,
			videoConfig,
		],
	);

	const onAssetDrop = useCallback(
		async (event: DragEvent) => {
			setAssetDropFrame(null);
			const timeline = timelineVerticalScroll.current;
			const {dataTransfer} = event;
			if (
				timeline === null ||
				dataTransfer === null ||
				!isSupportedDropEvent(event) ||
				!isEventTargetInsideElement(event, timeline)
			) {
				return;
			}

			if (isLutEffectDrop(event)) {
				event.preventDefault();
				return;
			}

			const localFiles = isFileDragEvent(event)
				? Array.from(dataTransfer.files)
				: null;
			if (localFiles !== null && !window.remotion_isReadOnlyStudio) {
				event.preventDefault();
				event.stopPropagation();
				setIsAddingAsset(true);
				try {
					if (
						await handleCanvasCaptureDrop({
							files: localFiles,
							setSelectedModal,
						})
					) {
						return;
					}
				} finally {
					setIsAddingAsset(false);
				}
			}

			if (getEffectDragData(dataTransfer) !== null) {
				event.preventDefault();
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			const canDropElementIntoNewComposition =
				compositionComponentInfo?.canAddSequence === false &&
				canReceiveElementDrop &&
				getElementDragData(dataTransfer) !== null;
			if (
				(!canInsertAsset && !canDropElementIntoNewComposition) ||
				currentCompositionId === null ||
				compositionFile === null ||
				videoConfig === null
			) {
				if (compositionComponentInfo?.canAddSequence === false) {
					showNotification(
						'Cannot insert this item: This composition component cannot accept a new <Sequence>.',
						3000,
					);
				}

				return;
			}

			const frame = getDropFrame(event);
			if (frame === null) {
				return;
			}

			const target = getTrackDropTarget(
				event.clientX,
				event.clientY,
				getTracks(),
			);
			setIsAddingAsset(true);
			const notification = target
				? showNotification('Adding asset to Track...', null)
				: null;
			try {
				await handleDrop({
					insert: target
						? ({element}) =>
								insertElementIntoTimelineTrack({
									target,
									tracks: getTracks(),
									element,
									from: frame,
									fps: videoConfig.fps,
									compositionFile,
									compositionId: currentCompositionId,
								})
						: null,
					chooseSvgImportMode,
					compositionFile,
					compositionId: currentCompositionId,
					destinationDimensions: {
						height: videoConfig.height,
						width: videoConfig.width,
					},
					dropPosition: {
						centerX: videoConfig.width / 2,
						centerY: videoConfig.height / 2,
					},
					event,
					fps: videoConfig.fps,
					from: frame,
					localFiles,
					preferCompositionStart: false,
				});
			} catch (error) {
				showNotification(
					error instanceof Error ? error.message : String(error),
					4000,
				);
			} finally {
				notification?.dismiss();
				trackPreview.current?.clear();
				setIsAddingAsset(false);
			}
		},
		[
			canInsertAsset,
			canReceiveElementDrop,
			chooseSvgImportMode,
			compositionComponentInfo?.canAddSequence,
			compositionFile,
			currentCompositionId,
			getDropFrame,
			getTracks,
			setSelectedModal,
			videoConfig,
		],
	);

	const clearAssetDropFrame = useCallback(() => {
		setAssetDropFrame(null);
		trackPreview.current?.clear();
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		const options = {capture: true, signal: controller.signal};
		const onAssetDragLeave = (event: DragEvent) => {
			const scrollable = scrollableRef.current;
			if (
				scrollable !== null &&
				isEventTargetInsideElement(event, scrollable) &&
				!(
					event.relatedTarget instanceof Node &&
					scrollable.contains(event.relatedTarget)
				)
			) {
				clearAssetDropFrame();
			}
		};

		document.addEventListener('dragover', onAssetDragOver, options);
		document.addEventListener('dragleave', onAssetDragLeave, options);
		document.addEventListener('drop', onAssetDrop, options);
		document.addEventListener('dragend', clearAssetDropFrame, options);
		window.addEventListener('blur', clearAssetDropFrame, {
			signal: controller.signal,
		});
		window.addEventListener(
			'remotion-browser-studio-pointerleave',
			clearAssetDropFrame,
			{signal: controller.signal},
		);

		return () => {
			controller.abort();
			trackPreview.current?.clear();
		};
	}, [clearAssetDropFrame, onAssetDragOver, onAssetDrop]);

	return assetDropFrame;
};
