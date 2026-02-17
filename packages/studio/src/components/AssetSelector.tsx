import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {writeStaticFile} from '../api/write-static-file';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BACKGROUND, CLEAR_HOVER, LIGHT_TEXT} from '../helpers/colors';
import {buildAssetFolderStructure} from '../helpers/create-folder-tree';
import type {ExpandedFoldersState} from '../helpers/persist-open-folders';
import {persistExpandedFolders} from '../helpers/persist-open-folders';
import useAssetDragEvents from '../helpers/use-asset-drag-events';
import {FolderContext} from '../state/folders';
import {useZIndex} from '../state/z-index';
import {AssetFolderTree} from './AssetSelectorItem';
import {CURRENT_ASSET_HEIGHT, CurrentAsset} from './CurrentAsset';
import {inlineCodeSnippet} from './Menu/styles';
import {showNotification} from './Notifications/NotificationCenter';
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
};

export const AssetSelector: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {tabIndex} = useZIndex();
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {assetFoldersExpanded, setAssetFoldersExpanded} =
		useContext(FolderContext);
	const [dropLocation, setDropLocation] = useState<string | null>(null);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const shouldAllowUpload = connectionStatus === 'connected' && !readOnlyStudio;

	const showCurrentAsset = canvasContent?.type === 'asset';

	const list: React.CSSProperties = useMemo(() => {
		return {
			...baseList,
			height: showCurrentAsset
				? `calc(100% - ${CURRENT_ASSET_HEIGHT}px)`
				: '100%',
		};
	}, [showCurrentAsset]);

	const staticFiles = useStaticFiles();
	const publicFolderExists = window.remotion_publicFolderExists;

	const assetTree = useMemo(() => {
		return buildAssetFolderStructure(staticFiles, null, assetFoldersExpanded);
	}, [assetFoldersExpanded, staticFiles]);

	const toggleFolder = useCallback(
		(folderName: string, parentName: string | null) => {
			setAssetFoldersExpanded((p) => {
				const key = [parentName, folderName].filter(Boolean).join('/');

				const prev = p[key] ?? false;
				const foldersExpandedState: ExpandedFoldersState = {
					...p,
					[key]: !prev,
				};
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
			e.preventDefault();
		},
		[],
	);

	const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
		async (e) => {
			try {
				e.preventDefault();
				e.stopPropagation();
				const {files} = e.dataTransfer;
				const assetPath = dropLocation ?? null;

				const makePath = (file: File) => {
					return [assetPath, file.name].filter(Boolean).join('/');
				};

				for (const file of files) {
					const body = await file.arrayBuffer();
					await writeStaticFile({
						contents: body,
						filePath: makePath(file),
					});
				}

				if (files.length === 1) {
					showNotification(`Created ${makePath(files[0])}`, 3000);
				} else {
					showNotification(`Added ${files.length} files to ${assetPath}`, 3000);
				}
			} catch (error) {
				showNotification(`Error during upload: ${error}`, 3000);
			} finally {
				setDropLocation(null);
			}
		},
		[dropLocation],
	);

	return (
		<div
			style={container}
			onDragOver={shouldAllowUpload ? onDragOver : undefined}
			onDrop={shouldAllowUpload ? onDrop : undefined}
		>
			{showCurrentAsset ? <CurrentAsset /> : null}
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
						backgroundColor: isDropDiv ? CLEAR_HOVER : BACKGROUND,
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
					/>
				</div>
			)}
		</div>
	);
};
