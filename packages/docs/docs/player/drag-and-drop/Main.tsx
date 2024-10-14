import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';
import type {Item} from './item';
import {Layer} from './Layer';
import {SortedOutlines} from './SortedOutlines';

export type MainProps = {
	readonly items: Item[];
	readonly setSelectedItem: React.Dispatch<React.SetStateAction<number | null>>;
	readonly selectedItem: number | null;
	readonly changeItem: (itemId: number, updater: (item: Item) => Item) => void;
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
			<SortedOutlines
				selectedItem={selectedItem}
				items={items}
				setSelectedItem={setSelectedItem}
				changeItem={changeItem}
			/>
		</AbsoluteFill>
	);
};
