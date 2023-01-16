import React from 'react';

export const renderSvg = ({
	width,
	height,
	path,
	fill,
	style,
}: {
	width: number;
	height: number;
	path: string;
	fill?: string;
	style?: React.CSSProperties;
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={style}
			data-shape-type="triangle"
		>
			<path d={path} fill={fill} />
		</svg>
	);
};
