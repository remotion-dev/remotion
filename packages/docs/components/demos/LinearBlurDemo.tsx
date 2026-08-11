import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LinearBlurTransitionPreview} from '../transitions/linear-blur-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const LinearBlurDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/linear-blur-transition.mp4" />
		);
	}

	return <LinearBlurTransitionPreview />;
};
