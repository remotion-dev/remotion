import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT} from '../helpers/colors';

const baseStyle: React.CSSProperties = {
	color: 'inherit',
	textDecoration: 'none',
	fontSize: 'inherit',
	textUnderlineOffset: 2,
	whiteSpace: 'nowrap',
};

const compositionNameStyle: React.CSSProperties = {
	...baseStyle,
	cursor: 'default',
};

const slashStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	marginInline: 4,
	position: 'relative',
	top: 1,
};

export const MenuCompositionName: React.FC = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const composition = useMemo(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return null;
		}

		return (
			compositions.find((c) => c.id === canvasContent.compositionId) ?? null
		);
	}, [canvasContent, compositions]);
	const asset = canvasContent?.type === 'asset' ? canvasContent.asset : null;

	if (!composition && asset === null) {
		return null;
	}

	const name = composition?.id ?? asset;

	return (
		<>
			<span style={slashStyle}>/</span>
			<span style={compositionNameStyle}>{name}</span>
		</>
	);
};
