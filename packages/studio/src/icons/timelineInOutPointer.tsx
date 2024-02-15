import type {SVGProps} from 'react';
import React from 'react';

export const TimelineInPointer: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 256 256" fill="none" {...props}>
			<path
				d="M158 25H99V230.5H158"
				stroke={props.color}
				strokeWidth="42"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export const TimelineOutPointer: React.FC<SVGProps<SVGSVGElement>> = (
	props,
) => {
	return (
		<svg viewBox="0 0 256 256" fill="none" {...props}>
			<path
				d="M98 25H157V230.5H98"
				stroke={props.color}
				strokeWidth="42"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
