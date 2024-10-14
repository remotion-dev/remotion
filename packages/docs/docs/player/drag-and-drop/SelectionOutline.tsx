import React, {useCallback, useMemo} from 'react';
import {useCurrentScale} from 'remotion';

import {ResizeHandle} from './ResizeHandle';
import type {Item} from './item';

export const SelectionOutline: React.FC<{
	item: Item;
	changeItem: (itemId: number, updater: (item: Item) => Item) => void;
	setSelectedItem: React.Dispatch<React.SetStateAction<number | null>>;
	selectedItem: number | null;
	isDragging: boolean;
}> = ({item, changeItem, setSelectedItem, selectedItem, isDragging}) => {
	const scale = useCurrentScale();
	const scaledBorder = Math.ceil(2 / scale);

	const [hovered, setHovered] = React.useState(false);

	const onMouseEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onMouseLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const isSelected = item.id === selectedItem;

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: item.width,
			height: item.height,
			left: item.left,
			top: item.top,
			position: 'absolute',
			outline:
				(hovered && !isDragging) || isSelected
					? `${scaledBorder}px solid #0B84F3`
					: undefined,
			userSelect: 'none',
			touchAction: 'none',
		};
	}, [item, hovered, isDragging, isSelected, scaledBorder]);

	const startDragging = useCallback(
		(e: PointerEvent | React.MouseEvent) => {
			const initialX = e.clientX;
			const initialY = e.clientY;

			const onPointerMove = (pointerMoveEvent: PointerEvent) => {
				const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
				const offsetY = (pointerMoveEvent.clientY - initialY) / scale;
				changeItem(item.id, (i) => {
					return {
						...i,
						left: Math.round(item.left + offsetX),
						top: Math.round(item.top + offsetY),
						isDragging: true,
					};
				});
			};

			const onPointerUp = () => {
				changeItem(item.id, (i) => {
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
		[item, scale, changeItem],
	);

	const onPointerDown = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (e.button !== 0) {
				return;
			}

			setSelectedItem(item.id);
			startDragging(e);
		},
		[item.id, setSelectedItem, startDragging],
	);

	return (
		<div
			onPointerDown={onPointerDown}
			onPointerEnter={onMouseEnter}
			onPointerLeave={onMouseLeave}
			style={style}
		>
			{isSelected ? (
				<>
					<ResizeHandle item={item} setItem={changeItem} type="top-left" />
					<ResizeHandle item={item} setItem={changeItem} type="top-right" />
					<ResizeHandle item={item} setItem={changeItem} type="bottom-left" />
					<ResizeHandle item={item} setItem={changeItem} type="bottom-right" />
				</>
			) : null}
		</div>
	);
};
