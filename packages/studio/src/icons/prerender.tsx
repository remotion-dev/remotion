import type {SVGProps} from 'react';
import React, {useId} from 'react';

// An editable scene (dashed) that became a video
export const PrerenderIcon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	const maskId = useId();

	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<mask id={maskId}>
				<rect x={5} y={5.5} width={10.5} height={9.5} rx={1.5} fill="white" />
				<path d="M8.75 8v4.5l3.75-2.25z" fill="black" />
			</mask>
			<path
				d="M3.5 8.5H1.5a1 1 0 0 1-1-1V1.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V4"
				fill="none"
				stroke={color}
				strokeDasharray="2 1.25"
			/>
			<rect
				x={5}
				y={5.5}
				width={10.5}
				height={9.5}
				rx={1.5}
				fill={color}
				mask={`url(#${maskId})`}
			/>
		</svg>
	);
};
