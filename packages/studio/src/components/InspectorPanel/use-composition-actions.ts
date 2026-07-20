import {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {callApi} from '../call-api';
import {importAssets, pickFilesToImport} from '../import-assets';
import {showNotification} from '../Notifications/NotificationCenter';
import {useResolvedStack} from '../Timeline/use-resolved-stack';

export const useCompositionActions = () => {
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

	const canShowInsertSolid =
		previewInteractive &&
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
				destinationDimensions: null,
				dropPosition: null,
			});
		} finally {
			setIsAddingAsset(false);
		}
	}, [canInsertAsset, compositionFile, currentCompositionId]);

	return {
		canInsertAsset,
		canInsertSolid,
		canShowInsertAsset,
		canShowInsertSolid,
		insertAsset,
		insertSolid,
	};
};
