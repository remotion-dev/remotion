import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const Pause: React.FC<SVGProps<SVGSVGElement>> = ({
	color = CURRENT_COLOR,
	...props
}) => (
	<svg
		{...props}
		aria-hidden="true"
		focusable="false"
		data-prefix="fas"
		data-icon="pause"
		className="svg-inline--fa fa-pause fa-w-14"
		role="img"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 14 14"
	>
		<path
			fill={color}
			d="M2 1h3a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1H2a1 1 0 0 1 -1 -1V2a1 1 0 0 1 1 -1zM9 1h3a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1H9a1 1 0 0 1 -1 -1V2a1 1 0 0 1 1 -1z"
		/>
	</svg>
);
