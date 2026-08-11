import React from 'react';

export const SvgFilter: React.FC = () => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
			<defs>
				<filter id="floodFilter" filterUnits="userSpaceOnUse">
					<feFlood
						x="50"
						y="50"
						width="100"
						height="100"
						flood-color="green"
						flood-opacity="0.5"
					/>
				</filter>
			</defs>

			<use style={{filter: 'url(#floodFilter)'}} />
		</svg>
	);
};
