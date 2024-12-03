import type {Instruction} from '@remotion/paths';
import React, {useMemo} from 'react';
import {version} from 'react-dom';
import {doesReactSupportTransformOriginProperty} from '../utils/does-react-support-canary';

export type AllShapesProps = Omit<
	React.SVGProps<SVGPathElement>,
	'width' | 'height' | 'd'
> & {
	readonly debug?: boolean;
	readonly pathStyle?: React.CSSProperties;
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
	readonly width: number;
	readonly height: number;
	readonly path: string;
	readonly instructions: Instruction[];
	readonly transformOrigin: string;
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

	const reactSupportsTransformOrigin =
		doesReactSupportTransformOriginProperty(version);

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			style={actualStyle}
		>
			<path
				{...(reactSupportsTransformOrigin
					? {
							transformOrigin,
						}
					: {
							'transform-origin': transformOrigin,
						})}
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
							if (
								prevInstruction.type === 'V' ||
								prevInstruction.type === 'H' ||
								prevInstruction.type === 'a' ||
								prevInstruction.type === 'Z' ||
								prevInstruction.type === 't' ||
								prevInstruction.type === 'q' ||
								prevInstruction.type === 'l' ||
								prevInstruction.type === 'c' ||
								prevInstruction.type === 'm' ||
								prevInstruction.type === 'h' ||
								prevInstruction.type === 's' ||
								prevInstruction.type === 'v'
							) {
								return null;
							}

							const prevX = prevInstruction.x;
							const prevY = prevInstruction.y;
							return (
								// eslint-disable-next-line react/no-array-index-key
								<React.Fragment key={index}>
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
								</React.Fragment>
							);
						}

						return null;
					})
				: null}
		</svg>
	);
};
