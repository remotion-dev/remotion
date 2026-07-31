import React from 'react';
import type {Item} from './item';
import {SelectionOutline} from './SelectionOutline';

const displaySelectedItemOnTop = (
	items: Item[],
	selectedItem: number | null,
): Item[] => {
	const selectedItems = items.filter((item) => item.id === selectedItem);
	const unselectedItems = items.filter((item) => item.id !== selectedItem);

	return [...unselectedItems, ...selectedItems];
};

export const SortedOutlines: React.FC<{
	items: Item[];
	selectedItem: number | null;
	changeItem: (itemId: number, updater: (item: Item) => Item) => void;
	setSelectedItem: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({items, selectedItem, changeItem, setSelectedItem}) => {
	const itemsToDisplay = React.useMemo(
		() => displaySelectedItemOnTop(items, selectedItem),
		[items, selectedItem],
	);

	const isDragging = React.useMemo(
		() => items.some((item) => item.isDragging),
		[items],
	);

	return itemsToDisplay.map((item) => {
		return (
			<SelectionOutline
				key={item.id}
				changeItem={changeItem}
				item={item}
				setSelectedItem={setSelectedItem}
				selectedItem={selectedItem}
				isDragging={isDragging}
			/>
		);
	});
};
