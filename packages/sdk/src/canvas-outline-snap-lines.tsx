import React from 'react';
import type {CanvasOutlineSnapPoint} from './outline-snap';

export const CanvasOutlineSnapLines: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly snapPoints: readonly CanvasOutlineSnapPoint[];
	readonly color: string;
}> = ({compositionHeight, compositionWidth, scale, snapPoints, color}) => {
	if (snapPoints.length === 0) {
		return null;
	}

	return (
		<g pointerEvents="none">
			{snapPoints.map((snapPoint) => {
				const key = `${snapPoint.target.axis}-${snapPoint.target.type}-${snapPoint.target.position}-${snapPoint.edge}`;
				if (snapPoint.target.axis === 'x') {
					const x = snapPoint.target.position * scale;
					return (
						<line
							key={key}
							x1={x}
							x2={x}
							y1={0}
							y2={compositionHeight * scale}
							stroke={color}
							strokeWidth={1}
							vectorEffect="non-scaling-stroke"
						/>
					);
				}

				const y = snapPoint.target.position * scale;
				return (
					<line
						key={key}
						x1={0}
						x2={compositionWidth * scale}
						y1={y}
						y2={y}
						stroke={color}
						strokeWidth={1}
						vectorEffect="non-scaling-stroke"
					/>
				);
			})}
		</g>
	);
};
