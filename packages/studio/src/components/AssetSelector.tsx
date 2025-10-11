import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {getStaticFiles, type StaticFile} from '../api/get-static-files';
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
import {inlineCodeSnippet} from './Menu/styles';
import {showNotification} from './Notifications/NotificationCenter';

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

const list: React.CSSProperties = {
	height: '100%',
	overflowY: 'auto',
};

type State = {
	staticFiles: StaticFile[];
	publicFolderExists: string | null;
};

export const AssetSelector: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const {tabIndex} = useZIndex();
	const {assetFoldersExpanded, setAssetFoldersExpanded} =
		useContext(FolderContext);
	const [dropLocation, setDropLocation] = useState<string | null>(null);
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const shouldAllowUpload = connectionStatus === 'connected' && !readOnlyStudio;

	const [{publicFolderExists, staticFiles}, setState] = React.useState<State>(
		() => {
			return {
				staticFiles: getStaticFiles(),
				publicFolderExists: window.remotion_publicFolderExists,
			};
		},
	);

	const assetTree = useMemo(() => {
		return buildAssetFolderStructure(staticFiles, null, assetFoldersExpanded);
	}, [assetFoldersExpanded, staticFiles]);

	useEffect(() => {
		const onUpdate = () => {
			setState({
				staticFiles: getStaticFiles(),
				publicFolderExists: window.remotion_publicFolderExists,
			});
		};

		const unsub = subscribeToEvent('new-public-folder', onUpdate);
		return () => {
			unsub();
		};
	}, [subscribeToEvent]);

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
