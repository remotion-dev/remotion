import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals, type StaticFile} from 'remotion';
import {truthy} from '../../truthy';
import {
	BACKGROUND,
	CLEAR_HOVER,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import type {AssetFolder, Structure} from '../helpers/create-folder-tree';
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
}> = ({tabIndex, item, level, parentFolder}) => {
	const [hovered, setHovered] = useState(false);
	const [expanded, setExpanded] = useState(false);

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
			color: LIGHT_TEXT,
		};
	}, []);

	const onClick = useCallback(() => {
		setExpanded((e) => !e);
	}, []);

	const Icon = expanded ? ExpandedFolderIcon : CollapsedFolderIcon;

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
					<Icon style={iconStyle} color={LIGHT_TEXT} />
					<Spacing x={1} />
					<div style={label}>{item.name}</div>
				</Row>
			</div>

			{expanded ? (
				<FolderTree
					key={item.name}
					item={item.items}
					name={item.name}
					level={level}
					parentFolder={parentFolder}
					tabIndex={tabIndex}
				/>
			) : null}
		</>
	);
};

export const FolderTree: React.FC<{
	item: Structure;
	name: string | null;
	parentFolder: string | null;
	level: number;
	tabIndex: number;
}> = ({item, level, name, parentFolder, tabIndex}) => {
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

	const {setCurrentAsset, currentAsset, setCurrentComposition, setMediaType} =
		useContext(Internals.CompositionManager);

	const selected = useMemo(() => {
		const nameWOParent = currentAsset?.split('/').pop();

		return nameWOParent === item.name;
	}, [currentAsset, item.name]);
	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const onClick = useCallback(() => {
		const relativePath = parentFolder
			? parentFolder + '/' + item.name
			: item.name;
		setMediaType('asset');
		setCurrentAsset(relativePath);
		setCurrentComposition(null);
		window.history.pushState({}, 'Studio', `/assets/${relativePath}`);
	}, [
		item.name,
		parentFolder,
		setCurrentAsset,
		setCurrentComposition,
		setMediaType,
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

	const revealInExplorer = React.useCallback(() => {
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
	}, [item.name, parentFolder]);

	const copyToClipboard = useCallback(() => {
		copyText(`staticFile("${item.name}")`)
			.then(() => {
				notificationCenter.current?.addNotification({
					content: `Copied 'staticFile("${item.name}")' to clipboard`,
					created: Date.now(),
					duration: 1000,
					id: String(Math.random()),
				});
			})
			.catch((err) => {
				sendErrorNotification(`Could not copy: ${err.message}`);
			});
	}, [item.name]);
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
