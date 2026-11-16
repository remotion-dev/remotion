import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import React from 'react';
import {AbsoluteFill, Easing, Sequence} from 'remotion';
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
					timing={linearTiming({
						durationInFrames: 20,
						easing: Easing.bezier(0.76, 0, 0.24, 1),
					})}
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
