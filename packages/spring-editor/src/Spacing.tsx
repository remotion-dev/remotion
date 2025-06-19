import React from 'react';

export const Spacing: React.FC<{
	readonly x?: number;
	readonly y?: number;
	readonly block?: boolean;
}> = ({x = 0, y = 0, block}) => {
	return (
		<div
			style={{
				display: block ? 'block' : 'inline-block',
				height: 8 * y,
				width: 8 * x,
			}}
		/>
	);
};
