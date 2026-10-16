import type {SVGProps} from 'react';
import React from 'react';

export const UnwrapIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path
				d="M256 48H448A48 48 0 0 1 496 96V416A48 48 0 0 1 448 464H64A48 48 0 0 1 16 416V96A48 48 0 0 1 64 48Z"
				pathLength={40}
				fill="none"
				stroke={color}
				strokeWidth={32}
				strokeDasharray="1 1"
				strokeDashoffset={0.5}
			/>
			<rect
				x={144}
				y={160}
				width={224}
				height={192}
				rx={24}
				fill="none"
				stroke={color}
				strokeWidth={32}
			/>
		</svg>
	);
};
