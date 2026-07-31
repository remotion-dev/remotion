import type React from 'react';
import {BLUE, BORDER_BLACK, WHITE} from '../../helpers/colors';
import {getMaxModalHeight, getMaxModalWidth} from '../ModalContainer';

export const outerModalStyle: React.CSSProperties = {
	width: getMaxModalWidth(800),
	height: getMaxModalHeight(490),
	overflow: 'hidden',
	display: 'flex',
	flexDirection: 'column',
};

export const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '12px 16px',
	borderBottom: BORDER_BLACK,
};

export const optionsPanel: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	minWidth: 0,
};

export const horizontalLayout: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	overflowY: 'auto',
	flex: 1,
};

export const leftSidebar: React.CSSProperties = {
	padding: 6,
};

export const horizontalTab: React.CSSProperties = {
	width: 150,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	textAlign: 'left',
	fontSize: 14,
	fontWeight: 'normal',
	paddingLeft: 8,
	paddingTop: 6,
	paddingBottom: 6,
	borderRadius: 4,
};

export const iconContainer: React.CSSProperties = {
	width: 18,
	height: 18,
	marginRight: 8,
	color: 'inherit',
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export const icon: React.CSSProperties = {
	color: 'inherit',
	height: 18,
};

export const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: WHITE,
};

export const flexer: React.CSSProperties = {
	flex: 1,
};
