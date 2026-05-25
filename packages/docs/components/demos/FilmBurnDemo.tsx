import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FilmBurnTransitionPreview} from '../transitions/film-burn-preview';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const FilmBurnDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	return <FilmBurnTransitionPreview />;
};
