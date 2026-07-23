import React from 'react';
import {BLACK_ALPHA_40, BLUE} from '../../helpers/colors';

const svgStyle: React.CSSProperties = {
	display: 'block',
	overflow: 'visible',
};

export const TimelineKeyframeDiamondIcon: React.FC<{
	readonly color: string;
	readonly selected?: boolean;
	readonly size: number;
}> = ({color, selected = false, size}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 12 12"
			style={svgStyle}
			aria-hidden="true"
			focusable="false"
		>
			{selected ? (
				<polygon
					points="6 0.75 11.25 6 6 11.25 0.75 6"
					fill="none"
					stroke={BLUE}
					strokeWidth="1.5"
					strokeLinejoin="round"
				/>
			) : null}
			<polygon
				points="6 1.5 10.5 6 6 10.5 1.5 6"
				fill={color}
				stroke={BLACK_ALPHA_40}
				strokeWidth="1"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
