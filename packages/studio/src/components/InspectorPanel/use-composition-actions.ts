import type {InsertCompositionElementRequest} from '@remotion/studio-shared';
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type MouseEvent,
} from 'react';
import {Internals, type _InternalTypes} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {getRelativeFileLocation} from '../../helpers/format-file-location';
import {getCodexAnnotation} from '../../helpers/get-codex-annotation';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {
	loadCompositionComponentInfo,
	useCachedCompositionComponentInfo,
} from '../../helpers/open-in-editor';
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
import {getCurrentFrame} from '../Timeline/imperative-state';
import {getOriginalLocationFromStack} from '../Timeline/TimelineStack/get-stack';
import {useResolvedStack} from '../Timeline/use-resolved-stack';

export const useCompositionActions = () => {
	const {compositions, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const currentVideoConfig = Internals.useUnsafeVideoConfig();
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
	const knownCompositionFile =
		resolvedCompositionLocation?.source ??
		(currentCompositionId && browserStudioOperations
			? browserStudioOperations.getCompositionFile(currentCompositionId)
			: null);
	const compositionComponentInfo = useCachedCompositionComponentInfo({
		compositionFile: knownCompositionFile,
		compositionId: currentCompositionId,
	});
	const insertionTargetRef = useRef({
		currentCompositionId,
		videoConfig: currentVideoConfig,
	});
	insertionTargetRef.current = {
		currentCompositionId,
		videoConfig: currentVideoConfig,
	};
	useEffect(() => {
		return () => {
			insertionTargetRef.current = {
				currentCompositionId: null,
				videoConfig: null,
			};
		};
	}, []);
	const canAddToComposition =
		compositionComponentInfo?.canAddSequence !== false &&
		currentCompositionId !== null;

	const canShowInsertSolid =
		(previewInteractive || browserStudioCanInsertSolid) &&
		(!window.remotion_isReadOnlyStudio || browserStudioCanInsertSolid);
	const canInsertSolid =
		canShowInsertSolid && canAddToComposition && !isAddingSolid;
	const canShowInsertText = canShowInsertSolid;
	const canInsertText =
		canShowInsertText && canAddToComposition && !isAddingText;

	const canShowInsertAsset =
		previewInteractive && !window.remotion_isReadOnlyStudio;
	const canInsertAsset =
		canShowInsertAsset && canAddToComposition && !isAddingAsset;
	const canShowInsertComposition = canShowInsertAsset;
	const canInsertComposition =
		canShowInsertComposition && canAddToComposition && !isAddingComposition;
	const canShowGenerateWithAgent =
		browserStudioOperations === null &&
		!window.remotion_isReadOnlyStudio &&
		(previewInteractive || getCodexAnnotation() !== null) &&
		currentCompositionId !== null;

	const resolveInsertionTarget = useCallback(async () => {
		if (currentCompositionId === null) {
			throw new Error('Select a composition before adding an element.');
		}

		const resolvedFile =
			knownCompositionFile ??
			(currentComposition?.stack
				? (
						await getOriginalLocationFromStack(
							currentComposition.stack,
							'sequence',
						)
					)?.source
				: null);
		if (!resolvedFile) {
			throw new Error('Could not find the source file for this composition.');
		}

		const info = await loadCompositionComponentInfo({
			compositionFile: resolvedFile,
			compositionId: currentCompositionId,
		});
		const target = insertionTargetRef.current;
		if (target.currentCompositionId !== currentCompositionId) {
			throw new Error('The selected composition changed. Please try again.');
		}

		if (!info.canAddSequence) {
			throw new Error(
				'This composition does not support adding elements in Studio. Edit its source code instead.',
			);
		}

		if (target.videoConfig === null) {
			throw new Error('The composition is still loading. Please try again.');
		}

		return {compositionFile: resolvedFile, videoConfig: target.videoConfig};
	}, [knownCompositionFile, currentComposition, currentCompositionId]);

	const insertSolid = useCallback(async () => {
		if (!canInsertSolid || currentCompositionId === null) {
			return;
		}

		setIsAddingSolid(true);
		try {
			const {compositionFile, videoConfig} = await resolveInsertionTarget();
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
		currentCompositionId,
		resolveInsertionTarget,
	]);

	const insertText = useCallback(async () => {
		if (!canInsertText || currentCompositionId === null) {
			return;
		}

		setIsAddingText(true);
		try {
			const {compositionFile, videoConfig} = await resolveInsertionTarget();
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
		currentCompositionId,
		resolveInsertionTarget,
	]);

	const onFilesSelected = useCallback(
		async (from: number) => {
			if (!canInsertAsset || currentCompositionId === null) {
				return;
			}

			setIsAddingAsset(true);
			try {
				const {compositionFile, videoConfig} = await resolveInsertionTarget();
				const files = await pickFilesToImport();
				if (files.length === 0) {
					return;
				}

				await importAssets({
					files,
					fps: videoConfig.fps,
					compositionFile,
					compositionId: currentCompositionId,
					destinationDimensions: null,
					dropPosition: null,
					from,
					preferCompositionStart: true,
					svgImportMode: 'image',
				});
			} catch (err) {
				showNotification((err as Error).message, 4000);
			} finally {
				setIsAddingAsset(false);
			}
		},
		[canInsertAsset, currentCompositionId, resolveInsertionTarget],
	);

	const onAssetSelected = useCallback(
		async (asset: {readonly name: string}, from: number) => {
			if (!canInsertAsset || currentCompositionId === null) {
				return;
			}

			setIsAddingAsset(true);
			try {
				const {compositionFile, videoConfig} = await resolveInsertionTarget();
				await insertExistingAssets({
					assetPaths: [asset.name],
					fps: videoConfig.fps,
					compositionFile,
					compositionId: currentCompositionId,
					destinationDimensions: null,
					dropPosition: null,
					from,
					preferCompositionStart: true,
				});
			} catch (err) {
				showNotification((err as Error).message, 4000);
			} finally {
				setIsAddingAsset(false);
			}
		},
		[canInsertAsset, currentCompositionId, resolveInsertionTarget],
	);

	const insertAsset = useCallback(async () => {
		if (!canInsertAsset) {
			return;
		}

		setIsAddingAsset(true);
		try {
			await resolveInsertionTarget();
			const from = getCurrentFrame();
			setSelectedModal({
				type: 'quick-switcher',
				mode: 'assets',
				invocationTimestamp: Date.now(),
				assetSelection: {
					initialQuery: '',
					fileTypes: null,
					onSelectFile: () => {
						onFilesSelected(from).catch(() => undefined);
					},
					onSelected: (asset) => {
						onAssetSelected(asset, from).catch(() => undefined);
					},
				},
				compositionSelection: null,
			});
		} catch (err) {
			showNotification((err as Error).message, 4000);
		} finally {
			setIsAddingAsset(false);
		}
	}, [
		canInsertAsset,
		onAssetSelected,
		onFilesSelected,
		setSelectedModal,
		resolveInsertionTarget,
	]);

	const onCompositionSelected = useCallback(
		async (composition: _InternalTypes['AnyComposition']) => {
			if (!canInsertComposition || currentCompositionId === null) {
				return;
			}

			setIsAddingComposition(true);
			try {
				const {compositionFile} = await resolveInsertionTarget();
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
			currentCompositionId,
			resolveInsertionTarget,
		],
	);

	const insertComposition = useCallback(async () => {
		if (!canInsertComposition) {
			return;
		}

		setIsAddingComposition(true);
		try {
			await resolveInsertionTarget();
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
		} catch (err) {
			showNotification((err as Error).message, 4000);
		} finally {
			setIsAddingComposition(false);
		}
	}, [
		canInsertComposition,
		currentCompositionId,
		onCompositionSelected,
		setSelectedModal,
		resolveInsertionTarget,
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
