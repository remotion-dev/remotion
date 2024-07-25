import type React from 'react';
import {BACKGROUND, BLUE} from '../../helpers/colors';

export const MENU_VERTICAL_PADDING = 4;
export const SUBMENU_LEFT_INSET = -8;

export const MAX_MENU_WIDTH = 400;
export const MAX_MOBILE_MENU_WIDTH = 300;

const menuContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	position: 'fixed',
	color: 'white',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

export const SHADOW_TOWARDS_BOTTOM = '0 2px 8px rgba(0, 0, 0, 0.5)';
export const SHADOW_TOWARDS_TOP = '0 -2px 8px rgba(0, 0, 0, 0.5)';

export const menuContainerTowardsBottom: React.CSSProperties = {
	...menuContainer,
	boxShadow: SHADOW_TOWARDS_BOTTOM,
};

export const menuContainerTowardsTop: React.CSSProperties = {
	...menuContainer,
	boxShadow: SHADOW_TOWARDS_TOP,
};

export const fullScreenOverlay: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
};

export const outerPortal: React.CSSProperties = {
	position: 'fixed',
};

export const inlineCodeSnippet: React.CSSProperties = {
	fontSize: 14,
	color: BLUE,
	fontFamily: 'monospace',
};
