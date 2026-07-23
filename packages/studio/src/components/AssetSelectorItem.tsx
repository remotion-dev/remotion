import {DragAndDropInternals} from '@remotion/drag-and-drop';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals, staticFile, type StaticFile} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {deleteStaticFile} from '../api/delete-static-file';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	BACKGROUND,
	WHITE_ALPHA_06,
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import type {AssetFolder, AssetStructure} from '../helpers/create-folder-tree';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {useMobileLayout} from '../helpers/mobile-layout';
import {
	markAssetSidebarScrollFromRowClick,
	maybeScrollAssetSidebarRowIntoView,
} from '../helpers/sidebar-scroll-into-view';
import {pushUrl} from '../helpers/url-state';
import useAssetDragEvents, {
	isFileDragEvent,
} from '../helpers/use-asset-drag-events';
import {getCachedImageMetadata} from '../helpers/use-image-metadata';
import {getCachedMediaMetadata} from '../helpers/use-media-metadata';
import {ClipboardIcon} from '../icons/clipboard';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {ModalsContext} from '../state/modals';
import {SidebarContext} from '../state/sidebar';
import {AssetFileIcon} from './AssetFileIcon';
import {useConfirmationDialog} from './ConfirmationDialog';
import {ContextMenu} from './ContextMenu';
import {getAssetElementFromPath} from './import-assets';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {COMPACT_CONTROL_ROW_HEIGHT, Row, Spacing} from './layout';
import {inlineCodeSnippet} from './Menu/styles';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {getOpenInNewWindowMenuItem} from './open-in-new-window';
import {openInFileExplorer} from './RenderQueue/actions';

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
	flexShrink: 0,
};

const itemStyle: React.CSSProperties = {
	paddingRight: 10,
	paddingTop: 5,
	paddingBottom: 5,
	fontSize: 13,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
	marginLeft: 4,
	marginRight: 4,
	appearance: 'none',
	border: 'none',
	borderRadius: 4,
	width: 'calc(100% - 8px)',
	textAlign: 'left',
	backgroundColor: BACKGROUND,
	height: COMPACT_CONTROL_ROW_HEIGHT,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const labelStyle: React.CSSProperties = {
	textAlign: 'left',
	textDecoration: 'none',
	fontSize: 13,
	flex: '1 1 0%',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const revealIconStyle: React.CSSProperties = {
	height: 12,
	color: CURRENT_COLOR,
};

const AssetFolderItem: React.FC<{
	readonly item: AssetFolder;
	readonly tabIndex: number;
	readonly level: number;
	readonly parentFolder: string;
	readonly toggleFolder: (
		folderName: string,
		parentName: string | null,
	) => void;
	readonly dropLocation: string | null;
	readonly setDropLocation: React.Dispatch<React.SetStateAction<string | null>>;
	readonly readOnlyStudio: boolean;
}> = ({
	tabIndex,
	item,
	level,
	parentFolder,
	toggleFolder,
	dropLocation,
	setDropLocation,
	readOnlyStudio,
}) => {
	const [hovered, setHovered] = useState(false);
	const openFolderTimerRef = useRef<number | null>(null);

	const {isDropDiv, onDragEnter, onDragLeave} = useAssetDragEvents({
		name: item.name,
		parentFolder,
		dropLocation,
		setDropLocation,
	});

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const folderStyle: React.CSSProperties = useMemo(() => {
		return {
			...itemStyle,
			paddingLeft: 4 + level * 8,
			backgroundColor: hovered ? WHITE_ALPHA_06 : TRANSPARENT,
		};
	}, [hovered, level]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: hovered ? WHITE : LIGHT_TEXT,
		};
	}, [hovered]);

	const onClick = useCallback(() => {
		toggleFolder(item.name, parentFolder);
	}, [item.name, parentFolder, toggleFolder]);

	const Icon = item.expanded ? ExpandedFolderIcon : CollapsedFolderIcon;

	return (
		<div
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			style={{
				backgroundColor: isDropDiv ? WHITE_ALPHA_06 : BACKGROUND,
			}}
		>
			<div
				style={folderStyle}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				tabIndex={tabIndex}
				title={item.name}
				onClick={onClick}
				onDragEnter={(event) => {
					if (!isFileDragEvent(event)) {
						return;
					}

					if (!item.expanded) {
						openFolderTimerRef.current = window.setTimeout(() => {
							toggleFolder(item.name, parentFolder);
						}, 1000);
					}
				}}
				onDragLeave={(event) => {
					if (!isFileDragEvent(event)) {
						return;
					}

					if (openFolderTimerRef.current) {
						clearTimeout(openFolderTimerRef.current);
					}
				}}
			>
				<Row>
					<Icon style={iconStyle} color={hovered ? WHITE : LIGHT_TEXT} />
					<Spacing x={1} />
					<div style={label}>{item.name}</div>
				</Row>
			</div>

			{item.expanded ? (
				<AssetFolderTree
					key={item.name}
					item={item.items}
					name={item.name}
					level={level}
					parentFolder={parentFolder}
					tabIndex={tabIndex}
					toggleFolder={toggleFolder}
					dropLocation={dropLocation}
					setDropLocation={setDropLocation}
					readOnlyStudio={readOnlyStudio}
				/>
			) : null}
		</div>
	);
};

