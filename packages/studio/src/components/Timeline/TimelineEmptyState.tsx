import React from 'react';
import {BACKGROUND} from '../../helpers/colors';

const container: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	height: 0,
	backgroundColor: BACKGROUND,
};

export const TimelineEmptyState: React.FC = () => {
	return <div style={container} />;
};
