import {
	ASSET_DRAG_MIME_TYPE,
	parseAssetDragData,
} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {insertExistingAssets} from '../import-assets';
import {showNotification} from '../Notifications/NotificationCenter';
import {getFrameFromTimelineDrop} from './timeline-scroll-logic';
import {useResolvedStack} from './use-resolved-stack';

const isAssetDrag = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).includes(ASSET_DRAG_MIME_TYPE);
};

export const useTimelineAssetDrop = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
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

	const onAssetDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			if (!isAssetDrag(event.dataTransfer)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = canInsertAsset ? 'copy' : 'none';
		},
		[canInsertAsset],
	);

	const onAssetDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
		async (event) => {
			if (!isAssetDrag(event.dataTransfer)) {
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
				event.dataTransfer.getData(ASSET_DRAG_MIME_TYPE),
			);
			if (dragData === null) {
				return;
			}

			const timeline = event.currentTarget;
			const frame = getFrameFromTimelineDrop({
				clientX: event.clientX,
				durationInFrames: videoConfig.durationInFrames,
				scrollLeft: timeline.scrollLeft,
				timelineLeft: timeline.getBoundingClientRect().left,
				timelineWidth: timeline.scrollWidth,
			});

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
			videoConfig,
		],
	);

	return {onAssetDragOver, onAssetDrop};
};
