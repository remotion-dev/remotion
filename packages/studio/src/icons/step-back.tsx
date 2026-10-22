import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const StepBack: React.FC<SVGProps<SVGSVGElement>> = ({
	color = CURRENT_COLOR,
	...props
}) => {
	return (
		<svg viewBox="0 0 14 16" {...props}>
			<path
				fill={color}
				d="M2 1h2v6l6.3 -5.7C11 0.7 12 1.2 12 2v12c0 0.8 -1 1.3 -1.7 0.7L4 9v6H2z"
			/>
		</svg>
	);
};
