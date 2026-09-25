import type {SVGProps} from 'react';
import React from 'react';

export const SplitIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg viewBox="0 0 640 640" {...props}>
			<path
				d="M152 112h72c26.5 0 48 21.5 48 48v320c0 26.5-21.5 48-48 48h-72M488 112h-72c-26.5 0-48 21.5-48 48v320c0 26.5 21.5 48 48 48h72"
				fill="none"
				stroke={color}
				strokeWidth={32}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
