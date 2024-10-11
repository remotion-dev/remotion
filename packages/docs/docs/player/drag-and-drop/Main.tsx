import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';
import type {Item} from './item';
import {Layer} from './Layer';
import {SelectionOutlines} from './SelectionOutlines';

export type MainProps = {
	items: Item[];
	setSelectedItem: React.Dispatch<React.SetStateAction<number | null>>;
	selectedItem: number | null;
	changeItem: (itemId: number, updater: (item: Item) => Item) => void;
};

const outer: React.CSSProperties = {
	backgroundColor: '#eee',
};

const layerContainer: React.CSSProperties = {
	overflow: 'hidden',
};

export const Main: React.FC<MainProps> = ({
	items,
	setSelectedItem,
	selectedItem,
	changeItem,
}) => {
	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			if (e.button !== 0) {
				return;
			}

			setSelectedItem(null);
		},
		[setSelectedItem],
	);

	return (
		<AbsoluteFill style={outer} onPointerDown={onPointerDown}>
			<AbsoluteFill style={layerContainer}>
				{items.map((item) => {
					return <Layer key={item.id} item={item} />;
				})}
			</AbsoluteFill>
			<SelectionOutlines
				selectedItem={selectedItem}
				items={items}
				setSelectedItem={setSelectedItem}
				changeItem={changeItem}
			/>
		</AbsoluteFill>
	);
};
