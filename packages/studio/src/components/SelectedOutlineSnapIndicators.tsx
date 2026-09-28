import {CanvasInternals} from '@remotion/canvas';
import React, {useLayoutEffect, useState} from 'react';
import {
	selectedOutlineSnapIndicatorColor,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';

const {CanvasOutlineSnapLines} = CanvasInternals;

export type UpdateSelectedOutlineSnapPoints = (
	snapPoints: readonly SelectedOutlineSnapPoint[],
) => void;

export const SelectedOutlineSnapLines: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly snapPoints: readonly SelectedOutlineSnapPoint[];
}> = ({compositionHeight, compositionWidth, scale, snapPoints}) => {
	return (
		<CanvasOutlineSnapLines
			compositionHeight={compositionHeight}
			compositionWidth={compositionWidth}
			scale={scale}
			snapPoints={snapPoints}
			color={selectedOutlineSnapIndicatorColor}
		/>
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
