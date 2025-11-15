import type React from 'react';
import {BLUE} from '../../helpers/colors';
import {getMaxModalHeight, getMaxModalWidth} from '../ModalContainer';

export const outerModalStyle: React.CSSProperties = {
	width: getMaxModalWidth(1000),
	height: getMaxModalHeight(640),
	overflow: 'hidden',
	display: 'flex',
	flexDirection: 'column',
};

export const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '12px 16px',
	borderBottom: '1px solid black',
};

export const optionsPanel: React.CSSProperties = {
	display: 'flex',
	width: '100%',
};

export const horizontalLayout: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	overflowY: 'auto',
	flex: 1,
};

export const leftSidebar: React.CSSProperties = {
	padding: 12,
};

export const horizontalTab: React.CSSProperties = {
	width: 250,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	textAlign: 'left',
	fontSize: 16,
	fontWeight: 'bold',
	paddingLeft: 15,
	paddingTop: 12,
	paddingBottom: 12,
};

export const iconContainer: React.CSSProperties = {
	width: 20,
	height: 20,
	marginRight: 15,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export const icon: React.CSSProperties = {
	color: 'currentcolor',
	height: 20,
};

export const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: 'white',
};

export const flexer: React.CSSProperties = {
	flex: 1,
};
