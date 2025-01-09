import type {Dimensions} from '@remotion/media-parser';
import type {ResizeOperation} from '@remotion/webcodecs';
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

			const getScale = (event: PointerEvent) => {
				const dx = event.clientX - originalX;

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

			const onPointerMove = (event: PointerEvent) => {
				getScale(event);
			};

			const onPointerRelease = (event: PointerEvent) => {
				getScale(event);
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
			className="w-6 h-6 rotate-45 bg-white border-2 border-black absolute -bottom-3 -right-3 cursor-nwse-resize touch-none"
			onPointerDown={onPointerDown}
		/>
	);
};
