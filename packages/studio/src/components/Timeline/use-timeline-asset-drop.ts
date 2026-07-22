import {
	ASSET_DRAG_MIME_TYPE,
	parseAssetDragData,
} from '@remotion/studio-shared';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {insertExistingAssets} from '../import-assets';
import {showNotification} from '../Notifications/NotificationCenter';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {getFrameFromTimelineDrop} from './timeline-scroll-logic';
import {useResolvedStack} from './use-resolved-stack';

const isAssetDrag = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).includes(ASSET_DRAG_MIME_TYPE);
};

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
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [isAddingAsset, setIsAddingAsset] = useState(false);

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
		previewServerState.type === 'connected' && studioInteractivityEnabled;
	const canInsertAsset =
		previewInteractive &&
		!window.remotion_isReadOnlyStudio &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		videoConfig !== null &&
		!isAddingAsset;

	const onAssetDragOver = useCallback(
		(event: DragEvent) => {
			const timeline = timelineVerticalScroll.current;
			const {dataTransfer} = event;
			if (
				timeline === null ||
				dataTransfer === null ||
				!isAssetDrag(dataTransfer) ||
				!isEventInsideElement(event, timeline)
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			dataTransfer.dropEffect = canInsertAsset ? 'copy' : 'none';
		},
		[canInsertAsset],
	);

	const onAssetDrop = useCallback(
		async (event: DragEvent) => {
			const timeline = timelineVerticalScroll.current;
			const {dataTransfer} = event;
			if (
				timeline === null ||
				dataTransfer === null ||
				!isAssetDrag(dataTransfer) ||
				!isEventInsideElement(event, timeline)
			) {
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

			const dragData = parseAssetDragData(
				dataTransfer.getData(ASSET_DRAG_MIME_TYPE),
			);
			if (dragData === null) {
				return;
			}

			const scrollable = scrollableRef.current;
			const frame =
				scrollable !== null && isEventInsideElement(event, scrollable)
					? getFrameFromTimelineDrop({
							clientX: event.clientX,
							durationInFrames: videoConfig.durationInFrames,
							scrollLeft: scrollable.scrollLeft,
							timelineLeft: scrollable.getBoundingClientRect().left,
							timelineWidth: scrollable.scrollWidth,
						})
					: timelinePosition;

			setIsAddingAsset(true);
			try {
				await insertExistingAssets({
					assetPaths: [dragData.assetPath],
					compositionFile,
					compositionId: currentCompositionId,
					destinationDimensions: null,
					dropPosition: null,
					fps: videoConfig.fps,
					from: frame,
				});
			} finally {
				setIsAddingAsset(false);
			}
		},
		[
			canInsertAsset,
			compositionComponentInfo?.canAddSequence,
			compositionFile,
			currentCompositionId,
			timelinePosition,
			videoConfig,
		],
	);

	useEffect(() => {
		document.addEventListener('dragover', onAssetDragOver, {capture: true});
		document.addEventListener('drop', onAssetDrop, {capture: true});

		return () => {
			document.removeEventListener('dragover', onAssetDragOver, {
				capture: true,
			});
			document.removeEventListener('drop', onAssetDrop, {capture: true});
		};
	}, [onAssetDragOver, onAssetDrop]);
};
