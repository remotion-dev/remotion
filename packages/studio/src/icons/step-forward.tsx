import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const StepForward: React.FC<SVGProps<SVGSVGElement>> = ({
	color = CURRENT_COLOR,
	...props
}) => {
	return (
		<svg viewBox="0 0 14 16" {...props}>
			<path
				fill={color}
				d="M12 1h-2v6L3.7 1.3C3 0.7 2 1.2 2 2v12c0 0.8 1 1.3 1.7 0.7L10 9v6h2z"
			/>
		</svg>
	);
};
