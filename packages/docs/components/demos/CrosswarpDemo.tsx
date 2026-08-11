import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CrosswarpTransitionPreview} from '../transitions/crosswarp-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const CrosswarpDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/crosswarp-transition.mp4" />
		);
	}

	return <CrosswarpTransitionPreview />;
};
