import {StudioProtocolInternals} from '@remotion/studio-protocol';
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
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
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
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	NO_HOVER_BACKGROUND_STYLE,
} from '../helpers/hoverable';
import {openInRemotionConvert} from '../helpers/open-in-remotion-convert';
import {
	markAssetSidebarScrollFromRowClick,
	maybeScrollAssetSidebarRowIntoView,
} from '../helpers/sidebar-scroll-into-view';
import {pushUrl} from '../helpers/url-state';
import useAssetDragEvents, {
	isAssetUploadDragEvent,
} from '../helpers/use-asset-drag-events';
import {getCachedImageMetadata} from '../helpers/use-image-metadata';
import {getCachedMediaMetadata} from '../helpers/use-media-metadata';
import {EllipsisIcon} from '../icons/ellipsis';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {SetSelectedModalContext} from '../state/modals';
import {AssetFileIcon} from './AssetFileIcon';
import {ContextMenu} from './ContextMenu';
import {getAssetElementFromPath} from './import-assets';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import {COMPACT_CONTROL_ROW_HEIGHT, Row, Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {getOpenInNewWindowMenuItem} from './open-in-new-window';
import {openInFileExplorer} from './RenderQueue/actions';
import {useDeleteAsset} from './use-delete-asset';

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
	appearance: 'none',
	border: 'none',
	borderRadius: 4,
	width: 'calc(100% - 4px)',
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

const ellipsisIconStyle: React.SVGProps<SVGSVGElement> = {
	style: {
		height: 12,
	},
};

export const getAssetActionAvailability = ({
	browserStudioCanMutateAssets,
	readOnlyStudio,
	connectionStatus,
	publicFolderExists,
}: {
	browserStudioCanMutateAssets: boolean | null;
	readOnlyStudio: boolean;
	connectionStatus: 'init' | 'connected' | 'disconnected';
	publicFolderExists: string | null;
}) => {
	return {
		mutationsDisabled:
			browserStudioCanMutateAssets !== true &&
			(readOnlyStudio || connectionStatus !== 'connected'),
		fileExplorerDisabled:
			publicFolderExists === null ||
			readOnlyStudio ||
			connectionStatus !== 'connected',
	};
};

export const getCanDragAsset = ({
	readOnlyStudio,
	relativePath,
}: {
	readOnlyStudio: boolean;
	relativePath: string;
}) => {
	return !readOnlyStudio && getAssetElementFromPath(relativePath) !== null;
};

export const getAssetContextMenuItems = ({
	relativePath,
	fileManagerName,
	copyFileName,
	copyStaticFilePath,
	copyAbsolutePath,
	openAssetInConvert,
	openAssetInExplorer,
	renameAsset,
	deleteAsset,
	fileExplorerAvailable,
	fileExplorerDisabled,
	mutationsDisabled,
}: {
	relativePath: string;
	fileManagerName: string;
	copyFileName: () => void;
	copyStaticFilePath: () => void;
	copyAbsolutePath: (() => void) | null;
	openAssetInConvert: () => void;
	openAssetInExplorer: () => void;
	renameAsset: () => void;
	deleteAsset: () => void;
	fileExplorerAvailable: boolean;
	fileExplorerDisabled: boolean;
	mutationsDisabled: boolean;
}): ComboboxValue[] => {
	const previewFileType = getPreviewFileType(relativePath);
	const canOpenInConvert =
		previewFileType === 'audio' || previewFileType === 'video';
	const items: (ComboboxValue | null)[] = [
		getOpenInNewWindowMenuItem(`/assets/${relativePath}`),
		canOpenInConvert
			? {
					id: 'open-asset-in-convert',
					keyHint: null,
					label: 'Open in Remotion Convert',
					leftItem: null,
					onClick: openAssetInConvert,
					quickSwitcherLabel: 'Open asset in Remotion Convert',
					subMenu: null,
					type: 'item',
					value: 'open-asset-in-convert',
				}
			: null,
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
		copyAbsolutePath
			? {
					id: 'copy-asset-absolute-path',
					keyHint: null,
					label: 'Copy absolute path',
					leftItem: null,
					onClick: copyAbsolutePath,
					quickSwitcherLabel: 'Copy asset absolute path',
					subMenu: null,
					type: 'item',
					value: 'copy-asset-absolute-path',
				}
			: null,
		{
			type: 'divider',
			id: 'asset-file-actions-divider',
		},
		fileExplorerAvailable
			? {
					id: 'open-asset-in-explorer',
					keyHint: null,
					label: `Show in ${fileManagerName}`,
					leftItem: null,
					onClick: openAssetInExplorer,
					quickSwitcherLabel: `Show asset in ${fileManagerName}`,
					subMenu: null,
					type: 'item',
					value: 'open-asset-in-explorer',
					disabled: fileExplorerDisabled,
				}
			: null,
		{
			id: 'rename-asset',
			keyHint: null,
			label: 'Rename...',
			leftItem: null,
			onClick: renameAsset,
			quickSwitcherLabel: 'Rename asset...',
			subMenu: null,
			type: 'item',
			value: 'rename-asset',
			disabled: mutationsDisabled,
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
			disabled: mutationsDisabled,
		},
	];

	return items.filter(NoReactInternals.truthy);
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
					if (!isAssetUploadDragEvent(event)) {
						return;
					}

					if (!item.expanded) {
						openFolderTimerRef.current = window.setTimeout(() => {
							toggleFolder(item.name, parentFolder);
						}, 1000);
					}
				}}
				onDragLeave={(event) => {
					if (!isAssetUploadDragEvent(event)) {
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
	const [hovered, setHovered] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
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
		return getCanDragAsset({readOnlyStudio, relativePath});
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
	}, [relativePath, setCanvasContent]);

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

			const dragData = StudioProtocolInternals.makeDragData({
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

	const renderContextMenuAction: RenderInlineAction = useCallback((color) => {
		return <EllipsisIcon svgProps={ellipsisIconStyle} fill={color} />;
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

	const copyAbsolutePath = useCallback(() => {
		if (window.remotion_publicFolderExists === null) {
			return;
		}

		const content = `${window.remotion_publicFolderExists}/${relativePath}`;
		copyText(content)
			.then(() => {
				showNotification(`Copied '${content}' to clipboard`, 1000);
			})
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [relativePath]);

	const openAssetInConvert = useCallback(() => {
		openInRemotionConvert({relativePath});
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

	const {mutationsDisabled, fileExplorerDisabled} = getAssetActionAvailability({
		browserStudioCanMutateAssets:
			getBrowserStudioOperations() === null ? null : true,
		readOnlyStudio,
		connectionStatus,
		publicFolderExists: window.remotion_publicFolderExists,
	});

	const deleteAsset = useDeleteAsset(relativePath);

	const renameAsset = useCallback(() => {
		setSelectedModal({
			type: 'rename-static-file',
			relativePath,
		});
	}, [relativePath, setSelectedModal]);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		return getAssetContextMenuItems({
			relativePath,
			fileManagerName,
			copyFileName,
			copyStaticFilePath,
			copyAbsolutePath:
				window.remotion_publicFolderExists === null ? null : copyAbsolutePath,
			openAssetInConvert,
			openAssetInExplorer,
			renameAsset,
			deleteAsset,
			fileExplorerAvailable: getBrowserStudioOperations() === null,
			fileExplorerDisabled,
			mutationsDisabled,
		});
	}, [
		copyFileName,
		copyStaticFilePath,
		copyAbsolutePath,
		deleteAsset,
		fileExplorerDisabled,
		fileManagerName,
		mutationsDisabled,
		openAssetInConvert,
		openAssetInExplorer,
		renameAsset,
		relativePath,
	]);

	const revealInExplorer: React.MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				openAssetInExplorer();
			},
			[openAssetInExplorer],
		);

	return (
		<ContextMenu getItems={getContextMenuItems}>
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
						color={hovered || selected ? WHITE : LIGHT_TEXT}
					/>
					<Spacing x={1} />
					<div style={label}>{item.name}</div>
					{hovered && !isDragging ? (
						<>
							<Spacing x={0.5} />
							<InlineDropdown
								variant={null}
								title="More actions"
								renderAction={renderContextMenuAction}
								getItems={getContextMenuItems}
								style={NO_HOVER_BACKGROUND_STYLE}
								className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
							/>
							{fileExplorerDisabled ? null : (
								<>
									<Spacing x={0.5} />
									<InlineAction
										variant={null}
										title={`Show in ${fileManagerName}`}
										renderAction={renderFileExplorerAction}
										onClick={revealInExplorer}
										style={NO_HOVER_BACKGROUND_STYLE}
										className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
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
