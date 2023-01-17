import React, {useMemo} from 'react';

export type AllShapesProps = Omit<
	React.SVGProps<SVGPathElement>,
	'width' | 'height' | 'd'
> & {
	pathStyle?: React.CSSProperties;
};

export const RenderSvg = ({
	width,
	height,
	path,
	style,
	pathStyle,
	transformOrigin,
	...props
}: {
	width: number;
	height: number;
	path: string;
	transformOrigin: string;
} & AllShapesProps) => {
	const actualStyle = useMemo((): React.CSSProperties => {
		return {
			overflow: 'visible',
			...(style ?? {}),
		};
	}, [style]);

	const actualPathStyle = useMemo((): React.CSSProperties => {
		return {
			transformBox: 'fill-box',
			...(pathStyle ?? {}),
		};
	}, [pathStyle]);

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={actualStyle}
		>
			<path
				transform-origin={transformOrigin}
				d={path}
				style={actualPathStyle}
				{...props}
			/>
		</svg>
	);
};
