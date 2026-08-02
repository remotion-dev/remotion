import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const Minus: React.FC<
	SVGProps<SVGSVGElement> & {readonly color?: string}
> = ({color = CURRENT_COLOR, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
			<path
				fill={color}
				d="M0 256c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 272c-8.8 0-16-7.2-16-16z"
			/>
		</svg>
	);
};
