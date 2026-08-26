import React, {useCallback, useContext, useMemo, useState} from 'react';
import {copyRenderOutputToAsset} from '../api/copy-render-output-to-asset';
import {writeStaticFile} from '../api/write-static-file';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BACKGROUND, WHITE_ALPHA_06, LIGHT_TEXT} from '../helpers/colors';
import {buildAssetFolderStructure} from '../helpers/create-folder-tree';
import {toggleBooleanMapKey} from '../helpers/persist-boolean-map';
import {persistExpandedFolders} from '../helpers/persist-open-folders';
import useAssetDragEvents, {
	getRenderOutputDragData,
	isAssetUploadDragEvent,
} from '../helpers/use-asset-drag-events';
import {FolderContext} from '../state/folders';
import {useZIndex} from '../state/z-index';
import {AssetFolderTree} from './AssetSelectorItem';
import {pickFilesToImport} from './import-assets';
import {inlineCodeSnippet} from './Menu/styles';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {ExplorerQuickSwitcherTrigger} from './QuickSwitcher/ExplorerQuickSwitcherTrigger';
import {useStaticFiles} from './use-static-files';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	overflow: 'hidden',
	backgroundColor: BACKGROUND,
};

// Some redundancy with packages/cli/src/editor/components/RenderModal/SchemaEditor/SchemaErrorMessages.tsx
const emptyState: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
	padding: '0 12px',
};

const label: React.CSSProperties = {
	color: LIGHT_TEXT,
	lineHeight: 1.5,
	fontSize: 14,
};

const baseList: React.CSSProperties = {
	overflowY: 'auto',
	paddingTop: 4,
	paddingBottom: 4,
};

export const AssetSelector: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {tabIndex} = useZIndex();
	const {assetFoldersExpanded, setAssetFoldersExpanded} =
		useContext(FolderContext);
	const [dropLocation, setDropLocation] = useState<string | null>(null);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const shouldAllowUpload =
		getBrowserStudioOperations() !== null ||
		(connectionStatus === 'connected' && !readOnlyStudio);

	const list: React.CSSProperties = useMemo(() => {
		return {
			...baseList,
			height: '100%',
		};
	}, []);

	const staticFiles = useStaticFiles();
	const publicFolderExists = window.remotion_publicFolderExists;

	const assetTree = useMemo(() => {
		return buildAssetFolderStructure(staticFiles, null, assetFoldersExpanded);
	}, [assetFoldersExpanded, staticFiles]);
	const writeFilesToPublicFolder = useCallback(
		async ({files, assetPath}: {files: File[]; assetPath: string | null}) => {
			const makePath = (file: File) => {
				return [assetPath, file.name].filter(Boolean).join('/');
			};

			const differentExistingFile = files.find((file) => {
				const filePath = makePath(file);
				return staticFiles.some(
					(staticFile) =>
						staticFile.name === filePath &&
						staticFile.sizeInBytes !== file.size,
				);
			});
			if (differentExistingFile) {
				showNotification(
					`File with name ${makePath(
						differentExistingFile,
					)} already exists and is different`,
					4000,
				);
				return;
			}

			for (const file of files) {
				const body = await file.arrayBuffer();
				await writeStaticFile({
					contents: body,
					filePath: makePath(file),
				});
			}
		},
		[staticFiles],
	);

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			setAssetFoldersExpanded((p) => {
				const key = [parentName, folderName].filter(Boolean).join('/');
				const foldersExpandedState = toggleBooleanMapKey(p, key);
				persistExpandedFolders('assets', foldersExpandedState);
				return foldersExpandedState;
			});
		},
		[setAssetFoldersExpanded],
	);

	const {isDropDiv, onDragEnter, onDragLeave} = useAssetDragEvents({
		name: null,
		parentFolder: null,
		dropLocation,
		setDropLocation,
	});
	const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			if (!isAssetUploadDragEvent(e)) {
				return;
			}

			e.preventDefault();
		},
		[],
	);

	const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
		async (e) => {
			try {
				if (!isAssetUploadDragEvent(e)) {
					setDropLocation(null);
					return;
				}

				e.preventDefault();
				e.stopPropagation();
				const assetPath = dropLocation ?? null;
				const renderOutput = getRenderOutputDragData(e.dataTransfer);
				if (renderOutput) {
					const destination = [assetPath, renderOutput.fileName]
						.filter(Boolean)
						.join('/');
					const result = await copyRenderOutputToAsset({
						outputPath: renderOutput.outputPath,
						assetPath: destination,
					});
					if (!result.created) {
						showNotification(`${destination} already exists`, 3000);
					}

					return;
				}

				const files = Array.from(e.dataTransfer.files);
				if (files.length === 0) {
					setDropLocation(null);
					return;
				}

				await writeFilesToPublicFolder({files, assetPath});
			} catch (error) {
				showNotification(`Error during upload: ${error}`, 3000);
			} finally {
				setDropLocation(null);
			}
		},
		[dropLocation, writeFilesToPublicFolder],
	);
	const uploadAssets = useCallback(async () => {
		try {
			const files = await pickFilesToImport();
			await writeFilesToPublicFolder({files, assetPath: null});
		} catch (error) {
			showNotification(`Error during upload: ${error}`, 3000);
		}
	}, [writeFilesToPublicFolder]);
	const getAssetActions = useCallback((): ComboboxValue[] => {
		return [
			{
				id: 'upload-assets',
				keyHint: null,
				label: 'Upload...',
				leftItem: null,
				onClick: uploadAssets,
				quickSwitcherLabel: 'Upload assets...',
				subMenu: null,
				type: 'item',
				value: 'upload-assets',
				disabled: !shouldAllowUpload,
			},
		];
	}, [shouldAllowUpload, uploadAssets]);

	return (
		<div
			data-asset-selector
			style={container}
			onDragOver={shouldAllowUpload ? onDragOver : undefined}
			onDrop={shouldAllowUpload ? onDrop : undefined}
		>
			<ExplorerQuickSwitcherTrigger
				mode="assets"
				showShortcut
				tabIndex={tabIndex}
				getActions={getAssetActions}
			/>
			{staticFiles.length === 0 ? (
				publicFolderExists ? (
					<div style={emptyState}>
						<div style={label}>
							To add assets, place a file in the{' '}
							<code style={inlineCodeSnippet}>public</code> folder of your
							project or drag and drop a file here.
						</div>
					</div>
				) : (
					<div style={emptyState}>
						<div style={label}>
							To add assets, create a folder called{' '}
							<code style={inlineCodeSnippet}>public</code> in the root of your
							project and place a file in it.
						</div>
					</div>
				)
			) : (
				<div
					className="__remotion-vertical-scrollbar"
					style={{
						...list,
						backgroundColor: isDropDiv ? WHITE_ALPHA_06 : BACKGROUND,
					}}
					onDragEnter={onDragEnter}
					onDragLeave={onDragLeave}
				>
					<AssetFolderTree
						item={assetTree}
						level={0}
						parentFolder={null}
						name={null}
						tabIndex={tabIndex}
						toggleFolder={toggleFolder}
						dropLocation={dropLocation}
						setDropLocation={setDropLocation}
						readOnlyStudio={readOnlyStudio}
					/>
				</div>
			)}
		</div>
	);
};
