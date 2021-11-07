import {BACKGROUND} from '../../helpers/colors';

export const MENU_VERTICAL_PADDING = 4;
export const SUBMENU_LEFT_INSET = -8;

export const menuContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	position: 'fixed',
	boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
	color: 'white',
	userSelect: 'none',
	minWidth: 200,
};

export const outerPortal: React.CSSProperties = {
	position: 'fixed',
	height: '100%',
	width: '100%',
};
