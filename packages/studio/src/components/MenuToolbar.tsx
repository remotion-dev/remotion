import type {SetStateAction} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BACKGROUND, BORDER_BLACK, WHITE} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
import {useMenuStructure} from '../helpers/use-menu-structure';
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
	const browserStudioOperations = getBrowserStudioOperations();
	const canUndoAndRedo =
		!readOnlyStudio ||
		(previewServerState.type === 'connected' &&
			Boolean(browserStudioOperations?.undo && browserStudioOperations.redo));

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

	return (
		<Row
			align="center"
			className="css-reset"
			style={row}
			onPointerDown={onPointerDown}
		>
			<div style={fixedWidthLeft}>
				<SidebarCollapserControl side="left" />
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
				{readOnlyStudio ? null : <UpdateCheck />}
			</div>
			<div style={flex} />
			<MenuBuildIndicator />
			<div style={flex} />
			<div style={fixedWidthRight}>
				{canUndoAndRedo ? <UndoRedoButtons /> : null}
				<SidebarCollapserControl side="right" />
			</div>
		</Row>
	);
};
