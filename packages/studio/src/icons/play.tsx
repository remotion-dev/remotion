import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const Play: React.FC<SVGProps<SVGSVGElement>> = ({
	color = CURRENT_COLOR,
	...props
}) => (
	<svg
		{...props}
		aria-hidden="true"
		focusable="false"
		data-prefix="fas"
		data-icon="play"
		className="svg-inline--fa fa-play fa-w-14"
		role="img"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 14 14"
	>
		<path
			fill={color}
			d="M12.5 6.1 2.5 0.2C1.8 -0.2 1 0.3 1 1.1v11.8c0 0.8 0.8 1.3 1.5 0.9l10 -5.9c0.7 -0.4 0.7 -1.4 0 -1.8z"
		/>
	</svg>
);
