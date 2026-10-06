import type {SVGProps} from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const JumpToStart: React.FC<SVGProps<SVGSVGElement>> = ({
	color = CURRENT_COLOR,
	...props
}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
			<path
				fill={color}
				d="M0 3a1 1 0 0 1 2 0v5l6.3 -5.7C9 1.7 10 2.2 10 3v5l6.3 -5.7C17 1.7 18 2.2 18 3v12c0 0.8 -1 1.3 -1.7 0.7L10 10v5c0 0.8 -1 1.3 -1.7 0.7L2 10v5a1 1 0 0 1 -2 0z"
			/>
		</svg>
	);
};
