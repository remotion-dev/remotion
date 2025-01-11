import React from 'react';
import {FONTS, RED} from '../layout/colors';

export const DemoError: React.FC = () => {
	return (
		<div
			style={{
				color: RED,
				fontFamily: FONTS.GTPLANAR,
				position: 'absolute',
				paddingTop: 15,
			}}
		>
			Sorry, we limit the amount of renders possible per day on this page. Come
			back tomorrow!
		</div>
	);
};
