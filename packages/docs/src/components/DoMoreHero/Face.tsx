import {
	threeDIntoSvgPath,
	type ThreeDReducedInstruction,
} from '@remotion/svg-3d-engine';
import React, {useState} from 'react';

export type FaceSVGProps = {
	readonly strokeLinecap?: React.SVGAttributes<SVGPathElement>['strokeLinecap'];
	readonly strokeMiterlimit?: React.SVGAttributes<SVGPathElement>['strokeMiterlimit'];
};

export const Face: React.FC<
	{
		readonly points: ThreeDReducedInstruction[];
		readonly color: string;
		readonly strokeColor: string;
		readonly strokeWidth: number;
		readonly crispEdges: boolean;
	} & FaceSVGProps
> = ({
	color,
	points,
	strokeColor,
	strokeWidth,
	strokeMiterlimit,
	strokeLinecap,
	crispEdges,
}) => {
	const [id] = useState(() => Math.random().toString().replace('.', ''));
	const d = threeDIntoSvgPath(points);

	return (
		<>
			<defs>
				{strokeWidth ? (
					<mask id={id}>
						<path
							strokeLinecap={strokeLinecap}
							shapeRendering={crispEdges ? 'crispEdges' : undefined}
							strokeMiterlimit={strokeMiterlimit}
							strokeWidth={strokeWidth}
							d={d}
							fill="white"
						/>
					</mask>
				) : null}
			</defs>
			<path
				d={d}
				fill={color}
				mask={strokeWidth ? `url(#${id})` : undefined}
				stroke={strokeColor}
				strokeMiterlimit={strokeMiterlimit}
				shapeRendering={crispEdges ? 'crispEdges' : undefined}
				strokeLinecap={strokeLinecap}
				strokeWidth={strokeWidth}
			/>
		</>
	);
};
