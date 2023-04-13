import type React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';

export const optionRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
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
	fontFamily: 'sans-serif',
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

export const fieldsetLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	paddingLeft: 5,
	paddingRight: 5,
	display: 'flex',
	flexDirection: 'row',
	fontFamily: 'monospace',
	alignItems: 'center',
	width: '100%',
};
