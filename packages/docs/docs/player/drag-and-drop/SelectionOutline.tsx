import React, {useCallback, useMemo} from 'react';
import {useCurrentScale} from 'remotion';

import {DraggerHandle} from './DraggerHandle';
import type {Item} from './item';

export const SelectionOutline: React.FC<{
	item: Item;
	changeItem: (itemId: number, updater: (item: Item) => Item) => void;
	setSelectedItem: React.Dispatch<React.SetStateAction<number | null>>;
	selectedItem: number | null;
}> = ({item, changeItem, setSelectedItem, selectedItem}) => {
	const scale = useCurrentScale();
	const scaledBorder = Math.ceil(2 / scale);

	const [hovered, setHovered] = React.useState(false);

	const onMouseEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onMouseLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const selected = item.id === selectedItem;

	const style: React.CSSProperties = useMemo(() => {
		return {
			width: item.width,
			height: item.height,
			left: item.left,
			top: item.top,
			position: 'absolute',
			outline:
				hovered || selected ? `${scaledBorder}px solid #0B84F3` : undefined,
			userSelect: 'none',
		};
	}, [hovered, item, scaledBorder, selected]);

	const startDragging = useCallback(
		(e: PointerEvent | React.MouseEvent) => {
			const initialX = e.clientX;
			const initialY = e.clientY;

			const onPointerMove = (pointerMoveEvent: PointerEvent) => {
				const offsetX = (pointerMoveEvent.clientX - initialX) / scale;
				const offsetY = (pointerMoveEvent.clientY - initialY) / scale;
				changeItem(item.id, (i) => {
					const updatedItem: Item = {
						...(i as Item),
						left: Math.round(item.left + offsetX),
						top: Math.round(item.top + offsetY),
					};
					return updatedItem as Item;
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
			{selected ? (
				<>
					<DraggerHandle item={item} setItem={changeItem} type="top-left" />
					<DraggerHandle item={item} setItem={changeItem} type="top-right" />
					<DraggerHandle item={item} setItem={changeItem} type="bottom-left" />
					<DraggerHandle item={item} setItem={changeItem} type="bottom-right" />
				</>
			) : null}
		</div>
	);
};
