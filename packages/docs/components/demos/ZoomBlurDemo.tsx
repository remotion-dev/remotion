import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ZoomBlurTransitionPreview} from '../transitions/zoom-blur-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const ZoomBlurDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/zoom-blur-transition.mp4" />
		);
	}

	return <ZoomBlurTransitionPreview />;
};
