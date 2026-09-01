import type {SVGProps} from 'react';
import React from 'react';

export const SolidIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<rect
				x={16}
				y={48}
				width={480}
				height={416}
				rx={48}
				fill="none"
				stroke={color}
				strokeWidth={32}
			/>
		</svg>
	);
};
