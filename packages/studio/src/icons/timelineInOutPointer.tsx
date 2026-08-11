import type {SVGProps} from 'react';
import React from 'react';

export const TimelineInPointer: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 192 512" {...props}>
			<path
				d="M0 88C0 57.1 25.1 32 56 32h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H56c-4.4 0-8 3.6-8 8v336c0 4.4 3.6 8 8 8h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H56c-30.9 0-56-25.1-56-56V88z"
				fill={props.color}
			/>
		</svg>
	);
};

export const TimelineOutPointer: React.FC<SVGProps<SVGSVGElement>> = (
	props,
) => {
	return (
		<svg viewBox="0 0 192 512" {...props}>
			<path
				d="M192 88c0-30.9-25.1-56-56-56H72C58.7 32 48 42.7 48 56s10.7 24 24 24h64c4.4 0 8 3.6 8 8v336c0 4.4-3.6 8-8 8H72c-13.3 0-24 10.7-24 24s10.7 24 24 24h64c30.9 0 56-25.1 56-56V88z"
				fill={props.color}
			/>
		</svg>
	);
};
