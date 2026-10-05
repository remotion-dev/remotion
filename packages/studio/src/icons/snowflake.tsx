import type {SVGProps} from 'react';
import React from 'react';

export const SnowflakeIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" {...props}>
			<path
				d="M11.5 6.5V16.5M6.5 8.5L16.5 14.5M6.5 14.5L16.5 8.5M9.5 4.5L11.5 6.5L13.5 4.5M9.5 18.5L11.5 16.5L13.5 18.5M6.5 6.5L6.5 8.5L4.5 9.5M16.5 6.5L16.5 8.5L18.5 9.5M6.5 16.5L6.5 14.5L4.5 13.5M16.5 16.5L16.5 14.5L18.5 13.5"
				fill="none"
				stroke={color}
				strokeWidth={1}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
