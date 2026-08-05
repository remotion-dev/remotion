import type {SetStateAction} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BACKGROUND, BORDER_BLACK, WHITE} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {useMenuStructure} from '../helpers/use-menu-structure';
import {SearchIcon} from '../icons/search';
import {SetSelectedModalContext} from '../state/modals';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {Row} from './layout';
import {MENU_TOOLBAR_HEIGHT} from './menu-toolbar-height';
import type {MenuId} from './Menu/MenuItem';
import {MenuItem} from './Menu/MenuItem';
import {MenuBuildIndicator} from './MenuBuildIndicator';
import {SidebarCollapserControl} from './SidebarCollapserControls';
import {UndoRedoButtons} from './UndoRedoButtons';
import {UpdateCheck} from './UpdateCheck';

const row: React.CSSProperties = {
	alignItems: 'center',
	flexDirection: 'row',
	display: 'flex',
	color: WHITE,
	borderBottom: BORDER_BLACK,
	boxSizing: 'border-box',
	fontSize: 13,
	height: MENU_TOOLBAR_HEIGHT,
	paddingLeft: 6,
	paddingRight: 6,
	backgroundColor: BACKGROUND,
};

const flex: React.CSSProperties = {
	flex: 1,
};

export const MenuToolbar: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const [selected, setSelected] = useState<string | null>(null);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const browserStudioOperations = getBrowserStudioOperations();
	const canUndoAndRedo =
		!readOnlyStudio ||
		(previewServerState.type === 'connected' &&
			browserStudioOperations !== null);

	const mobileLayout = useMobileLayout();

	const fixedWidthRight: React.CSSProperties = useMemo(() => {
		return {
			...(mobileLayout
				? {width: 'fit-content'}
				: {
						width: '330px',
					}),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-end',
		};
	}, [mobileLayout]);

	const fixedWidthLeft: React.CSSProperties = useMemo(() => {
		return {
			...(mobileLayout
				? {minWidth: '0px'}
				: {
						minWidth: '330px',
					}),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-start',
		};
	}, [mobileLayout]);

	const itemClicked = useCallback(
		(itemId: SetStateAction<string | null>) => {
			setSelected(itemId);
		},
		[setSelected],
	);

	const itemHovered = useCallback(
		(itemId: MenuId) => {
			if (selected) {
				setSelected(itemId);
			}
		},
		[selected, setSelected],
	);

	const closeMenu = useCallback(() => {
		setSelected(null);
	}, []);

	const structure = useMenuStructure(closeMenu, readOnlyStudio);

	const menus = useMemo(() => {
		return structure.map((s) => s.id);
	}, [structure]);

	const onPreviousMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			return menus[(menus.indexOf(s as MenuId) + 1) % menus.length];
		});
	}, [menus]);

	const onNextMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			if (menus.indexOf(s as MenuId) === 0) {
				return menus[menus.length - 1];
			}

			return menus[(menus.indexOf(s as MenuId) - 1) % menus.length];
		});
	}, [menus]);

	const onItemQuit = useCallback(() => {
		setSelected(null);
	}, [setSelected]);

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		// Prevent deselection of currently selected items
		e.stopPropagation();
	}, []);

	const openQuickSwitcher = useCallback(() => {
		setSelectedModal({
			type: 'quick-switcher',
			mode: 'compositions',
			invocationTimestamp: Date.now(),
			assetSelection: null,
			compositionSelection: null,
		});
	}, [setSelectedModal]);

	const renderSearchIcon: RenderInlineAction = useCallback((color) => {
		return <SearchIcon color={color} width={18} height={18} />;
	}, []);

	const searchTooltip = areKeyboardShortcutsDisabled()
		? 'Quick Switcher'
		: `Quick Switcher (${cmdOrCtrlCharacter}+K)`;

	return (
		<Row
			align="center"
			className="css-reset"
			style={row}
			onPointerDown={onPointerDown}
		>
			<div style={fixedWidthLeft}>
				{mobileLayout ? (
					<InlineAction
						variant={null}
						onClick={openQuickSwitcher}
						renderAction={renderSearchIcon}
						title={searchTooltip}
					/>
				) : (
					<SidebarCollapserControl side="left" />
				)}
				{structure.map((s) => {
					return (
						<MenuItem
							key={s.id}
							selected={selected === s.id}
							onItemSelected={itemClicked}
							onItemHovered={itemHovered}
							id={s.id}
							label={s.label}
							onItemQuit={onItemQuit}
							menu={s}
							onPreviousMenu={onPreviousMenu}
							onNextMenu={onNextMenu}
							leaveLeftPadding={s.leaveLeftPadding}
						/>
					);
				})}
				{readOnlyStudio || browserStudioOperations ? null : <UpdateCheck />}
			</div>
			{mobileLayout ? null : <div style={flex} />}
			<MenuBuildIndicator mobileLayout={mobileLayout} />
			<div style={flex} />
			<div style={fixedWidthRight}>
				{canUndoAndRedo ? <UndoRedoButtons /> : null}
				<SidebarCollapserControl side="right" />
			</div>
		</Row>
	);
};