export const AssetFolderTree: React.FC<{
	readonly item: AssetStructure;
	readonly name: string | null;
	readonly parentFolder: string | null;
	readonly level: number;
	readonly tabIndex: number;
	readonly toggleFolder: (
		folderName: string,
		parentName: string | null,
	) => void;
	readonly dropLocation: string | null;
	readonly setDropLocation: React.Dispatch<React.SetStateAction<string | null>>;
	readonly readOnlyStudio: boolean;
}> = ({
	item,
	level,
	name,
	parentFolder,
	toggleFolder,
	tabIndex,
	dropLocation,
	setDropLocation,
	readOnlyStudio,
}) => {
	const combinedParents = useMemo(() => {
		return [parentFolder, name].filter(NoReactInternals.truthy).join('/');
	}, [name, parentFolder]);
	return (
		<div>
			{item.folders.map((folder) => {
				return (
					<AssetFolderItem
						key={folder.name}
						item={folder}
						tabIndex={tabIndex}
						level={level + 1}
						parentFolder={combinedParents}
						toggleFolder={toggleFolder}
						dropLocation={dropLocation}
						setDropLocation={setDropLocation}
						readOnlyStudio={readOnlyStudio}
					/>
				);
			})}
			{item.files.map((file) => {
				return (
					<AssetSelectorItem
						key={file.src}
						item={file}
						tabIndex={tabIndex}
						level={level}
						parentFolder={combinedParents}
						readOnlyStudio={readOnlyStudio}
					/>
				);
			})}
		</div>
	);
};

