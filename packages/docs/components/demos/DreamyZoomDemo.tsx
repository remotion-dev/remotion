import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DreamyZoomTransitionPreview} from '../transitions/dreamy-zoom-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const DreamyZoomDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/dreamy-zoom-transition.mp4" />
		);
	}

	return <DreamyZoomTransitionPreview />;
};
