import type {SVGProps} from 'react';
import React from 'react';

export const Plus: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
			<path
				fill={color}
				d="M240 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192-192 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0 0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192 192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-192 0 0-192z"
			/>
		</svg>
	);
};
