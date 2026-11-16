import {springTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SceneA, SceneB} from '../transitions/TransitionScenes';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const TransitionMotionBlurLiveDemo: React.FC = () => {
	return (
		<Sequence playbackRate={0.25}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={30}>
					<SceneA small={false} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slide({direction: 'from-left'})}
					timing={springTiming({durationInFrames: 20, config: {damping: 200}})}
					motionBlur={{shutterAngle: 180, samples: 16}}
				/>
				<TransitionSeries.Sequence durationInFrames={30}>
					<SceneB small={false} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</Sequence>
	);
};

export const TransitionMotionBlurDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#0b84f3'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/transition-motion-blur.mp4" />
		);
	}

	return <TransitionMotionBlurLiveDemo />;
};
