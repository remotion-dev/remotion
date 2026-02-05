import React from 'react';

export const HeartIcon: React.FC<{
	readonly size?: number;
	readonly fill?: string;
	readonly stroke?: string;
	readonly strokeWidth?: number;
}> = ({size = 24, fill = 'none', stroke = 'black', strokeWidth = 2}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill={fill}
			stroke={stroke}
			strokeWidth={strokeWidth}
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
		</svg>
	);
};
