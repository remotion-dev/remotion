import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {isSupportedDropEvent} from '../drop-handler-data';
import {getEffectDragData} from '../effect-drag-and-drop';
import {handleDrop} from '../handle-drop';
import {showNotification} from '../Notifications/NotificationCenter';
import {useSvgImportDialog} from '../SvgImportDialog';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {getFrameFromTimelineDrop} from './timeline-scroll-logic';
import {useResolvedStack} from './use-resolved-stack';

const isEventInsideElement = (event: DragEvent, element: HTMLElement) => {
	if (event.target instanceof Node && element.contains(event.target)) {
		return true;
	}

	const rect = element.getBoundingClientRect();
	return (
		event.clientX >= rect.left &&
		event.clientX <= rect.right &&
		event.clientY >= rect.top &&
		event.clientY <= rect.bottom
	);
};

export const useTimelineAssetDrop = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const chooseSvgImportMode = useSvgImportDialog();
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
	const compositionFile = resolvedCompositionLocation?.source ?? null;
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile,
		compositionId: currentCompositionId,
	});

	const previewInteractive =
		previewServerState.type === 'connected' && isStudioInteractivityEnabled();
	const canInsertAsset =
		previewInteractive &&
		!window.remotion_isReadOnlyStudio &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		videoConfig !== null &&
		!isAddingAsset;

	const getDropFrame = useCallback(
		(event: DragEvent) => {
			if (videoConfig === null) {
				return null;
			}

			const scrollable = scrollableRef.current;
			return scrollable !== null && isEventInsideElement(event, scrollable)
				? getFrameFromTimelineDrop({
						clientX: event.clientX,
						durationInFrames: videoConfig.durationInFrames,
						scrollLeft: scrollable.scrollLeft,
						timelineLeft: scrollable.getBoundingClientRect().left,
						timelineWidth: scrollable.scrollWidth,
					})
				: timelinePosition;
		},
		[timelinePosition, videoConfig],
	);

	const onAssetDragOver = useCallback(
		(event: DragEvent) => {
			const timeline = timelineVerticalScroll.current;
			const {dataTransfer} = event;
			if (
				timeline === null ||
				dataTransfer === null ||
				!isSupportedDropEvent(event) ||
				!isEventInsideElement(event, timeline)
			) {
				setAssetDropFrame(null);
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			dataTransfer.dropEffect = canInsertAsset ? 'copy' : 'none';
			const scrollable = scrollableRef.current;
			const shouldShowDropFrame =
				canInsertAsset &&
				scrollable !== null &&
				isEventInsideElement(event, scrollable);
			setAssetDropFrame(shouldShowDropFrame ? getDropFrame(event) : null);
		},
		[canInsertAsset, getDropFrame],
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
				!isEventInsideElement(event, timeline)
			) {
				return;
			}

			if (getEffectDragData(dataTransfer) !== null) {
				event.preventDefault();
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			if (
				!canInsertAsset ||
				currentCompositionId === null ||
				compositionFile === null ||
				videoConfig === null
			) {
				if (compositionComponentInfo?.canAddSequence === false) {
					showNotification(
						'Cannot insert items into this composition component',
						3000,
					);
				}

				return;
			}

			const frame = getDropFrame(event);
			if (frame === null) {
				return;
			}

			setIsAddingAsset(true);
			try {
				await handleDrop({
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
				});
			} finally {
				setIsAddingAsset(false);
			}
		},
		[
			canInsertAsset,
			chooseSvgImportMode,
			compositionComponentInfo?.canAddSequence,
			compositionFile,
			currentCompositionId,
			getDropFrame,
			videoConfig,
		],
	);

	const clearAssetDropFrame = useCallback(() => {
		setAssetDropFrame(null);
	}, []);

	useEffect(() => {
		document.addEventListener('dragover', onAssetDragOver, {capture: true});
		document.addEventListener('drop', onAssetDrop, {capture: true});
		document.addEventListener('dragend', clearAssetDropFrame, {capture: true});

		return () => {
			document.removeEventListener('dragover', onAssetDragOver, {
				capture: true,
			});
			document.removeEventListener('drop', onAssetDrop, {capture: true});
			document.removeEventListener('dragend', clearAssetDropFrame, {
				capture: true,
			});
		};
	}, [clearAssetDropFrame, onAssetDragOver, onAssetDrop]);

	return assetDropFrame;
};
