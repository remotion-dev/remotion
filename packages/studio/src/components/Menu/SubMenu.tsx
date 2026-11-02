import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
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
	const ref = useRef<HTMLDivElement>(null);
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const style = useMemo((): React.CSSProperties => {
		if (!size) {
			return {...portalStyle, visibility: 'hidden'};
		}

		// Neither side of the parent may have enough room in a narrow iframe.
		// Clamp the measured menu, allowing it to overlap its parent when needed.
		const left =
			typeof portalStyle.left === 'number'
				? portalStyle.left
				: size.windowSize.width - Number(portalStyle.right) - size.width;
		return {
			...portalStyle,
			left: Math.max(4, Math.min(left, size.windowSize.width - size.width - 4)),
			right: undefined,
			top: Math.max(
				4,
				Math.min(
					Number(portalStyle.top),
					size.windowSize.height - size.height - 4,
				),
			),
		};
	}, [portalStyle, size]);
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
				ref={ref}
				data-remotion-menu-tree-id={menuTreeId ?? undefined}
				style={style}
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
					fixedHeight={Math.min(
						600,
						(size?.windowSize.height ?? window.innerHeight) - 8,
					)}
				/>
			</div>
		</HigherZIndex>
	);
};
