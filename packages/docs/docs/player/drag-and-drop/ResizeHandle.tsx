import React, {useCallback, useMemo} from 'react';
import {useCurrentScale} from 'remotion';
import type {Item} from './item';

const HANDLE_SIZE = 8;

export const ResizeHandle: React.FC<{
	readonly type: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	readonly setItem: (itemId: number, updater: (item: Item) => Item) => void;
	readonly item: Item;
}> = ({type, setItem, item}) => {
	const scale = useCurrentScale();
	const size = Math.round(HANDLE_SIZE / scale);
	const borderSize = 1 / scale;

	const sizeStyle: React.CSSProperties = useMemo(() => {
		return {
			position: 'absolute',
			height: size,
			width: size,
			backgroundColor: 'white',
			border: `${borderSize}px solid #0B84F3`,
		};
	}, [borderSize, size]);

	const margin = -size / 2 - borderSize;

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
			if (e.button !== 0) {
				return;
			}

			const initialX = e.clientX;
			const initialY = e.clientY;

			const onPointerMove = (pointerMoveEvent: PointerEvent) => {
				const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
				const offsetY = (pointerMoveEvent.clientY - initialY) / scale;

				const isLeft = type === 'top-left' || type === 'bottom-left';
				const isTop = type === 'top-left' || type === 'top-right';

				setItem(item.id, (i) => {
					const newWidth = item.width + (isLeft ? -offsetX : offsetX);
					const newHeight = item.height + (isTop ? -offsetY : offsetY);
					const newLeft = item.left + (isLeft ? offsetX : 0);
					const newTop = item.top + (isTop ? offsetY : 0);

					return {
						...i,
						width: Math.max(1, Math.round(newWidth)),
						height: Math.max(1, Math.round(newHeight)),
						left: Math.min(item.left + item.width - 1, Math.round(newLeft)),
						top: Math.min(item.top + item.height - 1, Math.round(newTop)),
						isDragging: true,
					};
				});
			};

			const onPointerUp = () => {
				setItem(item.id, (i) => {
					return {
						...i,
						isDragging: false,
					};
				});
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
