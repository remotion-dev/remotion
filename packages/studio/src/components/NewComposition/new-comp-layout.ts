import type React from 'react';
import {LIGHT_COLOR, LIGHT_TEXT} from '../../helpers/colors';

export const leftLabel: React.CSSProperties = {
	width: 160,
	display: 'inline-block',
	textAlign: 'right',
	paddingRight: 30,
	fontSize: 14,
	color: LIGHT_COLOR,
};

export const inputArea: React.CSSProperties = {
	width: 190,
};

export const rightLabel: React.CSSProperties = {
	fontSize: 13,
	color: LIGHT_TEXT,
	marginLeft: 10,
};
