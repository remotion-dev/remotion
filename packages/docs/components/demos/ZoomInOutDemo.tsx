import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ZoomInOutTransitionPreview} from '../transitions/zoom-in-out-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const ZoomInOutDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/zoom-in-out-transition.mp4" />
		);
	}

	return <ZoomInOutTransitionPreview />;
};
