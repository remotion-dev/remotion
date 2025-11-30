import React from 'react';
import {TeamPicture} from '../TeamPicture';
import {TeamCardsLayout} from './TeamCards';

export const TitleTeamCards: React.FC = () => {
	return (
		<div>
			<h1 className="font-brand">Team</h1>
			<TeamPicture />
			<TeamCardsLayout />
			<h1 className="font-brand mt-8">Company</h1>
			<p className="font-brand leading-normal">
				Wonder how we operate? If we are stable? Who is backing us? <br />
				Check our our{' '}
				<a href="/investors" className="font-brand no-underline text-brand">
					investors page
				</a>
				!
			</p>
		</div>
	);
};
