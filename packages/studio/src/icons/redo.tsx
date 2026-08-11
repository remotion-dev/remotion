import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const RedoIcon: React.FC<SVGProps<SVGSVGElement>> = ({
	color = CURRENT_COLOR,
	...props
}) => {
	return (
		<svg viewBox="0 0 512 512" {...props}>
			<path
				fill={color}
				d="M496 0c-8.8 0-16 7.2-16 16l0 103.8-37-39.1C394.4 29.2 326.8 0 256 0 114.6 0 0 114.6 0 256S114.6 512 256 512c98.3 0 183.6-55.4 226.5-136.5 4.1-7.8 1.1-17.5-6.7-21.6s-17.5-1.1-21.6 6.7C416.6 431.6 341.9 480 256 480 132.3 480 32 379.7 32 256S132.3 32 256 32c62 0 121.2 25.5 163.8 70.6L458.9 144 352 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l144 0c8.8 0 16-7.2 16-16l0-144c0-8.8-7.2-16-16-16z"
			/>
		</svg>
	);
};
