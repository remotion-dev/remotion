import type {SVGProps} from 'react';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';

export const UndoIcon: React.FC<SVGProps<SVGSVGElement>> = ({
	color = CURRENT_COLOR,
	...props
}) => {
	return (
		<svg viewBox="0 0 512 512" {...props}>
			<path
				fill={color}
				d="M16 0c8.8 0 16 7.2 16 16l0 103.8 37-39.1C117.6 29.2 185.2 0 256 0 397.4 0 512 114.6 512 256S397.4 512 256 512c-98.3 0-183.6-55.4-226.5-136.5-4.1-7.8-1.1-17.5 6.7-21.6s17.5-1.1 21.6 6.7C95.4 431.6 170.1 480 256 480 379.7 480 480 379.7 480 256S379.7 32 256 32c-62 0-121.2 25.5-163.8 70.6L53.1 144 160 144c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 176c-8.8 0-16-7.2-16-16L0 16C0 7.2 7.2 0 16 0z"
			/>
		</svg>
	);
};
