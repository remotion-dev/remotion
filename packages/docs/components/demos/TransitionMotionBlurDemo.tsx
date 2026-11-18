import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import React from 'react';
import {AbsoluteFill, Easing, Sequence, useVideoConfig} from 'remotion';
import {SceneA, SceneB} from '../transitions/TransitionScenes';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const TransitionMotionBlurLiveDemo: React.FC<{
	readonly shutterAngle: number;
}> = ({shutterAngle}) => {
	const {fps} = useVideoConfig();

	return (
		<Sequence playbackRate={0.25}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={fps}>
					<SceneA small={false} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slide({direction: 'from-left'})}
					timing={linearTiming({
						durationInFrames: Math.round((2 / 3) * fps),
						easing: Easing.bezier(0.76, 0, 0.24, 1),
					})}
					motionBlur={{shutterAngle, samples: 16}}
				/>
				<TransitionSeries.Sequence durationInFrames={fps}>
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
			<HtmlInCanvasDocsVideoFallback src="https://remotion.media/docs/motion-blur/transition-ea826b4c7b39.mp4" />
		);
	}

	return <TransitionMotionBlurLiveDemo shutterAngle={180} />;
};
