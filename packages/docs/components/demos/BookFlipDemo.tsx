import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BookFlipTransitionPreview} from '../transitions/book-flip-preview';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const BookFlipDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#111',
					color: 'white',
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'sans-serif',
					fontSize: 34,
					textAlign: 'center',
					padding: 40,
				}}
			>
				<div>Book flip requires Chrome with html-in-canvas enabled.</div>
			</AbsoluteFill>
		);
	}

	return <BookFlipTransitionPreview />;
};
