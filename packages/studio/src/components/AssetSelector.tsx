import React, {useCallback, useContext, useMemo, useState} from 'react';
import {writeStaticFile} from '../api/write-static-file';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BACKGROUND, WHITE_ALPHA_06, LIGHT_TEXT} from '../helpers/colors';
import {buildAssetFolderStructure} from '../helpers/create-folder-tree';
import {
	filterStaticFilesByQuery,
	getExpandedFoldersForFilteredAssets,
} from '../helpers/filter-static-files';
import {toggleBooleanMapKey} from '../helpers/persist-boolean-map';
import {persistExpandedFolders} from '../helpers/persist-open-folders';
import useAssetDragEvents, {
	isFileDragEvent,
} from '../helpers/use-asset-drag-events';
import {FolderContext} from '../state/folders';
import {useZIndex} from '../state/z-index';
import {AssetFolderTree} from './AssetSelectorItem';
import {inlineCodeSnippet} from './Menu/styles';
import {RemotionInput} from './NewComposition/RemInput';
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

const searchContainer: React.CSSProperties = {
	padding: '8px 10px',
	flexShrink: 0,
};

const searchInput: React.CSSProperties = {
	width: '100%',
};

const baseList: React.CSSProperties = {
	overflowY: 'auto',
};

export const AssetSelector: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {tabIndex} = useZIndex();
	const {assetFoldersExpanded, setAssetFoldersExpanded} =
		useContext(FolderContext);
	const [dropLocation, setDropLocation] = useState<string | null>(null);
	const [filterQuery, setFilterQuery] = useState('');
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const shouldAllowUpload = connectionStatus === 'connected' && !readOnlyStudio;

	const list: React.CSSProperties = useMemo(() => {
		return {
			...baseList,
			height: '100%',
		};
	}, []);

	const staticFiles = useStaticFiles();
	const publicFolderExists = window.remotion_publicFolderExists;
	const trimmedFilterQuery = filterQuery.trim();
	const filteredFiles = useMemo(() => {
		return filterStaticFilesByQuery(staticFiles, filterQuery);
	}, [filterQuery, staticFiles]);

	const foldersExpandedForTree = useMemo(() => {
		if (trimmedFilterQuery.length === 0) {
			return assetFoldersExpanded;
		}

		return getExpandedFoldersForFilteredAssets(filteredFiles);
	}, [assetFoldersExpanded, filteredFiles, trimmedFilterQuery]);

	const assetTree = useMemo(() => {
		return buildAssetFolderStructure(
			filteredFiles,
			null,
			foldersExpandedForTree,
		);
	}, [filteredFiles, foldersExpandedForTree]);

	const onFilterChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback((event) => {
			setFilterQuery(event.target.value);
		}, []);

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
			if (!isFileDragEvent(e)) {
				return;
			}

			e.preventDefault();
		},
		[],
	);

	const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
		async (e) => {
			try {
				if (!isFileDragEvent(e)) {
					setDropLocation(null);
					return;
				}

				e.preventDefault();
				e.stopPropagation();
				const {files} = e.dataTransfer;
				if (files.length === 0) {
					setDropLocation(null);
					return;
				}

				const assetPath = dropLocation ?? null;

				const makePath = (file: File) => {
					return [assetPath, file.name].filter(Boolean).join('/');
				};

				const differentExistingFile = Array.from(files).find((file) => {
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
		[dropLocation, staticFiles],
	);

	return (
		<div
			style={container}
			onDragOver={shouldAllowUpload ? onDragOver : undefined}
			onDrop={shouldAllowUpload ? onDrop : undefined}
		>
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
				<>
					<div style={searchContainer}>
						<RemotionInput
							type="search"
							style={searchInput}
							status="ok"
							value={filterQuery}
							onChange={onFilterChange}
							placeholder="Filter assets..."
							rightAlign={false}
							small
							aria-label="Filter assets"
						/>
					</div>
					{filteredFiles.length === 0 ? (
						<div style={emptyState}>
							<div style={label}>No assets match this filter.</div>
						</div>
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
				</>
			)}
		</div>
	);
};
