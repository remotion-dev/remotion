import React from 'react';
import {noop} from '../../helpers/noop';
import {HigherZIndex} from '../../state/z-index';
import {SubMenu} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';

export const SubMenuComponent: React.FC<{
	portalStyle: React.CSSProperties;
	subMenu: SubMenu;
	onQuitMenu: () => void;
}> = ({portalStyle, subMenu, onQuitMenu}) => {
	return (
		<HigherZIndex onEscape={onQuitMenu} onOutsideClick={noop}>
			<div style={portalStyle}>
				<MenuContent
					onArrowLeft={noop}
					onArrowRight={noop}
					values={subMenu.items}
					onHide={noop}
					leaveLeftSpace={subMenu.leaveLeftSpace}
				/>
			</div>
		</HigherZIndex>
	);
};
