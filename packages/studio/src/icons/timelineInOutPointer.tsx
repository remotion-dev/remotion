import type {SVGProps} from 'react';
import React from 'react';

export const TimelineInPointer: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 16 16" {...props}>
			<path
				d="M9.5 1.5H5.5v13h4"
				fill="none"
				stroke={props.color}
				strokeWidth="1"
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
		<svg viewBox="0 0 16 16" {...props}>
			<path
				d="M6.5 1.5h4v13H6.5"
				fill="none"
				stroke={props.color}
				strokeWidth="1"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
