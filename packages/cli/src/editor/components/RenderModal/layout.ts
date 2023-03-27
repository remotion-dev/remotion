import type React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';

export const optionRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	minHeight: 40,
	paddingLeft: 16,
	paddingRight: 16,
	paddingTop: 8,
	paddingBottom: 8,
};

export const narrowOption: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

export const label: React.CSSProperties = {
	width: 170,
	fontSize: 15,
	lineHeight: '40px',
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
};

export const rightRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
	alignSelf: 'center',
	flex: 1,
};

export const input: React.CSSProperties = {
	minWidth: 250,
	textAlign: 'right',
};
