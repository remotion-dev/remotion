import type {CropRectangle} from 'mediabunny';
import React, {useCallback, useMemo} from 'react';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './force-specific-cursor';
import {preventBodyScroll} from './prevent-body-scroll';

const clamp = (val: number, min: number, max: number) => {
	return Math.min(Math.max(val, min), max);
};

export const DragHandle: React.FC<{
	readonly divRef: React.RefObject<HTMLDivElement | null>;
	readonly dimensions: Dimensions;
	readonly rect: CropRectangle;
	readonly updateRect: React.Dispatch<React.SetStateAction<CropRectangle>>;
	readonly setMarkAsDragging: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({divRef, dimensions, rect, updateRect, setMarkAsDragging}) => {
	const style: React.CSSProperties = useMemo(() => {
		return {
			position: 'absolute' as const,
			top: (rect.top / dimensions.height) * 100 + '%',
			left: (rect.left / dimensions.width) * 100 + '%',
			width: (rect.width / dimensions.width) * 100 + '%',
			height: (rect.height / dimensions.height) * 100 + '%',
			cursor: 'move',
		};
	}, [rect, dimensions]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.button !== 0) {
				return;
			}

			forceSpecificCursor('move');
			setMarkAsDragging(true);

			const restoreBody = preventBodyScroll();

			const boxOffset = divRef.current?.getBoundingClientRect()!;
			const factor = boxOffset.width / dimensions.width;

			// Store the initial pointer position relative to the crop rect's top-left corner
			const initialPointerX = e.clientX;
			const initialPointerY = e.clientY;
			const initialLeft = rect.left;
			const initialTop = rect.top;

			const move = (evt: PointerEvent) => {
				evt.preventDefault();
				evt.stopPropagation();

				// Calculate the delta in screen pixels
				const deltaX = evt.clientX - initialPointerX;
				const deltaY = evt.clientY - initialPointerY;

				// Convert to crop pixels
				const deltaCropX = deltaX / factor;
				const deltaCropY = deltaY / factor;

				// Calculate new position
				const newLeft = initialLeft + deltaCropX;
				const newTop = initialTop + deltaCropY;

				// Clamp to boundaries
				const clampedLeft = clamp(newLeft, 0, dimensions.width - rect.width);
				const clampedTop = clamp(newTop, 0, dimensions.height - rect.height);

				updateRect((prev) => ({
					...prev,
					left: Math.round(clampedLeft),
					top: Math.round(clampedTop),
				}));
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
				setMarkAsDragging(false);
				restoreBody();

				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		},
		[
			dimensions.height,
			dimensions.width,
			divRef,
			rect,
			updateRect,
			setMarkAsDragging,
		],
	);

	return (
		<div
			style={style}
			className="touch-none"
			onPointerDown={onPointerDown}
			// No visible styling - invisible hit area
		/>
	);
};
