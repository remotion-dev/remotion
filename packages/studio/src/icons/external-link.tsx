import type {SVGProps} from 'react';
import React from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const ExternalLinkIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
			<path
				fill={color}
				d="M304 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l153.4 0-260.7 260.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L480 54.6 480 208c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192c0-8.8-7.2-16-16-16L304 0zM80 96C35.8 96 0 131.8 0 176L0 432c0 44.2 35.8 80 80 80l256 0c44.2 0 80-35.8 80-80l0-96c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 96c0 26.5-21.5 48-48 48L80 480c-26.5 0-48-21.5-48-48l0-256c0-26.5 21.5-48 48-48l96 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 96z"
			/>
		</svg>
	);
};
