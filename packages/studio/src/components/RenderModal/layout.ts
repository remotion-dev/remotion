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

export const label: React.CSSProperties = {
	width: 260,
	fontSize: 15,
	lineHeight: '40px',
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
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
};

export const fieldSetText: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	fontFamily: 'monospace',
};

export const fieldsetLabel: React.CSSProperties = {
	...fieldSetText,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	width: '100%',
};
