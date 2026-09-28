import type {Size} from '@remotion/player';
import React, {useCallback, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {writeStaticFile} from '../api/write-static-file';
import type {OnRetry} from '../error-overlay/remotion-overlay/ErrorDisplay';
import {ErrorLoader} from '../error-overlay/remotion-overlay/ErrorLoader';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BACKGROUND, WHITE} from '../helpers/colors';
import {getRoute} from '../helpers/url-state';
import {useResponsiveSidebarStatus} from '../helpers/use-responsive-sidebar-status';
import {BrowseElementsIcon} from '../icons/browse-elements';
import {SearchIcon} from '../icons/search';
import {UploadIcon} from '../icons/upload';
import {FilmIcon} from '../icons/video';
import {CompositionListContext} from '../state/composition-list';
import {SetSelectedModalContext} from '../state/modals';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {Canvas} from './Canvas';
import {canvasTabsRef} from './CanvasTabsRef';
import {FramePersistor} from './FramePersistor';
import {pickFilesToImport} from './import-assets';
import {
	InspectorQuickAction,
	inspectorActionIconStyle,
} from './InspectorPanel/common';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {showNotification} from './Notifications/NotificationCenter';
import {RefreshCompositionOverlay} from './RefreshCompositionOverlay';
import {RenderErrorContext} from './RenderErrorContext';
import {
	RunningCalculateMetadata,
	loaderLabel,
} from './RunningCalculateMetadata';
import {getCurrentFrame} from './Timeline/imperative-state';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {useSelectAsset} from './use-select-asset';
import {useStaticFiles} from './use-static-files';
import {ZoomPersistor} from './ZoomPersistor';

const container: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	display: 'flex',
	backgroundColor: BACKGROUND,
	flexDirection: 'column',
};

const welcomeActions: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	padding: '4px 0',
	width: 220,
};

const WelcomeActions: React.FC = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {compositions} = useContext(Internals.CompositionManager);
	const leftSidebarStatus = useResponsiveSidebarStatus();
	const selectAsset = useSelectAsset();
	const staticFiles = useStaticFiles();
	const canMutateProject =
		getBrowserStudioOperations() !== null ||
		(previewServerState.type === 'connected' &&
			!window.remotion_isReadOnlyStudio);

	const newComposition = useCallback(() => {
		setSelectedModal({
			type: 'new-comp',
			folderName: null,
			parentName: null,
			stack: null,
			canvasCapture: null,
		});
	}, [setSelectedModal]);

	const importFiles = useCallback(
		async (files: File[]) => {
			const differentExistingFile = files.find((file) => {
				return staticFiles.some(
					(staticFile) =>
						staticFile.name === file.name &&
						staticFile.sizeInBytes !== file.size,
				);
			});
			if (differentExistingFile) {
				showNotification(
					`File with name ${differentExistingFile.name} already exists and is different`,
					4000,
				);
				return;
			}

			for (const file of files) {
				await writeStaticFile({
					contents: await file.arrayBuffer(),
					filePath: file.name,
				});
			}

			if (files.length > 1 && files.length <= 5) {
				canvasTabsRef.current?.openTabs(
					files.map((file) => ({type: 'asset', asset: file.name})),
				);
			}

			selectAsset(files[0].name);
			showNotification(
				files.length === 1
					? `Uploaded ${files[0].name} to public folder`
					: `Uploaded ${files.length} assets to public folder`,
				3000,
			);
		},
		[selectAsset, staticFiles],
	);

	const importAsset = useCallback(async () => {
		try {
			const files = await pickFilesToImport();
			if (files.length === 0) {
				return;
			}

			await importFiles(files);
		} catch (error) {
			showNotification(`Error during upload: ${error}`, 3000);
		}
	}, [importFiles]);

	const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			if (
				!canMutateProject ||
				!Array.from(event.dataTransfer.types).includes('Files')
			) {
				return;
			}

			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		},
		[canMutateProject],
	);

	const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
		async (event) => {
			if (
				!canMutateProject ||
				!Array.from(event.dataTransfer.types).includes('Files')
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			const files = Array.from(event.dataTransfer.files);
			if (files.length === 0) {
				return;
			}

			try {
				await importFiles(files);
			} catch (error) {
				showNotification(`Error during upload: ${error}`, 3000);
			}
		},
		[canMutateProject, importFiles],
	);

	const browseElements = useCallback(() => {
		setSelectedModal({
			type: 'element-library',
			name: 'Remotion Elements',
			url: 'https://www.remotion.dev/elements',
		});
	}, [setSelectedModal]);

	const openComposition = useCallback(() => {
		setSelectedModal({
			type: 'quick-switcher',
			mode: 'compositions',
			invocationTimestamp: Date.now(),
			assetSelection: null,
			compositionSelection: null,
		});
	}, [setSelectedModal]);

	return (
		<div
			style={container}
			className="css-reset"
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<div style={welcomeActions}>
				{leftSidebarStatus === 'collapsed' && compositions.length > 0 ? (
					<InspectorQuickAction
						disabled={false}
						onClick={openComposition}
						renderIcon={(color) => (
							<SearchIcon color={color} style={inspectorActionIconStyle} />
						)}
					>
						Open composition
					</InspectorQuickAction>
				) : null}
				<InspectorQuickAction
					disabled={!canMutateProject}
					onClick={newComposition}
					renderIcon={(color) => (
						<FilmIcon color={color} style={inspectorActionIconStyle} />
					)}
				>
					New composition
				</InspectorQuickAction>
				<InspectorQuickAction
					disabled={!canMutateProject}
					onClick={importAsset}
					renderIcon={(color) => (
						<UploadIcon color={color} style={inspectorActionIconStyle} />
					)}
				>
					Import asset
				</InspectorQuickAction>
				<InspectorQuickAction
					disabled={false}
					onClick={browseElements}
					renderIcon={(color) => (
						<BrowseElementsIcon
							color={color}
							style={inspectorActionIconStyle}
						/>
					)}
				>
					Browse Elements
				</InspectorQuickAction>
			</div>
		</div>
	);
};

