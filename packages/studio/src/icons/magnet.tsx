import type {SVGProps} from 'react';
import React from 'react';

export const MagnetIcon: React.FC<
	Omit<SVGProps<SVGSVGElement>, 'color'> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
			<path
				fill={color}
				fillRule="evenodd"
				d="M1 9a8 8 0 0 1 16 0v6a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1V9a3 3 0 0 0 -6 0v6a1 1 0 0 1 -1 1H2a1 1 0 0 1 -1 -1zM2 9v3h3V9a4 4 0 0 1 8 0v3h3V9a7 7 0 0 0 -14 0zM2 13v2h3v-2zM13 13v2h3v-2z"
			/>
		</svg>
	);
};
