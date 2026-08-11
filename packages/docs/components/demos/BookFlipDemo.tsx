import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BookFlipTransitionPreview} from '../transitions/book-flip-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const BookFlipDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/book-flip-transition.mp4" />
		);
	}

	return <BookFlipTransitionPreview />;
};
