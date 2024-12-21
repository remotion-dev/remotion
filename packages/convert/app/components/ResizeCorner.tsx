import {Dimensions} from '@remotion/media-parser';
import {ResizeOperation} from '@remotion/webcodecs';
import React, {useCallback} from 'react';

export const ResizeCorner: React.FC<{
	readonly innerDimensions: Dimensions;
	readonly outerDimensions: Dimensions;
	readonly videoDimensions: Dimensions;
	readonly setResizeMode: React.Dispatch<
		React.SetStateAction<ResizeOperation | null>
	>;
	readonly onStart: () => void;
	readonly onEnd: () => void;
}> = ({
	innerDimensions,
	outerDimensions,
	setResizeMode,
	onEnd,
	onStart,
	videoDimensions,
}) => {
	const onPointerDown: React.PointerEventHandler = useCallback(
		(e) => {
			if (e.button !== 0) {
				// right-click
				return;
			}
			onStart();
			e.preventDefault();
			const originalX = e.clientX;

			const currentScale = innerDimensions.width / outerDimensions.width;

			const getScale = (e: PointerEvent) => {
				const dx = e.clientX - originalX;

				const newScaleX = Math.max(
					0.2,
					Math.min(1, currentScale + dx / (outerDimensions.width / 2)),
				);

				const newSmallerSide = Math.min(
					videoDimensions.width * newScaleX,
					videoDimensions.height * newScaleX,
				);

				const snapPoints = [2160, 1080, 720, 480, 360, 240, 144, 16];
				const isCloseToSnapPoint = snapPoints.find((point) => {
					return Math.abs(newSmallerSide - point) < 20;
				});
				const snapPoint = isCloseToSnapPoint ?? newSmallerSide;
				const scale = (snapPoint / newSmallerSide) * newScaleX;

				const newResizeMode: ResizeOperation = {
					mode: 'scale',
					scale,
				};
				setResizeMode(newResizeMode);
			};

			const onPointerMove = (e: PointerEvent) => {
				getScale(e);
			};

			const onPointerRelease = (e: PointerEvent) => {
				getScale(e);
				onEnd();
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerRelease);
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerRelease);
		},
		[
			innerDimensions.width,
			onEnd,
			onStart,
			outerDimensions.width,
			setResizeMode,
			videoDimensions.height,
			videoDimensions.width,
		],
	);

	return (
		<div
			className="w-6 h-6 rotate-45 bg-white border-2 border-black absolute -bottom-3 -right-3 cursor-nwse-resize"
			onPointerDown={onPointerDown}
		/>
	);
};
