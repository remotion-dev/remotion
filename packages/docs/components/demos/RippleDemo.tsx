import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RippleTransitionPreview} from '../transitions/ripple-preview';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const RippleDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#000'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/ripple-transition.mp4" />
		);
	}

	return <RippleTransitionPreview />;
};
