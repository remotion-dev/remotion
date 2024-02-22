import React from 'react';
import {noop} from '../../helpers/noop';
import {HigherZIndex} from '../../state/z-index';
import type {SubMenu} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';
import type {SubMenuActivated} from './MenuSubItem';

export const SubMenuComponent: React.FC<{
	portalStyle: React.CSSProperties;
	subMenu: SubMenu;
	onQuitFullMenu: () => void;
	onQuitSubMenu: () => void;
	subMenuActivated: SubMenuActivated;
	setHideParent: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
	portalStyle,
	subMenuActivated,
	subMenu,
	onQuitFullMenu,
	onQuitSubMenu,
	setHideParent,
}) => {
	return (
		<HigherZIndex onEscape={onQuitFullMenu} onOutsideClick={noop}>
			<div style={portalStyle} className="css-reset">
				<MenuContent
					onNextMenu={noop}
					onPreviousMenu={onQuitSubMenu}
					values={subMenu.items}
					onHide={noop}
					leaveLeftSpace={subMenu.leaveLeftSpace}
					preselectIndex={
						subMenuActivated === 'without-mouse' &&
						typeof subMenu.preselectIndex === 'number'
							? subMenu.preselectIndex
							: false
					}
					topItemCanBeUnselected={false}
					fixedHeight={null}
					showBackButton
					setHideParent={setHideParent}
				/>
			</div>
		</HigherZIndex>
	);
};
