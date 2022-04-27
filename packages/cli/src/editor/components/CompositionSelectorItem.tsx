import React, {MouseEventHandler, useCallback, useMemo, useState} from 'react';
import {TComposition} from 'remotion';
import {CLEAR_HOVER, LIGHT_TEXT, SELECTED_BACKGROUND} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {FilmIcon} from '../icons/film';
import {ExpandedFolderIcon} from '../icons/folder';
import {StillIcon} from '../icons/still';
import {Spacing} from './layout';

const item: React.CSSProperties = {
	paddingLeft: 8,
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
	composition: CompositionSelectorItemType;
	currentComposition: string | null;
	tabIndex: number;
	selectComposition: (c: TComposition) => void;
}> = ({composition, currentComposition, tabIndex, selectComposition}) => {
	const selected = useMemo(() => {
		if (composition.type === 'composition') {
			return currentComposition === composition.composition.id;
		}

		return false;
	}, [composition, currentComposition]);
	const [hovered, setHovered] = useState(false);
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...item,
			backgroundColor: hovered
				? selected
					? SELECTED_BACKGROUND
					: CLEAR_HOVER
				: selected
				? SELECTED_BACKGROUND
				: 'transparent',
			color: selected || hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	const onClick: MouseEventHandler = useCallback(
		(evt) => {
			evt.preventDefault();
			if (composition.type === 'composition') {
				selectComposition(composition.composition);
			} else {
				// Open / close folder
			}
		},
		[composition, selectComposition]
	);

	if (composition.type === 'folder') {
		return (
			<a
				style={style}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				tabIndex={tabIndex}
				onClick={onClick}
			>
				<ExpandedFolderIcon style={iconStyle} />
				<Spacing x={1} />
				{composition.folderName}
			</a>
		);
	}

	return (
		<a
			style={style}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			href={composition.composition.id}
			tabIndex={tabIndex}
			onClick={onClick}
		>
			{isCompositionStill(composition.composition) ? (
				<StillIcon style={iconStyle} />
			) : (
				<FilmIcon style={iconStyle} />
			)}
			<Spacing x={1} />
			{composition.composition.id}
		</a>
	);
};
