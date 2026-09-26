import React, {useLayoutEffect, useState} from 'react';
import {
	selectedOutlineSnapIndicatorColor,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';

export type UpdateSelectedOutlineSnapPoints = (
	snapPoints: readonly SelectedOutlineSnapPoint[],
) => void;

export const SelectedOutlineSnapLines: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly snapPoints: readonly SelectedOutlineSnapPoint[];
}> = ({compositionHeight, compositionWidth, scale, snapPoints}) => {
	if (snapPoints.length === 0) {
		return null;
	}

	return (
		<g pointerEvents="none">
			{snapPoints.map((snapPoint) => {
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

export const SelectedOutlineSnapIndicators: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly updateSnapPointsRef: React.MutableRefObject<UpdateSelectedOutlineSnapPoints>;
}> = ({compositionHeight, compositionWidth, scale, updateSnapPointsRef}) => {
	const [activeSnapPoints, setActiveSnapPoints] = useState<
		readonly SelectedOutlineSnapPoint[]
	>([]);

	useLayoutEffect(() => {
		updateSnapPointsRef.current = setActiveSnapPoints;
		return () => {
			if (updateSnapPointsRef.current === setActiveSnapPoints) {
				updateSnapPointsRef.current = () => undefined;
			}
		};
	}, [updateSnapPointsRef]);

	return (
		<SelectedOutlineSnapLines
			compositionHeight={compositionHeight}
			compositionWidth={compositionWidth}
			scale={scale}
			snapPoints={activeSnapPoints}
		/>
	);
};
