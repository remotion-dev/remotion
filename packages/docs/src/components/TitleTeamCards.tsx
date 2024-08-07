import React from 'react';
import {TeamCardsLayout} from './TeamCards';

const center: React.CSSProperties = {
	textAlign: 'center',
};

export const TitleTeamCards: React.FC = () => {
	return (
		<div>
			<h1 style={center}>Team</h1>
			<TeamCardsLayout />
		</div>
	);
};