export const CanvasOrLoading: React.FC<{
	readonly size: Size;
}> = ({size}) => {
	const resolved = Internals.useResolvedVideoConfig(null);
	const {setZoom} = useContext(TimelineZoomCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {compositionListState} = useContext(CompositionListContext);
	const {error: renderError} = useContext(RenderErrorContext);

	useEffect(() => {
		if (
			resolved?.type !== 'success' &&
			resolved?.type !== 'success-and-refreshing'
		) {
			return;
		}

		const c = resolved.result;

		setTimeout(() => {
			ensureFrameIsInViewport({
				direction: 'center',
				frame: getCurrentFrame(),
				durationInFrames: c.durationInFrames,
			});
		});
	}, [resolved, setZoom]);

	if (renderError) {
		return (
			<ErrorLoading
				error={renderError}
				calculateMetadataContext={false}
				onRetry={null}
			/>
		);
	}

	if (!canvasContent) {
		if (compositionListState !== 'ready') {
			return null;
		}

		const route = getRoute();
		if (route === '' || route === '/') {
			return <WelcomeActions />;
		}

		return (
			<div style={container} className="css-reset">
				<div style={loaderLabel}>
					Composition with ID {decodeURIComponent(route.substring(1))} not
					found.
				</div>
			</div>
		);
	}

	const content = (
		<>
			<ZoomPersistor />
			<Canvas size={size} canvasContent={canvasContent} />
			{resolved?.type === 'success-and-refreshing' ? (
				<RefreshCompositionOverlay />
			) : null}
		</>
	);
	if (canvasContent.type === 'output' || canvasContent.type === 'output-blob') {
		return content;
	}

	if (canvasContent.type === 'asset' && resolved === null) {
		return content;
	}

	if (!resolved) {
		return null;
	}

	if (resolved.type === 'loading') {
		return (
			<div style={container} className="css-reset">
				<RunningCalculateMetadata />
			</div>
		);
	}

	if (resolved.type === 'error') {
		return (
			<ErrorLoading
				error={resolved.error}
				calculateMetadataContext
				onRetry={() =>
					Internals.resolveCompositionsRef.current?.reloadCurrentlySelectedComposition()
				}
			/>
		);
	}

	return (
		<>
			<FramePersistor /> {content}
		</>
	);
};

const loaderContainer: React.CSSProperties = {
	marginLeft: 'auto',
	marginRight: 'auto',
	width: '100%',
	position: 'absolute',
	height: '100%',
	overflowY: 'auto',
};

const ErrorLoading: React.FC<{
	readonly error: Error;
	readonly calculateMetadataContext: boolean;
	readonly onRetry: OnRetry;
}> = ({error, calculateMetadataContext, onRetry}) => {
	return (
		<div style={loaderContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<ErrorLoader
				key={error.stack}
				canHaveDismissButton={false}
				keyboardShortcuts
				error={error}
				onRetry={onRetry}
				calculateMetadata={calculateMetadataContext}
			/>
		</div>
	);
};
