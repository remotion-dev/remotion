import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_80,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	NO_HOVER_BACKGROUND_STYLE,
} from '../helpers/hoverable';
import {noop} from '../helpers/noop';
import {SetSelectedModalContext} from '../state/modals';
import {getCompositionContextMenuItems} from './composition-menu-items';
import {ContextMenu} from './ContextMenu';
import {InlineDropdown} from './InlineDropdown';
import {useResolvedStack} from './Timeline/use-resolved-stack';
import {useEditorOpening} from './use-default-editor-info';

const baseStyle: React.CSSProperties = {
	cursor: 'default',
	textDecoration: 'none',
	fontSize: 'inherit',
	textUnderlineOffset: 2,
	whiteSpace: 'nowrap',
};

const assetNameStyle: React.CSSProperties = {
	...baseStyle,
	color: WHITE_ALPHA_80,
};

const contextMenuStyle: React.CSSProperties = {
	alignItems: 'center',
	color: 'inherit',
	display: 'flex',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const compositionNameStyle: React.CSSProperties = {
	...baseStyle,
	appearance: 'none',
	border: 'none',
	backgroundColor: TRANSPARENT,
	fontFamily: 'inherit',
	fontSize: 13,
	height: 'auto',
	lineHeight: 1.5,
	margin: 0,
	padding: 0,
	width: 'auto',
	...NO_HOVER_BACKGROUND_STYLE,
};

const slashStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	marginInline: 4,
	opacity: 0.8,
	position: 'relative',
	top: 1,
};

export const MenuCompositionName: React.FC = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const composition = useMemo(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return null;
		}

		return (
			compositions.find((c) => c.id === canvasContent.compositionId) ?? null
		);
	}, [canvasContent, compositions]);
	const asset = canvasContent?.type === 'asset' ? canvasContent.asset : null;
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const {defaultEditorId, defaultEditorName} = useEditorOpening(
		connectionStatus === 'connected',
	);
	const resolvedLocation = useResolvedStack(composition?.stack ?? null);
	const getContextMenuItems = useCallback(() => {
		return getCompositionContextMenuItems({
			closeMenu: noop,
			composition,
			connectionStatus,
			editorId: defaultEditorId,
			editorName: defaultEditorName,
			includeCompositionManagementItems: true,
			resolvedLocation,
			setSelectedModal,
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
	}, [
		composition,
		connectionStatus,
		defaultEditorId,
		defaultEditorName,
		resolvedLocation,
		setSelectedModal,
	]);

	if (!composition && asset === null) {
		return null;
	}

	const name = composition?.id ?? asset;

	return (
		<>
			<span style={slashStyle}>/</span>
			{composition ? (
				<ContextMenu getItems={getContextMenuItems} style={contextMenuStyle}>
					<InlineDropdown
						aria-label="Open composition menu"
						className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
						getItems={getContextMenuItems}
						hoveredColor={WHITE}
						renderAction={() => composition.id}
						style={compositionNameStyle}
						title="Open composition menu"
						unhoveredColor={WHITE_ALPHA_80}
						variant={null}
					/>
				</ContextMenu>
			) : (
				<span style={assetNameStyle}>{name}</span>
			)}
		</>
	);
};
