import React, {useCallback, useMemo} from 'react';
import {useCurrentScale} from 'remotion';
import type {Item} from './item';

const REAL_SIZE = 8;

export const DraggerHandle: React.FC<{
	type: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	setItem: (itemId: number, updater: (item: Item) => Item) => void;
	item: Item;
}> = ({type, setItem, item}) => {
	const scale = useCurrentScale();
	const size = Math.round(REAL_SIZE / scale);

	const sizeStyle: React.CSSProperties = useMemo(() => {
		return {
			position: 'absolute',
			height: size,
			width: size,
			backgroundColor: 'white',
			border: '1px solid #0B84F3',
		};
	}, [size]);

	const margin = -size / 2 - 1 / scale;

	const style: React.CSSProperties = useMemo(() => {
		if (type === 'top-left') {
			return {
				...sizeStyle,
				marginLeft: margin,
				marginTop: margin,
				cursor: 'nwse-resize',
			};
		}

		if (type === 'top-right') {
			return {
				...sizeStyle,
				marginTop: margin,
				marginRight: margin,
				right: 0,
				cursor: 'nesw-resize',
			};
		}

		if (type === 'bottom-left') {
			return {
				...sizeStyle,
				marginBottom: margin,
				marginLeft: margin,
				bottom: 0,
				cursor: 'nesw-resize',
			};
		}

		if (type === 'bottom-right') {
			return {
				...sizeStyle,
				marginBottom: margin,
				marginRight: margin,
				right: 0,
				bottom: 0,
				cursor: 'nwse-resize',
			};
		}

		throw new Error('Unknown type: ' + JSON.stringify(type));
	}, [margin, sizeStyle, type]);

	const onPointerDown = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();

			const initialX = e.clientX;
			const initialY = e.clientY;

			const onPointerMove = (pointerMoveEvent: PointerEvent) => {
				const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
				const offsetY = (pointerMoveEvent.clientY - initialY) / scale;

				setItem(item.id, (i) => {
					const newWidth = Math.max(
						1,
						Math.round(
							item.width +
								(type === 'bottom-left' || type === 'top-left'
									? -offsetX
									: offsetX),
						),
					);
					const newHeight = Math.max(
						1,
						Math.round(
							item.height +
								(type === 'top-left' || type === 'top-right'
									? -offsetY
									: offsetY),
						),
					);
					const newLeft = Math.min(
						item.left + item.width - 1,
						Math.round(
							item.left +
								(type === 'bottom-left' || type === 'top-left' ? offsetX : 0),
						),
					);

					const newTop = Math.min(
						item.top + item.height - 1,
						Math.round(
							item.top +
								(type === 'top-left' || type === 'top-right' ? offsetY : 0),
						),
					);

					const updatedItem: Item = {
						...i,
						width: newWidth,
						height: newHeight,
						left: newLeft,
						top: newTop,
					};
					return updatedItem;
				});
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
			};

			window.addEventListener('pointermove', onPointerMove, {passive: true});

			window.addEventListener('pointerup', onPointerUp, {
				once: true,
			});
		},
		[item, scale, setItem, type],
	);

	return <div onPointerDown={onPointerDown} style={style} />;
};
