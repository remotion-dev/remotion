import type {SVGProps} from 'react';
import React from 'react';

export const ScissorsIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
			<path
				fill={color}
				d="M48 112a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm176 0C224 50.1 173.9 0 112 0S0 50.1 0 112 50.1 224 112 224c24 0 46.3-7.6 64.5-20.4l57.3 52.4-57.3 52.4C158.3 295.6 136 288 112 288 50.1 288 0 338.1 0 400s50.1 112 112 112 112-50.1 112-112c0-20.5-5.5-39.6-15.1-56.2L504.2 73.7c9.8-8.9 10.5-24.1 1.5-33.9s-24.1-10.5-33.9-1.5l-202.4 185.2-60.5-55.3c9.6-16.5 15.1-35.7 15.1-56.2zM471.8 473.7c9.8 8.9 25 8.3 33.9-1.5s8.3-25-1.5-33.9L338.6 286.8 302.7 319 471.8 473.7zM48 400a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"
			/>
		</svg>
	);
};
