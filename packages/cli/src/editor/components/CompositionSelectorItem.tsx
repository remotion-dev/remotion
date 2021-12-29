import React, {MouseEventHandler, useCallback, useMemo, useState} from 'react';
import {TComposition} from 'remotion';
import {CLEAR_HOVER, LIGHT_TEXT, SELECTED_BACKGROUND} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {FilmIcon} from '../icons/film';
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

export const CompositionSelectorItem: React.FC<{
	composition: TComposition<unknown>;
	currentComposition: string | null;
	tabIndex: number;
	selectComposition: (c: TComposition) => void;
}> = ({composition, currentComposition, tabIndex, selectComposition}) => {
	const selected = currentComposition === composition.id;
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
			selectComposition(composition);
		},
		[composition, selectComposition]
	);

	return (
		<a
			style={style}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			href={composition.id}
			tabIndex={tabIndex}
			onClick={onClick}
		>
			{isCompositionStill(composition) ? (
				<StillIcon style={iconStyle} />
			) : (
				<FilmIcon style={iconStyle} />
			)}
			<Spacing x={1} />
			{composition.id}
		</a>
	);
};
