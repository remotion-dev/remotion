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
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {StillIcon} from '../icons/still';
import {FilmIcon} from '../icons/video';
import {Row, Spacing} from './layout';
import {RenderButton} from './RenderButton';

const COMPOSITION_ITEM_HEIGHT = 32;

const itemStyle: React.CSSProperties = {
	paddingRight: 10,
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

const labelStyle: React.CSSProperties = {
	textAlign: 'left',
	textDecoration: 'none',
	fontSize: 13,
	flex: 1,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
	flexShrink: 0,
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
			paddingLeft: 12 + level * 8,
		};
	}, [hovered, level, selected]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: selected || hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered, selected]);

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
					title={item.folderName}
				>
					{item.expanded ? (
						<ExpandedFolderIcon
							style={iconStyle}
							color={hovered || selected ? 'white' : LIGHT_TEXT}
						/>
					) : (
						<CollapsedFolderIcon
							color={hovered || selected ? 'white' : LIGHT_TEXT}
							style={iconStyle}
						/>
					)}
					<Spacing x={1} />
					<div style={label}>{item.folderName}</div>
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

	// TODO: Button nested inside of button
	return (
		<Row align="center">
			<button
				style={style}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				tabIndex={tabIndex}
				onClick={onClick}
				type="button"
				title={item.composition.id}
			>
				{isCompositionStill(item.composition) ? (
					<StillIcon
						color={hovered || selected ? 'white' : LIGHT_TEXT}
						style={iconStyle}
					/>
				) : (
					<FilmIcon
						color={hovered || selected ? 'white' : LIGHT_TEXT}
						style={iconStyle}
					/>
				)}
				<Spacing x={1} />
				<div style={label}>{item.composition.id}</div>
				<Spacing x={0.5} />
				<RenderButton visible={hovered} composition={item.composition} />
			</button>
		</Row>
	);
};
