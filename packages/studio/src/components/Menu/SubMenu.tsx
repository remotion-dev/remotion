import React, {useCallback} from 'react';
import {useMobileLayout} from '../../helpers/mobile-layout';
import {noop} from '../../helpers/noop';
import {HigherZIndex} from '../../state/z-index';
import type {SubMenu} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';
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
	const onOutsideClick = useCallback(
		(e: Node) => {
			if (portals.find((p) => p.contains(e)) || mobileLayout) {
				onQuitSubMenu();
			} else {
				onQuitFullMenu();
			}
		},
		[mobileLayout, onQuitFullMenu, onQuitSubMenu],
	);

	return (
		<HigherZIndex onEscape={onQuitFullMenu} onOutsideClick={onOutsideClick}>
			<div style={portalStyle} className="css-reset">
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
