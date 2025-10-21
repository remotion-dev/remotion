import type {CropRectangle} from 'mediabunny';
import React, {useCallback, useMemo} from 'react';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './force-specific-cursor';

type EdgePosition = 'top' | 'right' | 'bottom' | 'left';

const clamp = (val: number, min: number, max: number) => {
	return Math.min(Math.max(val, min), max);
};

const MIN_SIZE = 120;
const EDGE_HIT_AREA = 8; // pixels on each side of the edge for hit detection

const getCursor = (position: EdgePosition) => {
	if (position === 'top' || position === 'bottom') {
		return 'ns-resize';
	}

	if (position === 'left' || position === 'right') {
		return 'ew-resize';
	}

	throw new Error(
		'Unknown position: ' + JSON.stringify(position satisfies never),
	);
};

export const EdgeHandle: React.FC<{
	readonly position: EdgePosition;
	readonly divRef: React.RefObject<HTMLDivElement | null>;
	readonly dimensions: Dimensions;
	readonly rect: CropRectangle;
	readonly updateRect: React.Dispatch<React.SetStateAction<CropRectangle>>;
}> = ({position, divRef, dimensions, rect, updateRect}) => {
	const style: React.CSSProperties = useMemo(() => {
		const hitArea = EDGE_HIT_AREA;

		if (position === 'top') {
			return {
				position: 'absolute' as const,
				top: (rect.top / dimensions.height) * 100 + '%',
				left: (rect.left / dimensions.width) * 100 + '%',
				width: (rect.width / dimensions.width) * 100 + '%',
				height: hitArea * 2,
				marginTop: -hitArea,
				cursor: 'ns-resize',
			};
		}

		if (position === 'bottom') {
			return {
				position: 'absolute' as const,
				bottom:
					((dimensions.height - (rect.height + rect.top)) / dimensions.height) *
						100 +
					'%',
				left: (rect.left / dimensions.width) * 100 + '%',
				width: (rect.width / dimensions.width) * 100 + '%',
				height: hitArea * 2,
				marginBottom: -hitArea,
				cursor: 'ns-resize',
			};
		}

		if (position === 'left') {
			return {
				position: 'absolute' as const,
				top: (rect.top / dimensions.height) * 100 + '%',
				left: (rect.left / dimensions.width) * 100 + '%',
				width: hitArea * 2,
				height: (rect.height / dimensions.height) * 100 + '%',
				marginLeft: -hitArea,
				cursor: 'ew-resize',
			};
		}

		if (position === 'right') {
			return {
				position: 'absolute' as const,
				top: (rect.top / dimensions.height) * 100 + '%',
				right:
					((dimensions.width - (rect.width + rect.left)) / dimensions.width) *
						100 +
					'%',
				width: hitArea * 2,
				height: (rect.height / dimensions.height) * 100 + '%',
				marginRight: -hitArea,
				cursor: 'ew-resize',
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

			forceSpecificCursor(getCursor(position));

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

				if (position === 'top') {
					return updateRect((prev) => {
						const y = Math.min(cropPixelsY, prev.height + prev.top - MIN_SIZE);
						const diffY = y - prev.top;
						return {
							...prev,
							top: y,
							height: prev.height - diffY,
						};
					});
				}

				if (position === 'bottom') {
					return updateRect((prev) => ({
						...prev,
						height: Math.max(MIN_SIZE, cropPixelsY - prev.top),
					}));
				}

				if (position === 'left') {
					return updateRect((prev) => {
						const x = Math.min(cropPixelsX, prev.width + prev.left - MIN_SIZE);
						const diffX = x - prev.left;
						return {
							...prev,
							left: x,
							width: prev.width - diffX,
						};
					});
				}

				if (position === 'right') {
					return updateRect((prev) => ({
						...prev,
						width: Math.max(MIN_SIZE, cropPixelsX - prev.left),
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

				stopForcingSpecificCursor();

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
			style={style}
			onPointerDown={onPointerDown}
			// No visible styling - invisible hit area
		/>
	);
};
