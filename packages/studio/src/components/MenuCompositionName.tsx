import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import {showNotification} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';
import {useResolvedStack} from './Timeline/use-resolved-stack';

const baseStyle: React.CSSProperties = {
	color: 'inherit',
	textDecoration: 'none',
	fontSize: 'inherit',
	textUnderlineOffset: 2,
	whiteSpace: 'nowrap',
};

const compositionNameStyle: React.CSSProperties = {
	...baseStyle,
	cursor: 'default',
};

const clickableStyle: React.CSSProperties = {
	...baseStyle,
	cursor: 'pointer',
};

const clickableHoveredStyle: React.CSSProperties = {
	...clickableStyle,
	textDecoration: 'underline',
};

const slashStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	marginInline: 4,
	position: 'relative',
	top: 1,
};

export const MenuCompositionName: React.FC = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const [opening, setOpening] = useState(false);
	const [hovered, setHovered] = useState(false);

	const composition = useMemo(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return null;
		}

		return (
			compositions.find((c) => c.id === canvasContent.compositionId) ?? null
		);
	}, [canvasContent, compositions]);
	const asset = canvasContent?.type === 'asset' ? canvasContent.asset : null;

	const resolvedLocation = useResolvedStack(composition?.stack ?? null);
	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);

	const canOpenComposition =
		resolvedLocation &&
		window.remotion_editorName &&
		connectionStatus === 'connected';
	const canOpenAsset =
		asset !== null &&
		window.remotion_publicFolderExists !== null &&
		connectionStatus === 'connected';
	const canOpen = canOpenComposition || canOpenAsset;

	const handleClick = useCallback(async () => {
		if (!canOpen || opening) {
			return;
		}

		setOpening(true);
		try {
			if (asset !== null && window.remotion_publicFolderExists !== null) {
				await openInFileExplorer({
					directory: `${window.remotion_publicFolderExists}/${asset}`,
				});
			} else if (resolvedLocation) {
				await openOriginalPositionInEditor(resolvedLocation);
			}
		} catch (err) {
			showNotification((err as Error).message, 2000);
		} finally {
			setOpening(false);
		}
	}, [asset, canOpen, opening, resolvedLocation]);

	if (!composition && asset === null) {
		return null;
	}

	const name = composition?.id ?? asset;
	const title = composition
		? canOpenComposition
			? `Open in ${window.remotion_editorName}`
			: composition.id
		: canOpenAsset
			? `Show in ${fileManagerName}`
			: (asset ?? undefined);

	return (
		<>
			<span style={slashStyle}>/</span>
			<a
				style={
					canOpen && !opening
						? hovered
							? clickableHoveredStyle
							: clickableStyle
						: compositionNameStyle
				}
				title={title}
				onClick={handleClick}
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => setHovered(false)}
			>
				{name}
			</a>
		</>
	);
};
