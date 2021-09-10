import React from 'react';
import {noop} from '../../helpers/noop';
import {HigherZIndex} from '../../state/z-index';
import {SubMenu} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';

export const SubMenuComponent: React.FC<{
	portalStyle: React.CSSProperties;
	subMenu: SubMenu;
	onQuitFullMenu: () => void;
	onQuitSubMenu: () => void;
}> = ({portalStyle, subMenu, onQuitFullMenu, onQuitSubMenu}) => {
	return (
		<HigherZIndex onEscape={onQuitFullMenu} onOutsideClick={noop}>
			<div style={portalStyle}>
				<MenuContent
					onNextMenu={noop}
					onPreviousMenu={onQuitSubMenu}
					values={subMenu.items}
					onHide={noop}
					leaveLeftSpace={subMenu.leaveLeftSpace}
				/>
			</div>
		</HigherZIndex>
	);
};
