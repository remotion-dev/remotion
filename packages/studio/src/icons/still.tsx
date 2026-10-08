import type {SVGProps} from 'react';
import React from 'react';

export const StillIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	const size =
		typeof props.style?.height === 'number' ? props.style.height : 18;
	const bodyTop = Math.round((size * 3) / 16);
	const humpLeft = Math.round((size * 3) / 8) - 0.5;

	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${size} ${size}`}
			fill="none"
			stroke={color}
			strokeWidth={1}
		>
			<path
				d={`M2 ${bodyTop + 0.5}
				H${humpLeft - 1}L${humpLeft} 1.5H${size - humpLeft}
				L${size - humpLeft + 1} ${bodyTop + 0.5}H${size - 2}
				a1.5 1.5 0 0 1 1.5 1.5V${size - 3}
				a1.5 1.5 0 0 1 -1.5 1.5H2
				a1.5 1.5 0 0 1 -1.5 -1.5V${bodyTop + 2}
				a1.5 1.5 0 0 1 1.5 -1.5z`}
				strokeLinejoin="round"
			/>
			<circle
				cx={size / 2}
				cy={Math.floor((size * 9) / 16)}
				r={Math.round((size * 7) / 32) - 0.5}
			/>
		</svg>
	);
};
