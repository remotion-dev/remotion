import type {CropRectangle} from 'mediabunny';
import React, {useCallback, useMemo} from 'react';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';

const baseStyle: React.CSSProperties = {
	width: 12,
	height: 12,
};

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const clamp = (val: number, min: number, max: number) => {
	return Math.min(Math.max(val, min), max);
};

const MIN_SIZE = 120;

export const ResizeHandle: React.FC<{
	readonly position: Position;
	readonly divRef: React.RefObject<HTMLDivElement | null>;
	readonly dimensions: Dimensions;
	readonly rect: CropRectangle;
	readonly updateRect: React.Dispatch<React.SetStateAction<CropRectangle>>;
}> = ({position, divRef, dimensions, rect, updateRect}) => {
	const style: React.CSSProperties = useMemo(() => {
		if (position === 'top-left') {
			return {
				...baseStyle,
				top: (rect.top / dimensions.height) * 100 + '%',
				left: (rect.left / dimensions.width) * 100 + '%',
				marginLeft: -3,
				marginTop: -3,
				cursor: 'nwse-resize',
			};
		}

		if (position === 'top-right') {
			return {
				...baseStyle,
				top: (rect.top / dimensions.height) * 100 + '%',
				right:
					((dimensions.width - (rect.width + rect.left)) / dimensions.width) *
						100 +
					'%',
				marginRight: -3,
				marginTop: -3,
				cursor: 'nesw-resize',
			};
		}

		if (position === 'bottom-left') {
			return {
				...baseStyle,
				bottom:
					((dimensions.height - (rect.height + rect.top)) / dimensions.height) *
						100 +
					'%',
				left: (rect.left / dimensions.width) * 100 + '%',
				marginLeft: -3,
				marginBottom: -3,
				cursor: 'nesw-resize',
			};
		}

		if (position === 'bottom-right') {
			return {
				...baseStyle,
				bottom:
					((dimensions.height - (rect.height + rect.top)) / dimensions.height) *
						100 +
					'%',
				right:
					((dimensions.width - (rect.width + rect.left)) / dimensions.width) *
						100 +
					'%',
				marginRight: -3,
				marginBottom: -3,
				cursor: 'nwse-resize',
			};
		}

		throw new Error('Unknown position: ' + JSON.stringify(position));
	}, [position, rect, dimensions]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.button !== 0) {
				return;
			}

			const move = (evt: PointerEvent) => {
				evt.preventDefault();
				evt.stopPropagation();

				const boxOffset = divRef.current?.getBoundingClientRect()!;
				const offsetX = evt.clientX - boxOffset.left;
				const offsetY = evt.clientY - boxOffset.top;

				const factor = boxOffset.width / dimensions.width;
				const cropPixelsX = clamp(
					Math.round(offsetX / factor),
					0,
					dimensions.width,
				);
				const cropPixelsY = clamp(
					Math.round(offsetY / factor),
					0,
					dimensions.height,
				);

				if (position === 'top-left') {
					updateRect((prev) => {
						const x = Math.min(cropPixelsX, prev.width + prev.left - MIN_SIZE);
						const y = Math.min(cropPixelsY, prev.height + prev.top - MIN_SIZE);

						const diffX = x - prev.left;
						const diffY = y - prev.top;
						return {
							...prev,
							left: x,
							top: y,
							width: prev.width - diffX,
							height: prev.height - diffY,
						};
					});
				}

				if (position === 'top-right') {
					updateRect((prev) => {
						const newHeight = prev.height - (cropPixelsY - prev.top);
						const y = Math.min(cropPixelsY, prev.height + prev.top - MIN_SIZE);

						return {
							...prev,
							width: Math.max(MIN_SIZE, cropPixelsX - prev.left),
							height: Math.max(MIN_SIZE, newHeight),
							top: y,
						};
					});
				}

				if (position === 'bottom-left') {
					updateRect((prev) => {
						const x = Math.min(cropPixelsX, prev.width + prev.left - MIN_SIZE);

						const diffX = x - prev.left;

						return {
							...prev,
							height: Math.max(MIN_SIZE, cropPixelsY - prev.top),
							left: x,
							width: prev.width - diffX,
						};
					});
				}

				if (position === 'bottom-right') {
					updateRect((prev) => ({
						...prev,
						width: Math.max(MIN_SIZE, cropPixelsX - prev.left),
						height: Math.max(MIN_SIZE, cropPixelsY - prev.top),
					}));
				}

				throw new Error('Unknown position: ' + JSON.stringify(position));
			};

			const onPointerMove = (evt: PointerEvent) => {
				evt.preventDefault();
				evt.stopPropagation();
				move(evt);
			};

			const onPointerUp = (evt: PointerEvent) => {
				evt.preventDefault();
				evt.stopPropagation();

				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		},
		[dimensions.height, dimensions.width, divRef, position, updateRect],
	);

	return (
		<div
			className="w-3 h-3 bg-white absolute rounded-full border-2 border-black"
			style={style}
			onPointerDown={onPointerDown}
		/>
	);
};
