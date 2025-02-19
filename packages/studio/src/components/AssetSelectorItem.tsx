import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Internals, type StaticFile} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	BACKGROUND,
	CLEAR_HOVER,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import type {AssetFolder, AssetStructure} from '../helpers/create-folder-tree';
import {useMobileLayout} from '../helpers/mobile-layout';
import {pushUrl} from '../helpers/url-state';
import useAssetDragEvents from '../helpers/use-asset-drag-events';
import {ClipboardIcon} from '../icons/clipboard';
import {FileIcon} from '../icons/file';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {SidebarContext} from '../state/sidebar';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {showNotification} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';
import {Row, Spacing} from './layout';

const ASSET_ITEM_HEIGHT = 32;

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
	flexShrink: 0,
};

const itemStyle: React.CSSProperties = {
	paddingRight: 10,
	paddingTop: 6,
	paddingBottom: 6,
	fontSize: 13,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
	appearance: 'none',
	border: 'none',
	width: '100%',
	textAlign: 'left',
	backgroundColor: BACKGROUND,
	height: ASSET_ITEM_HEIGHT,
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
	color: 'currentColor',
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
}> = ({
	tabIndex,
	item,
	level,
	parentFolder,
	toggleFolder,
	dropLocation,
	setDropLocation,
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
			backgroundColor: hovered ? CLEAR_HOVER : 'transparent',
		};
	}, [hovered, level]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: hovered ? 'white' : LIGHT_TEXT,
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
				backgroundColor: isDropDiv ? CLEAR_HOVER : BACKGROUND,
			}}
		>
			<div
				style={folderStyle}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				tabIndex={tabIndex}
				title={item.name}
				onClick={onClick}
				onDragEnter={() => {
					if (!item.expanded) {
						openFolderTimerRef.current = window.setTimeout(() => {
							toggleFolder(item.name, parentFolder);
						}, 1000);
					}
				}}
				onDragLeave={() => {
					if (openFolderTimerRef.current) {
						clearTimeout(openFolderTimerRef.current);
					}
				}}
			>
				<Row>
					<Icon style={iconStyle} color={hovered ? 'white' : LIGHT_TEXT} />
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
}> = ({
	item,
	level,
	name,
	parentFolder,
	toggleFolder,
	tabIndex,
	dropLocation,
	setDropLocation,
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
}> = ({item, tabIndex, level, parentFolder}) => {
	const isMobileLayout = useMobileLayout();
	const [hovered, setHovered] = useState(false);
	const {setSidebarCollapsedState} = useContext(SidebarContext);
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const {canvasContent, setCanvasContent} = useContext(
		Internals.CompositionManager,
	);

	const selected = useMemo(() => {
		if (canvasContent && canvasContent.type === 'asset') {
			const nameWOParent = canvasContent.asset.split('/').pop();

			return nameWOParent === item.name;
		}

		return false;
	}, [canvasContent, item.name]);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const onClick = useCallback(() => {
		const relativePath = parentFolder
			? parentFolder + '/' + item.name
			: item.name;
		setCanvasContent({type: 'asset', asset: relativePath});
		pushUrl(`/assets/${relativePath}`);
		if (isMobileLayout) {
			setSidebarCollapsedState({left: 'collapsed', right: 'collapsed'});
		}
	}, [
		isMobileLayout,
		item.name,
		parentFolder,
		setCanvasContent,
		setSidebarCollapsedState,
	]);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...itemStyle,
			color: hovered || selected ? 'white' : LIGHT_TEXT,
			backgroundColor: hovered
				? selected
					? SELECTED_BACKGROUND
					: CLEAR_HOVER
				: selected
					? SELECTED_BACKGROUND
					: 'transparent',
			paddingLeft: 12 + level * 8,
		};
	}, [hovered, level, selected]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: hovered || selected ? 'white' : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	const renderFileExplorerAction: RenderInlineAction = useCallback((color) => {
		return <ExpandedFolderIcon style={revealIconStyle} color={color} />;
	}, []);

	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon style={revealIconStyle} color={color} />;
	}, []);

	const revealInExplorer: React.MouseEventHandler<HTMLButtonElement> =
		React.useCallback(
			(e) => {
				e.stopPropagation();
				openInFileExplorer({
					directory:
						window.remotion_publicFolderExists +
						'/' +
						parentFolder +
						'/' +
						item.name,
				}).catch((err) => {
					showNotification(`Could not open file: ${err.message}`, 2000);
				});
			},
			[item.name, parentFolder],
		);

	const copyToClipboard: React.MouseEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				e.stopPropagation();
				const content = `staticFile("${[parentFolder, item.name].join('/')}")`;
				copyText(content)
					.then(() => {
						showNotification(`Copied '${content}' to clipboard`, 1000);
					})
					.catch((err) => {
						showNotification(`Could not copy: ${err.message}`, 2000);
					});
			},
			[item.name, parentFolder],
		);

	return (
		<Row align="center">
			<div
				style={style}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				onClick={onClick}
				tabIndex={tabIndex}
				title={item.name}
			>
				<FileIcon style={iconStyle} color={LIGHT_TEXT} />
				<Spacing x={1} />
				<div style={label}>{item.name}</div>
				{hovered ? (
					<>
						<Spacing x={0.5} />
						<InlineAction
							title="Copy staticFile() name"
							renderAction={renderCopyAction}
							onClick={copyToClipboard}
						/>
						<Spacing x={0.5} />
						<InlineAction
							title="Open in Explorer"
							renderAction={renderFileExplorerAction}
							onClick={revealInExplorer}
						/>
					</>
				) : null}
			</div>
		</Row>
	);
};
