import {Dimensions} from '@remotion/media-parser';
import {ResizeOperation} from '@remotion/webcodecs';
import React, {useCallback} from 'react';

export const ResizeCorner: React.FC<{
	readonly innerDimensions: Dimensions;
	readonly outerDimensions: Dimensions;
	readonly videoDimensionsAfterRotation: Dimensions;
	readonly setResizeMode: React.Dispatch<
		React.SetStateAction<ResizeOperation | null>
	>;
	readonly onStart: () => void;
	readonly onEnd: () => void;
}> = ({
	innerDimensions,
	outerDimensions,
	setResizeMode,
	videoDimensionsAfterRotation,
	onEnd,
	onStart,
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
			const originalY = e.clientY;

			const currentScale = innerDimensions.width / outerDimensions.width;

			const getScale = (e: PointerEvent) => {
				const dx = e.clientX - originalX;
				const dy = e.clientY - originalY;

				const newScaleX = Math.min(
					1,
					currentScale + dx / (outerDimensions.width / 2),
				);
				const newScaleY = Math.min(
					1,
					currentScale + dy / (outerDimensions.height / 2),
				);
				const xBigger = Math.abs(dx) > Math.abs(dy);
				const newScale = Math.max(0.2, xBigger ? newScaleX : newScaleY);

				const newResizeMode: ResizeOperation = {
					mode: 'max-height-width',
					maxWidth: videoDimensionsAfterRotation.width * newScale,
					maxHeight: videoDimensionsAfterRotation.height * newScale,
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
			outerDimensions.height,
			outerDimensions.width,
			setResizeMode,
			videoDimensionsAfterRotation.height,
			videoDimensionsAfterRotation.width,
		],
	);

	return (
		<div
			className="w-6 h-6 rotate-45 bg-white border-2 border-black absolute -bottom-3 -right-3 cursor-nwse-resize"
			onPointerDown={onPointerDown}
		/>
	);
};
