import React, {useMemo} from 'react';
import type {Instruction} from '../utils/instructions';

export type AllShapesProps = Omit<
	React.SVGProps<SVGPathElement>,
	'width' | 'height' | 'd'
> & {
	debug?: boolean;
	pathStyle?: React.CSSProperties;
};

export const RenderSvg = ({
	width,
	height,
	path,
	style,
	pathStyle,
	transformOrigin,
	debug,
	instructions,
	...props
}: {
	width: number;
	height: number;
	path: string;
	instructions: Instruction[];
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
			{debug
				? instructions.map((i, index) => {
						if (i.type === 'C') {
							const prevInstruction =
								index === 0
									? instructions[instructions.length - 1]
									: instructions[index - 1];
							const prevX = prevInstruction.x;
							const prevY = prevInstruction.y;
							return (
								<>
									<path
										d={`M ${prevX} ${prevY} ${i.cp1x} ${i.cp1y}`}
										strokeWidth={2}
										stroke="rgba(0, 0, 0, 0.4)"
									/>
									<path
										d={`M ${i.x} ${i.y} ${i.cp2x} ${i.cp2y}`}
										strokeWidth={2}
										stroke="rgba(0, 0, 0, 0.4)"
									/>
									<circle
										cx={i.cp1x}
										cy={i.cp1y}
										r={3}
										fill="white"
										strokeWidth={2}
										stroke="black"
									/>
									<circle
										cx={i.cp2x}
										cy={i.cp2y}
										r={3}
										strokeWidth={2}
										fill="white"
										stroke="black"
									/>
								</>
							);
						}

						return null;
				  })
				: null}
		</svg>
	);
};