const AssetSelectorItem: React.FC<{
	readonly item: StaticFile | AssetFolder;
	readonly tabIndex: number;
	readonly level: number;
	readonly parentFolder: string;
	readonly readOnlyStudio: boolean;
}> = ({item, tabIndex, level, parentFolder, readOnlyStudio}) => {
	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);
	const isMobileLayout = useMobileLayout();
	const [hovered, setHovered] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const {setSidebarCollapsedState} = useContext(SidebarContext);
	const {setSelectedModal} = useContext(ModalsContext);
	const confirm = useConfirmationDialog();
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const {canvasContent} = useContext(Internals.CompositionManager);

	const relativePath = useMemo(() => {
		return parentFolder ? parentFolder + '/' + item.name : item.name;
	}, [parentFolder, item.name]);
	const previewFileType = useMemo(() => {
		return getPreviewFileType(relativePath);
	}, [relativePath]);

	const selected = useMemo(() => {
		if (canvasContent && canvasContent.type === 'asset') {
			return canvasContent.asset === relativePath;
		}

		return false;
	}, [canvasContent, relativePath]);

	const canDragAsset = useMemo(() => {
		return !readOnlyStudio && getAssetElementFromPath(relativePath) !== null;
	}, [readOnlyStudio, relativePath]);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const rowRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		maybeScrollAssetSidebarRowIntoView({
			element: rowRef.current,
			assetPath: relativePath,
			selected,
		});
	}, [relativePath, selected]);

	const onClick = useCallback(() => {
		markAssetSidebarScrollFromRowClick(relativePath);
		setCanvasContent({type: 'asset', asset: relativePath});
		pushUrl(`/assets/${relativePath}`);
		if (isMobileLayout) {
			setSidebarCollapsedState({left: 'collapsed', right: 'collapsed'});
		}
	}, [
		isMobileLayout,
		relativePath,
		setCanvasContent,
		setSidebarCollapsedState,
	]);

	const onDragStart: React.DragEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			if (!canDragAsset) {
				e.preventDefault();
				return;
			}

			setIsDragging(true);
			e.dataTransfer.effectAllowed = 'copy';
			const src = staticFile(relativePath);
			const imageMetadata =
				previewFileType === 'image' ? getCachedImageMetadata(src) : null;
			const mediaMetadata =
				previewFileType === 'audio' || previewFileType === 'video'
					? getCachedMediaMetadata(src)
					: null;
			const width = imageMetadata?.width ?? mediaMetadata?.width ?? null;
			const height = imageMetadata?.height ?? mediaMetadata?.height ?? null;
			const hasDimensions =
				width !== null &&
				height !== null &&
				Number.isInteger(width) &&
				Number.isInteger(height) &&
				width > 0 &&
				height > 0;
			const durationInSeconds =
				mediaMetadata?.duration !== undefined &&
				Number.isFinite(mediaMetadata.duration) &&
				mediaMetadata.duration > 0
					? mediaMetadata.duration
					: null;

			const dragData = DragAndDropInternals.makeDragData({
				type: 'asset',
				assetPath: relativePath,
				width: hasDimensions ? width : null,
				height: hasDimensions ? height : null,
				durationInSeconds,
			});
			e.dataTransfer.setData(dragData.mimeType, dragData.payload);
		},
		[canDragAsset, previewFileType, relativePath],
	);

	const onDragEnd: React.DragEventHandler<HTMLDivElement> = useCallback(() => {
		setIsDragging(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...itemStyle,
			color: hovered || selected ? WHITE : LIGHT_TEXT,
			backgroundColor: hovered || selected ? WHITE_ALPHA_06 : TRANSPARENT,
			paddingLeft: 12 + level * 8,
		};
	}, [hovered, level, selected]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: hovered || selected ? WHITE : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	const renderFileExplorerAction: RenderInlineAction = useCallback((color) => {
		return <ExpandedFolderIcon style={revealIconStyle} color={color} />;
	}, []);

	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon style={revealIconStyle} color={color} />;
	}, []);

	const copyFileName = useCallback(() => {
		copyText(item.name)
			.then(() => {
				showNotification(`Copied '${item.name}' to clipboard`, 1000);
			})
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [item.name]);

	const copyStaticFilePath = useCallback(() => {
		const content = `staticFile("${relativePath}")`;
		copyText(content)
			.then(() => {
				showNotification(`Copied '${content}' to clipboard`, 1000);
			})
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [relativePath]);

	const openAssetInExplorer = useCallback(() => {
		if (!window.remotion_publicFolderExists) {
			showNotification('Could not find the public folder', 2000);
			return;
		}

		openInFileExplorer({
			directory: window.remotion_publicFolderExists + '/' + relativePath,
		}).catch((err) => {
			showNotification(`Could not open file: ${err.message}`, 2000);
		});
	}, [relativePath]);

	const serverActionDisabled =
		readOnlyStudio || connectionStatus !== 'connected';

	const deleteAsset = useCallback(() => {
		confirm({
			title: 'Delete asset',
			message: (
				<>
					Do you want to delete the asset{' '}
					<code style={inlineCodeSnippet}>{relativePath}</code> from your public
					folder?
				</>
			),
			confirmLabel: 'Delete',
		})
			.then((confirmed) => {
				if (!confirmed) {
					return;
				}

				const notification = showNotification(
					`Deleting ${relativePath}...`,
					null,
				);

				deleteStaticFile(relativePath)
					.then(() => {
						notification.replaceContent(`Deleted ${relativePath}`, 2000);
					})
					.catch((err) => {
						notification.replaceContent(
							`Could not delete ${relativePath}: ${(err as Error).message}`,
							3000,
						);
					});
			})
			.catch((err) => {
				showNotification(
					`Could not delete ${relativePath}: ${(err as Error).message}`,
					3000,
				);
			});
	}, [confirm, relativePath]);

	const contextMenu = useMemo((): ComboboxValue[] => {
		return [
			getOpenInNewWindowMenuItem(`/assets/${relativePath}`),
			{
				type: 'divider',
				id: 'open-in-new-window-divider',
			},
			{
				id: 'copy-asset-file-name',
				keyHint: null,
				label: 'Copy file name',
				leftItem: null,
				onClick: copyFileName,
				quickSwitcherLabel: 'Copy asset file name',
				subMenu: null,
				type: 'item',
				value: 'copy-asset-file-name',
			},
			{
				id: 'copy-asset-static-file-path',
				keyHint: null,
				label: 'Copy staticFile() path',
				leftItem: null,
				onClick: copyStaticFilePath,
				quickSwitcherLabel: 'Copy staticFile() path',
				subMenu: null,
				type: 'item',
				value: 'copy-asset-static-file-path',
			},
			{
				type: 'divider',
				id: 'asset-file-actions-divider',
			},
			{
				id: 'open-asset-in-explorer',
				keyHint: null,
				label: `Show in ${fileManagerName}`,
				leftItem: null,
				onClick: openAssetInExplorer,
				quickSwitcherLabel: `Show asset in ${fileManagerName}`,
				subMenu: null,
				type: 'item',
				value: 'open-asset-in-explorer',
				disabled:
					serverActionDisabled || window.remotion_publicFolderExists === null,
			},
			{
				id: 'rename-asset',
				keyHint: null,
				label: 'Rename...',
				leftItem: null,
				onClick: () => {
					setSelectedModal({
						type: 'rename-static-file',
						relativePath,
					});
				},
				quickSwitcherLabel: 'Rename asset...',
				subMenu: null,
				type: 'item',
				value: 'rename-asset',
				disabled: serverActionDisabled,
			},
			{
				id: 'delete-asset',
				keyHint: null,
				label: 'Delete...',
				leftItem: null,
				onClick: deleteAsset,
				quickSwitcherLabel: 'Delete asset...',
				subMenu: null,
				type: 'item',
				value: 'delete-asset',
				disabled: serverActionDisabled,
			},
		];
	}, [
		copyFileName,
		copyStaticFilePath,
		deleteAsset,
		fileManagerName,
		openAssetInExplorer,
		relativePath,
		serverActionDisabled,
		setSelectedModal,
	]);

	const revealInExplorer: React.MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				openAssetInExplorer();
			},
			[openAssetInExplorer],
		);

	const copyToClipboard: React.MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				copyStaticFilePath();
			},
			[copyStaticFilePath],
		);

	return (
		<ContextMenu values={contextMenu} onOpen={null}>
			<Row align="center">
				<div
					ref={rowRef}
					style={style}
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
					onClick={onClick}
					draggable={canDragAsset}
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}
					tabIndex={tabIndex}
					title={item.name}
				>
					<AssetFileIcon
						fileType={previewFileType}
						style={iconStyle}
						color={LIGHT_TEXT}
					/>
					<Spacing x={1} />
					<div style={label}>{item.name}</div>
					{hovered && !isDragging ? (
						<>
							<Spacing x={0.5} />
							<InlineAction
								title="Copy staticFile() path"
								renderAction={renderCopyAction}
								onClick={copyToClipboard}
							/>
							{serverActionDisabled ? null : (
								<>
									<Spacing x={0.5} />
									<InlineAction
										title={`Show in ${fileManagerName}`}
										renderAction={renderFileExplorerAction}
										onClick={revealInExplorer}
									/>
								</>
							)}
						</>
					) : null}
				</div>
			</Row>
		</ContextMenu>
	);
};
