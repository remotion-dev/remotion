import React, {useMemo} from 'react';

export type AllShapesProps = {
	style?: React.CSSProperties;
	stroke?: string;
	strokeWidth?: number;
	fill?: string;
};

export const RenderSvg = ({
	width,
	height,
	path,
	fill,
	style,
	stroke,
	strokeWidth,
}: {
	width: number;
	height: number;
	path: string;
} & AllShapesProps) => {
	const actualStyle = useMemo(() => {
		return {
			display: 'inline-block',
			verticalAlign: 'middle',
			...(style ?? {}),
		};
	}, [style]);

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={actualStyle}
			data-shape-type="triangle"
		>
			<path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
		</svg>
	);
};
