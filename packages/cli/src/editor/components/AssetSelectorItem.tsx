import React, {useCallback, useMemo, useState} from 'react';
import type {StaticFile} from 'remotion';
import {BACKGROUND, LIGHT_TEXT} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {ClipboardIcon} from '../icons/clipboard';
import {FileIcon} from '../icons/file';
import {ExpandedFolderIconSolid} from '../icons/folder';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {Row, Spacing} from './layout';
import {
	notificationCenter,
	sendErrorNotification,
} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';

const ASSET_ITEM_HEIGHT = 32;

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

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
	flexShrink: 0,
};

const revealIconStyle: React.CSSProperties = {
	height: 12,
	color: 'currentColor',
};

export const AssetSelectorItem: React.FC<{
	item: StaticFile;
	tabIndex: number;
}> = ({item, tabIndex}) => {
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
			paddingLeft: 12,
			color: LIGHT_TEXT,
		};
	}, []);

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
			directory: 'public/' + item.name,
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
