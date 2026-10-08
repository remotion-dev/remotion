import React from 'react';

type Props = {
	readonly size: number;
	readonly color: string;
	readonly rotate?: number;
	readonly style?: React.CSSProperties;
};

export const Sparkle: React.FC<Props> = ({size, color, rotate = 0, style}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 100 100"
			style={{flexShrink: 0, rotate: `${rotate}deg`, ...style}}
		>
			<path
				d="M 50 0 C 54 34 66 46 100 50 C 66 54 54 66 50 100 C 46 66 34 54 0 50 C 34 46 46 34 50 0 Z"
				fill={color}
			/>
		</svg>
	);
};
