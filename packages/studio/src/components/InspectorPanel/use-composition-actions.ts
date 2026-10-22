import type {InsertCompositionElementRequest} from '@remotion/studio-shared';
import {
	useCallback,
	useContext,
	useMemo,
	useState,
	type MouseEvent,
} from 'react';
import {Internals, type _InternalTypes} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {getRelativeFileLocation} from '../../helpers/format-file-location';
import {getCodexAnnotation} from '../../helpers/get-codex-annotation';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useCachedCompositionComponentInfo} from '../../helpers/open-in-editor';
import {requestCodexAnnotation} from '../../helpers/request-codex-annotation';
import {SetSelectedModalContext} from '../../state/modals';
import {callApi} from '../call-api';
import type {CompositionDragData} from '../composition-drag-data';
import {
	importAssets,
	insertComposition as insertCompositionFromDrop,
	insertExistingAssets,
	pickFilesToImport,
} from '../import-assets';
import {showNotification} from '../Notifications/NotificationCenter';
import {useSettings} from '../SettingsContext';
import {getOriginalLocationFromStack} from '../Timeline/TimelineStack/get-stack';
import {useResolvedStack} from '../Timeline/use-resolved-stack';

export const useCompositionActions = () => {
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const videoConfig = Internals.useUnsafeVideoConfig();
	const [isAddingSolid, setIsAddingSolid] = useState(false);
	const [isAddingText, setIsAddingText] = useState(false);
	const [isAddingAsset, setIsAddingAsset] = useState(false);
	const [isAddingComposition, setIsAddingComposition] = useState(false);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {remotionSkillsInfo} = useSettings();
	const markupSkill = remotionSkillsInfo?.skills.find(
		({name}) => name === 'remotion-markup',
	);
	const markupSkillAvailable = Boolean(
		markupSkill?.installedInProject || markupSkill?.installedGlobally,
	);
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

	const canShowInsertSolid =
		(previewInteractive || browserStudioCanInsertSolid) &&
		(!window.remotion_isReadOnlyStudio || browserStudioCanInsertSolid) &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null &&
		videoConfig !== null;
	const canInsertSolid = canShowInsertSolid && !isAddingSolid;
	const canShowInsertText = canShowInsertSolid;
	const canInsertText = canShowInsertText && !isAddingText;

	const canShowInsertAsset =
		previewInteractive &&
		!window.remotion_isReadOnlyStudio &&
		compositionComponentInfo?.canAddSequence === true &&
		currentCompositionId !== null &&
		compositionFile !== null;
	const canInsertAsset = canShowInsertAsset && !isAddingAsset;
	const canShowInsertComposition = canShowInsertAsset && videoConfig !== null;
	const canInsertComposition = canShowInsertComposition && !isAddingComposition;
	const canShowGenerateWithAgent =
		browserStudioOperations === null &&
		!window.remotion_isReadOnlyStudio &&
		(previewInteractive || getCodexAnnotation() !== null) &&
		currentCompositionId !== null;

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

	const insertText = useCallback(async () => {
		if (
			!canInsertText ||
			currentCompositionId === null ||
			compositionFile === null ||
			videoConfig === null
		) {
			return;
		}

		setIsAddingText(true);
		try {
			const fontSize = Math.max(
				1,
				Math.round(Math.min(videoConfig.width, videoConfig.height) * 0.075),
			);
			const preview = Internals.portalNode();
			const previewRect = preview.getBoundingClientRect();
			if (previewRect.width === 0 || previewRect.height === 0) {
				throw new Error(
					'The composition preview is not ready for text insertion.',
				);
			}

			// Measure the text in the preview to account for its font metrics and zoom.
			const measurement = document.createElement('div');
			measurement.textContent = 'Text';
			Object.assign(measurement.style, {
				position: 'absolute',
				fontFamily: 'sans-serif',
				fontSize: `${fontSize}px`,
				visibility: 'hidden',
				pointerEvents: 'none',
			});
			preview.appendChild(measurement);
			let textRect: DOMRect;
			try {
				textRect = measurement.getBoundingClientRect();
			} finally {
				measurement.remove();
			}

			const scale = previewRect.width / videoConfig.width;
			const request: InsertCompositionElementRequest = {
				compositionFile,
				compositionId: currentCompositionId,
				from: null,
				element: {
					type: 'text',
					text: 'Text',
					fontSize,
					color: 'white',
					position: {
						x: (videoConfig.width - textRect.width / scale) / 2,
						y: (videoConfig.height - textRect.height / scale) / 2,
					},
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
			setIsAddingText(false);
		}
	}, [
		browserStudioOperations,
		canInsertText,
		compositionFile,
		currentCompositionId,
		videoConfig,
	]);

	const onFilesSelected = useCallback(async () => {
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

	const onAssetSelected = useCallback(
		async (asset: {readonly name: string}) => {
			if (
				!canInsertAsset ||
				currentCompositionId === null ||
				compositionFile === null ||
				videoConfig === null
			) {
				return;
			}

			setIsAddingAsset(true);
			try {
				await insertExistingAssets({
					assetPaths: [asset.name],
					fps: videoConfig.fps,
					compositionFile,
					compositionId: currentCompositionId,
					destinationDimensions: null,
					dropPosition: null,
					from: null,
					preferCompositionStart: null,
				});
			} finally {
				setIsAddingAsset(false);
			}
		},
		[canInsertAsset, compositionFile, currentCompositionId, videoConfig],
	);

	const insertAsset = useCallback(() => {
		if (!canInsertAsset) {
			return;
		}

		setSelectedModal({
			type: 'quick-switcher',
			mode: 'assets',
			invocationTimestamp: Date.now(),
			assetSelection: {
				initialQuery: '',
				fileTypes: null,
				onSelectFile: () => {
					onFilesSelected().catch(() => undefined);
				},
				onSelected: (asset) => {
					onAssetSelected(asset).catch(() => undefined);
				},
			},
			compositionSelection: null,
		});
	}, [canInsertAsset, onAssetSelected, onFilesSelected, setSelectedModal]);

	const onCompositionSelected = useCallback(
		async (composition: _InternalTypes['AnyComposition']) => {
			if (
				!canInsertComposition ||
				currentCompositionId === null ||
				compositionFile === null ||
				videoConfig === null
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
				const compositionDragData: CompositionDragData = {
					type: 'remotion-composition',
					version: 1,
					compositionFile: selectedCompositionFile,
					compositionId: composition.id,
				};

				await insertCompositionFromDrop({
					composition: compositionDragData,
					compositionFile,
					compositionId: currentCompositionId,
					dropPosition: null,
					from: null,
					preferCompositionStart: null,
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
			videoConfig,
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

	const generateWithAgent = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			if (!canShowGenerateWithAgent || currentCompositionId === null) {
				return;
			}

			const location = compositionComponentInfo?.location ?? null;
			if (markupSkillAvailable && getCodexAnnotation() !== null) {
				const sourceLocation = getRelativeFileLocation({
					location,
					root: window.remotion_cwd,
				});
				const metadata: Record<string, string | number> = {};
				if (currentCompositionId.length <= 256) {
					metadata.composition = currentCompositionId;
				}

				if (sourceLocation && sourceLocation.filename.length <= 256) {
					const withSource = {
						...metadata,
						source: sourceLocation.filename,
						line: sourceLocation.line,
					};
					if (
						new TextEncoder().encode(JSON.stringify(withSource)).length <= 2048
					) {
						metadata.source = sourceLocation.filename;
						metadata.line = sourceLocation.line;
					}
				}

				const accepted = requestCodexAnnotation({
					target: event.currentTarget,
					initialComment: '$remotion-markup',
					metadata,
				});
				if (accepted) {
					return;
				}
			}

			setSelectedModal({
				type: 'generate-with-agent',
				location,
			});
		},
		[
			canShowGenerateWithAgent,
			compositionComponentInfo,
			currentCompositionId,
			markupSkillAvailable,
			setSelectedModal,
		],
	);

	return {
		canInsertAsset,
		canInsertComposition,
		canInsertSolid,
		canInsertText,
		canShowInsertAsset,
		canShowInsertComposition,
		canShowInsertSolid,
		canShowInsertText,
		canShowGenerateWithAgent,
		insertAsset,
		insertComposition,
		insertSolid,
		insertText,
		generateWithAgent,
	};
};
