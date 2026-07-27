import type {SVGProps} from 'react';
import React from 'react';

export const PenIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
			<path
				fill={color}
				d="M18.7 2.3a1 1 0 0 0-1.4 0L5.2 14.4a1 1 0 0 0-.26.46l-1.4 4.95a.5.5 0 0 0 .62.62l4.95-1.4a1 1 0 0 0 .46-.26L21.7 6.7a1 1 0 0 0 0-1.4l-3-3Zm-10.33 14.9-2.4.68.68-2.4L15.5 6.62l1.73 1.73-8.86 8.85Zm10.28-10.27L16.92 5.2 18 4.12l1.73 1.73-1.08 1.08Z"
			/>
		</svg>
	);
};
