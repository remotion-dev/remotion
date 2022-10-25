import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';

const container: React.CSSProperties = {
	padding: 80,
	color: LIGHT_TEXT,
	textAlign: 'center',
	fontSize: 14,
};

export type Mode = 'commands' | 'compositions' | 'docsearch';

const MODE_TO_STRING: Record<Mode, string> = {
	commands: 'commands',
	compositions: 'compositions',
	docsearch: 'documentaion',
};

export const QuickSwitcherNoResults: React.FC<{
	query: string;
	mode: Mode;
}> = ({query, mode}) => {
	return (
		<div style={container}>
			No {MODE_TO_STRING[mode]} matching {'"'}
			{query}
			{'"'}
		</div>
	);
};
