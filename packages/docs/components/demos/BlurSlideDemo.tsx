import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BlurSlideTransitionPreview} from '../transitions/blur-slide-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const BlurSlideDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/blur-slide-transition.mp4" />
		);
	}

	return <BlurSlideTransitionPreview />;
};
