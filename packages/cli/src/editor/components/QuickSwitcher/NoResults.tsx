import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';

const container: React.CSSProperties = {
	padding: 80,
	color: LIGHT_TEXT,
	textAlign: 'center',
	fontSize: 14,
};

export const QuickSwitcherNoResults: React.FC<{
	query: string;
}> = ({query}) => {
	return (
		<div style={container}>
			No compositions matching {'"'}
			{query}
			{'"'}
		</div>
	);
};
