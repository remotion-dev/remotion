import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

// Brand shape adapted from Simple Icons (CC0 1.0):
// https://github.com/simple-icons/simple-icons/blob/develop/icons/github.svg

export const GitHubIcon: React.FC<{
	readonly size: number;
}> = ({size}) => {
	return (
		<svg
			aria-hidden
			data-github-icon
			style={{flexShrink: 0, height: size, width: size}}
			viewBox="0 0 24 24"
		>
			<path
				d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.6-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.3c0 .32.22.7.82.58A12 12 0 0 0 12 .3Z"
				fill={CURRENT_COLOR}
			/>
		</svg>
	);
};
