import type {MouseEventHandler} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {TComposition} from 'remotion';
import {
	BACKGROUND,
	CLEAR_HOVER,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {FilmIcon} from '../icons/film';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {StillIcon} from '../icons/still';
import {Row, Spacing} from './layout';
import {COMPOSITION_ITEM_HEIGHT, RenderButton} from './RenderButton';

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
	appearance: 'none',
	border: 'none',
	width: '100%',
	textAlign: 'left',
	backgroundColor: BACKGROUND,
	height: COMPOSITION_ITEM_HEIGHT,
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
			parentName: string | null;
			items: CompositionSelectorItemType[];
			expanded: boolean;
	  };

export const CompositionSelectorItem: React.FC<{
	item: CompositionSelectorItemType;
	currentComposition: string | null;
	tabIndex: number;
	selectComposition: (c: TComposition, push: boolean) => void;
	toggleFolder: (folderName: string, parentName: string | null) => void;
	level: number;
}> = ({
	item,
	level,
	currentComposition,
	tabIndex,
	selectComposition,
	toggleFolder,
}) => {
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
				selectComposition(item.composition, true);
			} else {
				toggleFolder(item.folderName, item.parentName);
			}
		},
		[item, selectComposition, toggleFolder]
	);

	if (item.type === 'folder') {
		return (
			<>
				<button
					style={style}
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
					tabIndex={tabIndex}
					onClick={onClick}
					type="button"
				>
					{item.expanded ? (
						<ExpandedFolderIcon style={iconStyle} />
					) : (
						<CollapsedFolderIcon style={iconStyle} />
					)}
					<Spacing x={1} />
					{item.folderName}
				</button>
				{item.expanded
					? item.items.map((childItem) => {
							return (
								<CompositionSelectorItem
									key={childItem.key + childItem.type}
									currentComposition={currentComposition}
									selectComposition={selectComposition}
									item={childItem}
									tabIndex={tabIndex}
									level={level + 1}
									toggleFolder={toggleFolder}
								/>
							);
					  })
					: null}
			</>
		);
	}

	return (
		<Row align="center">
			<button
				style={style}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				tabIndex={tabIndex}
				onClick={onClick}
				type="button"
			>
				{isCompositionStill(item.composition) ? (
					<StillIcon style={iconStyle} />
				) : (
					<FilmIcon style={iconStyle} />
				)}
				<Spacing x={1} />
				{item.composition.id}
			</button>
			{isCompositionStill(item.composition) ? (
				<>
					<Spacing x={0.5} />
					<RenderButton composition={item.composition} />
				</>
			) : null}
		</Row>
	);
};
