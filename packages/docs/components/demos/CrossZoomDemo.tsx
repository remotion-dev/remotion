import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CrossZoomTransitionPreview} from '../transitions/cross-zoom-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const CrossZoomDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/cross-zoom-transition.mp4" />
		);
	}

	return <CrossZoomTransitionPreview />;
};
