import {DragAndDropInternals} from '@remotion/drag-and-drop';
import type {InsertJsxElementRequest} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo, useState} from 'react';
import {Internals, type _InternalTypes} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {ModalsContext} from '../../state/modals';
import {callApi} from '../call-api';
import {
	importAssets,
	insertComposition as insertCompositionFromDrop,
	pickFilesToImport,
} from '../import-assets';
import {showNotification} from '../Notifications/NotificationCenter';
import {getOriginalLocationFromStack} from '../Timeline/TimelineStack/get-stack';
import {useResolvedStack} from '../Timeline/use-resolved-stack';

export const useCompositionActions = () => {
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [isAddingSolid, setIsAddingSolid] = useState(false);
	const [isAddingAsset, setIsAddingAsset] = useState(false);
	const [isAddingComposition, setIsAddingComposition] = useState(false);
	const {setSelectedModal} = useContext(ModalsContext);
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
		(currentCompositionId
			? (browserStudioOperations?.getCompositionFile(currentCompositionId) ??
				null)
			: null);
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile,
		compositionId: currentCompositionId,
	});

	const canShowInsertSolid =
		(previewInteractive || browserStudioCanInsertSolid) &&
		(!window.remotion_isReadOnlyStudio || browserStudioCanInsertSolid) &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		videoConfig !== null;
	const canInsertSolid = canShowInsertSolid && !isAddingSolid;

	const canShowInsertAsset =
		previewInteractive &&
		!window.remotion_isReadOnlyStudio &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null;
	const canInsertAsset = canShowInsertAsset && !isAddingAsset;
	const canShowInsertComposition = canShowInsertAsset;
	const canInsertComposition = canShowInsertComposition && !isAddingComposition;

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
				showNotification('Added <Solid> to source file', 2000);
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
				svgImportMode: 'image',
			});
		} finally {
			setIsAddingAsset(false);
		}
	}, [canInsertAsset, compositionFile, currentCompositionId, videoConfig]);

	const onCompositionSelected = useCallback(
		async (composition: _InternalTypes['AnyComposition']) => {
			if (
				!canInsertComposition ||
				currentCompositionId === null ||
				compositionFile === null
			) {
				return;
			}

			setIsAddingComposition(true);
			try {
				const resolvedLocation = composition.stack
					? await getOriginalLocationFromStack(composition.stack, 'sequence')
					: null;
				const selectedCompositionFile =
					resolvedLocation?.source ??
					browserStudioOperations?.getCompositionFile(composition.id) ??
					null;
				const compositionDragData = DragAndDropInternals.makeDragData({
					type: 'composition',
					compositionFile: selectedCompositionFile,
					compositionId: composition.id,
					width: composition.width ?? null,
					height: composition.height ?? null,
					durationInFrames: composition.durationInFrames ?? null,
				}).data;

				await insertCompositionFromDrop({
					composition: compositionDragData,
					compositionFile,
					compositionId: currentCompositionId,
					dropPosition: null,
					from: null,
				});
			} catch (error) {
				showNotification(
					`Could not add composition: ${
						error instanceof Error ? error.message : String(error)
					}`,
					4000,
				);
			} finally {
				setIsAddingComposition(false);
			}
		},
		[
			browserStudioOperations,
			canInsertComposition,
			compositionFile,
			currentCompositionId,
		],
	);

	const insertComposition = useCallback(() => {
		if (!canInsertComposition) {
			return;
		}

		setSelectedModal({
			type: 'quick-switcher',
			mode: 'compositions',
			invocationTimestamp: Date.now(),
			assetSelection: null,
			compositionSelection: {
				excludeCompositionId: currentCompositionId,
				onSelected: onCompositionSelected,
			},
		});
	}, [
		canInsertComposition,
		currentCompositionId,
		onCompositionSelected,
		setSelectedModal,
	]);

	return {
		canInsertAsset,
		canInsertComposition,
		canInsertSolid,
		canShowInsertAsset,
		canShowInsertComposition,
		canShowInsertSolid,
		insertAsset,
		insertComposition,
		insertSolid,
	};
};
