import React, {useCallback, useMemo, useState} from 'react';
import type {StaticFile} from 'remotion';
import {BACKGROUND, CLEAR_HOVER, LIGHT_TEXT} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import type {AssetFolder} from '../helpers/create-folder-tree';
import {ClipboardIcon} from '../icons/clipboard';
import {FileIcon} from '../icons/file';
import {CollapsedFolderIcon, ExpandedFolderIconSolid} from '../icons/folder';
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
}> = ({tabIndex, item, level}) => {
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
			display: 'flex',
			paddingLeft: 12 + level * 8,
			color: LIGHT_TEXT,
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

	const Icon = expanded ? ExpandedFolderIconSolid : CollapsedFolderIcon;

	return (
		<div>
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
				<div>
					{item.items.folders.map((folder) => {
						return (
							<AssetFolderItem
								key={`${folder.name}`}
								item={folder}
								tabIndex={tabIndex}
								level={level + 1}
							/>
						);
					})}
					{item.items.files.map((file) => {
						return (
							<AssetSelectorItem
								key={`${file.src}`}
								item={file}
								tabIndex={tabIndex}
								level={level + 1}
							/>
						);
					})}
				</div>
			) : null}
		</div>
	);
};

export const AssetSelectorItem: React.FC<{
	item: StaticFile | AssetFolder;
	tabIndex: number;
	level: number;
}> = ({item, tabIndex, level}) => {
	const [hovered, setHovered] = useState(false);
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...itemStyle,
			color: LIGHT_TEXT,
			backgroundColor: hovered ? CLEAR_HOVER : 'transparent',
			paddingLeft: 12 + level * 8,
		};
	}, [hovered, level]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: LIGHT_TEXT,
		};
	}, []);

	const renderFileExplorerAction: RenderInlineAction = useCallback((color) => {
		return <ExpandedFolderIconSolid style={revealIconStyle} color={color} />;
	}, []);

	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon style={revealIconStyle} color={color} />;
	}, []);

	const revealInExplorer = React.useCallback(() => {
		openInFileExplorer({
			directory: window.remotion_publicFolderExists + '/' + item.name,
		}).catch((err) => {
			sendErrorNotification(`Could not open file: ${err.message}`);
		});
	}, [item.name]);

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
