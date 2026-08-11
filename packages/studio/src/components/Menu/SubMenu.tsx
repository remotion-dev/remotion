import React, {useCallback, useContext} from 'react';
import {useMobileLayout} from '../../helpers/mobile-layout';
import {noop} from '../../helpers/noop';
import {HigherZIndex} from '../../state/z-index';
import type {SubMenu} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';
import {isNodeInMenuTree, MenuTreeContext} from './menu-tree-context';
import type {SubMenuActivated} from './MenuSubItem';
import {portals} from './portals';

export const SubMenuComponent: React.FC<{
	readonly portalStyle: React.CSSProperties;
	readonly subMenu: SubMenu;
	readonly onQuitFullMenu: () => void;
	readonly onQuitSubMenu: () => void;
	readonly subMenuActivated: SubMenuActivated;
}> = ({
	portalStyle,
	subMenuActivated,
	subMenu,
	onQuitFullMenu,
	onQuitSubMenu,
}) => {
	const mobileLayout = useMobileLayout();
	const menuTreeId = useContext(MenuTreeContext);
	const onOutsideClick = useCallback(
		(e: Node) => {
			if (menuTreeId !== null) {
				if (isNodeInMenuTree(e, menuTreeId)) {
					onQuitSubMenu();
				} else {
					onQuitFullMenu();
				}

				return;
			}

			if (portals.find((p) => p.contains(e)) || mobileLayout) {
				onQuitSubMenu();
			} else {
				onQuitFullMenu();
			}
		},
		[menuTreeId, mobileLayout, onQuitFullMenu, onQuitSubMenu],
	);

	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		// Prevent deselection of currently selected items
		e.stopPropagation();
	}, []);

	return (
		<HigherZIndex onEscape={onQuitFullMenu} onOutsideClick={onOutsideClick}>
			<div
				data-remotion-menu-tree-id={menuTreeId ?? undefined}
				style={portalStyle}
				className="css-reset"
				onPointerDown={onPointerDown}
			>
				<MenuContent
					onNextMenu={noop}
					onPreviousMenu={onQuitSubMenu}
					values={subMenu.items}
					onHide={onQuitFullMenu}
					leaveLeftSpace={subMenu.leaveLeftSpace}
					preselectIndex={
						subMenuActivated === 'without-mouse' &&
						typeof subMenu.preselectIndex === 'number'
							? subMenu.preselectIndex
							: false
					}
					topItemCanBeUnselected={false}
					fixedHeight={null}
				/>
			</div>
		</HigherZIndex>
	);
};
