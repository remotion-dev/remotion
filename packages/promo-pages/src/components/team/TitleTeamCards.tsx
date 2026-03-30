import React from 'react';
import {TeamPicture} from '../TeamPicture';
import {TeamCardsLayout} from './TeamCards';

export const TitleTeamCards: React.FC = () => {
	return (
		<div>
			<h1 className="font-brand">Team</h1>
			<TeamPicture />
			<TeamCardsLayout />
		</div>
	);
};
