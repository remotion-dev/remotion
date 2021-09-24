import React, {useCallback, useState} from 'react';
import {TComposition} from 'remotion';
import {CLEAR_HOVER, LIGHT_TEXT, SELECTED_BACKGROUND} from '../helpers/colors';
import {FONT_FAMILY} from '../helpers/font';
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
	fontFamily: FONT_FAMILY,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
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

	return (
		<a
			style={{
				...item,
				backgroundColor: hovered
					? selected
						? SELECTED_BACKGROUND
						: CLEAR_HOVER
					: selected
					? SELECTED_BACKGROUND
					: 'transparent',
				color: selected || hovered ? 'white' : LIGHT_TEXT,
			}}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			href={composition.id}
			tabIndex={tabIndex}
			onClick={(evt) => {
				evt.preventDefault();
				selectComposition(composition);
			}}
		>
			{isCompositionStill(composition) ? (
				<StillIcon style={{height: 18, width: 18}} />
			) : (
				<FilmIcon style={{height: 18, width: 18}} />
			)}
			<Spacing x={0.5} />
			{composition.id}
		</a>
	);
};
