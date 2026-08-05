import React from 'react';
import {
	selectedOutlineSnapIndicatorColor,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';

export const SelectedOutlineSnapIndicators: React.FC<{
	readonly activeSnapPoints: readonly SelectedOutlineSnapPoint[];
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
}> = ({activeSnapPoints, compositionHeight, compositionWidth, scale}) => {
	if (activeSnapPoints.length === 0) {
		return null;
	}

	return (
		<g pointerEvents="none">
			{activeSnapPoints.map((snapPoint) => {
				if (snapPoint.target.axis === 'x') {
					const x = snapPoint.target.position * scale;
					return (
						<line
							key={`${snapPoint.target.axis}-${snapPoint.target.type}-${snapPoint.target.position}-${snapPoint.edge}`}
							x1={x}
							x2={x}
							y1={0}
							y2={compositionHeight * scale}
							stroke={selectedOutlineSnapIndicatorColor}
							strokeWidth={1}
							vectorEffect="non-scaling-stroke"
						/>
					);
				}

				const y = snapPoint.target.position * scale;
				return (
					<line
						key={`${snapPoint.target.axis}-${snapPoint.target.type}-${snapPoint.target.position}-${snapPoint.edge}`}
						x1={0}
						x2={compositionWidth * scale}
						y1={y}
						y2={y}
						stroke={selectedOutlineSnapIndicatorColor}
						strokeWidth={1}
						vectorEffect="non-scaling-stroke"
					/>
				);
			})}
		</g>
	);
};
