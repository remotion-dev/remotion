import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals, type StaticFile} from 'remotion';
import {
	BACKGROUND,
	CLEAR_HOVER,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
} from '../../../../studio/src/helpers/colors';
import {copyText} from '../../../../studio/src/helpers/copy-text';
import type {
	AssetFolder,
	AssetStructure,
} from '../../../../studio/src/helpers/create-folder-tree';
import {truthy} from '../../truthy';
import {ClipboardIcon} from '../icons/clipboard';
import {FileIcon} from '../icons/file';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {Row, Spacing} from './layout';
import {
	notificationCenter,
	sendErrorNotification,
} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';

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

export const AssetFolderItem: React.FC<{
	item: AssetFolder;
	tabIndex: number;
	level: number;
	parentFolder: string;
	toggleFolder: (folderName: string, parentName: string | null) => void;
}> = ({tabIndex, item, level, parentFolder, toggleFolder}) => {
	const [hovered, setHovered] = useState(false);

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
		<>
			<div
				style={folderStyle}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				tabIndex={tabIndex}
				title={item.name}
				onClick={onClick}
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
				/>
			) : null}
		</>
	);
};

export const AssetFolderTree: React.FC<{
	item: AssetStructure;
	name: string | null;
	parentFolder: string | null;
	level: number;
	tabIndex: number;
	toggleFolder: (folderName: string, parentName: string | null) => void;
}> = ({item, level, name, parentFolder, toggleFolder, tabIndex}) => {
	const combinedParents = useMemo(() => {
		return [parentFolder, name].filter(truthy).join('/');
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

export const AssetSelectorItem: React.FC<{
	item: StaticFile | AssetFolder;
	tabIndex: number;
	level: number;
	parentFolder: string;
}> = ({item, tabIndex, level, parentFolder}) => {
	const [hovered, setHovered] = useState(false);
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
		window.history.pushState({}, 'Studio', `/assets/${relativePath}`);
	}, [item.name, parentFolder, setCanvasContent]);

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
					sendErrorNotification(`Could not open file: ${err.message}`);
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
						notificationCenter.current?.addNotification({
							content: `Copied '${content}' to clipboard`,
							created: Date.now(),
							duration: 1000,
							id: String(Math.random()),
						});
					})
					.catch((err) => {
						sendErrorNotification(`Could not copy: ${err.message}`);
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
