import type {SVGProps} from 'react';
import React from 'react';

export const SnowflakeIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" {...props}>
			<path
				d="M320 80V560M112 200L528 440M112 440L528 200M272 112L320 160L368 112M272 528L320 480L368 528M181 184L181 240L128 264M459 184L459 240L512 264M181 456L181 400L128 376M459 456L459 400L512 376"
				fill="none"
				stroke={color}
				strokeWidth={28}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
