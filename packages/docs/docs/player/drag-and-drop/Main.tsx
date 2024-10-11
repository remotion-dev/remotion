import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Item} from './DraggerHandle';
import {SelectionOutlines} from './SelectionOutlines';

export type MainProps = {
	items: Item[];
	setSelectedItem: React.Dispatch<React.SetStateAction<number | null>>;
	selectedItem: number | null;
	changeItem: (itemId: number, updater: (item: Item) => Item) => void;
};

export const Main: React.FC<MainProps> = ({
	items,
	setSelectedItem,
	selectedItem,
	changeItem,
}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#eee',
			}}
		>
			<SelectionOutlines
				selectedItem={selectedItem}
				items={items}
				setSelectedItem={setSelectedItem}
				changeItem={changeItem}
			/>
		</AbsoluteFill>
	);
};
