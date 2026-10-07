import type {SVGProps} from 'react';
import {CURRENT_COLOR_LOWERCASE} from '../helpers/colors';

export const PicIcon = ({
	color,
	...props
}: SVGProps<SVGSVGElement> & {readonly color?: string}) => {
	const size =
		typeof props.style?.height === 'number' ? props.style.height : 18;
	const peakTop = Math.round((size * 5) / 16) - 0.5;
	const peakRight = Math.round((size * 5) / 8) - 0.5;
	const valleyX = Math.round((size * 7) / 16) - 0.5;
	const sunCenter = Math.round((size * 9) / 32);

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${size} ${size}`}
			{...props}
			fill="none"
			stroke={color ?? CURRENT_COLOR_LOWERCASE}
			strokeWidth={1}
		>
			<rect x={0.5} y={1.5} width={size - 1} height={size - 3} rx={1.5} />
			<path
				d={`M3 ${size - 4.5}L${peakTop} ${Math.round(size / 2) - 0.5}L${valleyX} ${peakRight}L${peakRight} ${peakTop}L${size - 3} ${size - 4.5}z`}
				strokeLinejoin="round"
			/>
			<circle
				cx={sunCenter}
				cy={sunCenter}
				r={Math.round((size * 3) / 32) - 0.5}
			/>
		</svg>
	);
};
