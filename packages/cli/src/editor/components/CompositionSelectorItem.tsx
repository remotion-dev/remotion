import React, {MouseEventHandler, useCallback, useMemo, useState} from 'react';
import {TComposition} from 'remotion';
import {CLEAR_HOVER, LIGHT_TEXT, SELECTED_BACKGROUND} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {FilmIcon} from '../icons/film';
import {ExpandedFolderIcon} from '../icons/folder';
import {StillIcon} from '../icons/still';
import {Spacing} from './layout';

const itemStyle: React.CSSProperties = {
	paddingRight: 8,
	paddingTop: 6,
	paddingBottom: 6,
	fontSize: 13,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
};

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
};

export type CompositionSelectorItemType =
	| {
			key: string;
			type: 'composition';
			composition: TComposition<unknown>;
	  }
	| {
			key: string;
			type: 'folder';
			folderName: string;
			items: CompositionSelectorItemType[];
	  };

export const CompositionSelectorItem: React.FC<{
	item: CompositionSelectorItemType;
	currentComposition: string | null;
	tabIndex: number;
	selectComposition: (c: TComposition) => void;
	level: number;
}> = ({item, level, currentComposition, tabIndex, selectComposition}) => {
	const selected = useMemo(() => {
		if (item.type === 'composition') {
			return currentComposition === item.composition.id;
		}

		return false;
	}, [item, currentComposition]);
	const [hovered, setHovered] = useState(false);
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...itemStyle,
			backgroundColor: hovered
				? selected
					? SELECTED_BACKGROUND
					: CLEAR_HOVER
				: selected
				? SELECTED_BACKGROUND
				: 'transparent',
			color: selected || hovered ? 'white' : LIGHT_TEXT,
			paddingLeft: 8 + level * 8,
		};
	}, [hovered, level, selected]);

	const onClick: MouseEventHandler = useCallback(
		(evt) => {
			evt.preventDefault();
			if (item.type === 'composition') {
				selectComposition(item.composition);
			} else {
				// Open / close folder
			}
		},
		[item, selectComposition]
	);

	if (item.type === 'folder') {
		return (
			<>
				<a
					style={style}
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
					tabIndex={tabIndex}
					onClick={onClick}
				>
					<ExpandedFolderIcon style={iconStyle} />
					<Spacing x={1} />
					{item.folderName}
				</a>
				{item.items.map((childItem) => {
					return (
						<CompositionSelectorItem
							key={childItem.key + childItem.type}
							currentComposition={currentComposition}
							selectComposition={selectComposition}
							item={childItem}
							tabIndex={tabIndex}
							level={level + 1}
						/>
					);
				})}
			</>
		);
	}

	return (
		<a
			style={style}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			href={item.composition.id}
			tabIndex={tabIndex}
			onClick={onClick}
		>
			{isCompositionStill(item.composition) ? (
				<StillIcon style={iconStyle} />
			) : (
				<FilmIcon style={iconStyle} />
			)}
			<Spacing x={1} />
			{item.composition.id}
		</a>
	);
};
