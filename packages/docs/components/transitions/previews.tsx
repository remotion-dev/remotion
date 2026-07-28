import type {CubeDirection} from '@remotion-dev/cube-presentation';
import {cube} from '@remotion-dev/cube-presentation';
import type {PlayerRef} from '@remotion/player';
import {Player} from '@remotion/player';
import type {
	TransitionPresentation,
	TransitionTiming,
} from '@remotion/transitions';
import {
	TransitionSeries,
	linearTiming,
	springTiming,
} from '@remotion/transitions';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {fade} from '@remotion/transitions/fade';
import type {FlipDirection} from '@remotion/transitions/flip';
import {flip} from '@remotion/transitions/flip';
import {iris} from '@remotion/transitions/iris';
import {none} from '@remotion/transitions/none';
import type {SlideDirection} from '@remotion/transitions/slide';
import {slide} from '@remotion/transitions/slide';
import type {WipeDirection} from '@remotion/transitions/wipe';
import {wipe} from '@remotion/transitions/wipe';
import React, {useEffect, useRef} from 'react';
import type {SpringConfig} from 'remotion';
import {
	AbsoluteFill,
	Img,
	measureSpring,
	spring,
	useVideoConfig,
} from 'remotion';
import {
	presentationCompositionHeight,
	presentationCompositionWidth,
} from '../TableOfContents/transitions/presentations';
import {customPresentation} from './custom-transition';

const sceneStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily: 'sans-serif',
	fontWeight: 900,
	color: 'white',
	fontSize: 100,
};

const backgroundImageStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	objectFit: 'cover',
};

const letterStyle: React.CSSProperties = {
	position: 'relative',
	textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
};

const SceneA: React.FC<{readonly small: boolean}> = ({small}) => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				src={`https://remotion.media/transition-bg-blue${small ? '-small' : ''}.jpg`}
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>A</div>
		</AbsoluteFill>
	);
};

const SceneB: React.FC<{readonly small: boolean}> = ({small}) => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				src={`https://remotion.media/transition-bg-pink${small ? '-small' : ''}.jpg`}
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>B</div>
		</AbsoluteFill>
	);
};

export const SampleTransition: React.FC<{
	readonly effect: TransitionPresentation<Record<string, unknown>>;
	readonly durationRestThreshold: number;
	readonly transition?: TransitionTiming;
	readonly small?: boolean;
	readonly firstSceneDurationInFrames: number | null;
	readonly secondSceneDurationInFrames: number | null;
}> = ({
	durationRestThreshold,
	effect,
	transition,
	small = false,
	firstSceneDurationInFrames,
	secondSceneDurationInFrames,
}) => {
	const firstSceneDuration = firstSceneDurationInFrames ?? 60;
	const secondSceneDuration = secondSceneDurationInFrames ?? 90;

	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={firstSceneDuration}>
				<SceneA small={small} />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={effect}
				timing={
					transition ??
					springTiming({
						config: {
							damping: 200,
						},
						durationInFrames: 60,
						durationRestThreshold,
					})
				}
			/>
			<TransitionSeries.Sequence durationInFrames={secondSceneDuration}>
				<SceneB small={small} />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const FadeDemo: React.FC = () => {
	return (
		<SampleTransition
			durationRestThreshold={0.001}
			effect={fade()}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const SlideDemo: React.FC<{
	readonly direction: SlideDirection;
}> = ({direction}) => {
	return (
		<SampleTransition
			effect={slide({direction})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const FlipDemo: React.FC<{
	readonly direction: FlipDirection;
}> = ({direction}) => {
	return (
		<SampleTransition
			effect={flip({direction})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const NoneDemo: React.FC<{}> = () => {
	return (
		<SampleTransition
			durationRestThreshold={0.001}
			effect={none({})}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const SlideDemoLongDurationRest: React.FC<{
	readonly direction: SlideDirection;
}> = ({direction}) => {
	return (
		<SampleTransition
			effect={slide({direction})}
			durationRestThreshold={0.005}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const WipeDemo: React.FC<{
	readonly direction: WipeDirection;
}> = ({direction}) => {
	return (
		<SampleTransition
			effect={wipe({direction})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const ClockWipeDemo: React.FC<{}> = () => {
	const {width, height} = useVideoConfig();

	return (
		<SampleTransition
			effect={clockWipe({width, height})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const IrisDemo: React.FC<{}> = () => {
	const {width, height} = useVideoConfig();

	return (
		<SampleTransition
			effect={iris({width, height})}
			transition={linearTiming({durationInFrames: 30})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const CubeDemo: React.FC<{readonly direction: CubeDirection}> = ({
	direction,
}) => {
	return (
		<SampleTransition
			effect={cube({direction})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const CustomTransitionDemo: React.FC<{}> = () => {
	const {width, height} = useVideoConfig();

	return (
		<SampleTransition
			effect={customPresentation({height, width})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

const customTiming = ({
	pauseDuration,
}: {
	pauseDuration: number;
}): TransitionTiming => {
	const firstHalf: Partial<SpringConfig> = {};
	const secondPush: Partial<SpringConfig> = {
		damping: 200,
	};

	return {
		getDurationInFrames: ({fps}) => {
			return (
				measureSpring({fps, config: firstHalf}) +
				measureSpring({fps, config: secondPush}) +
				pauseDuration
			);
		},
		getProgress({fps, frame}) {
			const first = spring({fps, frame, config: firstHalf});
			const second = spring({
				fps,
				frame,
				config: secondPush,
				delay: pauseDuration + measureSpring({fps, config: firstHalf}),
			});

			return first / 2 + second / 2;
		},
	};
};

export const CustomTimingDemo: React.FC<{}> = () => {
	return (
		<SampleTransition
			effect={slide({direction: 'from-left'})}
			transition={customTiming({pauseDuration: 5})}
			durationRestThreshold={0.001}
			firstSceneDurationInFrames={null}
			secondSceneDurationInFrames={null}
		/>
	);
};

export const PresentationPreview: React.FC<{
	readonly effect: TransitionPresentation<Record<string, unknown>>;
	readonly durationRestThreshold: number;
	readonly transition: TransitionTiming | null;
	readonly firstSceneDurationInFrames: number | null;
	readonly secondSceneDurationInFrames: number | null;
}> = ({
	effect,
	durationRestThreshold,
	transition,
	firstSceneDurationInFrames,
	secondSceneDurationInFrames,
}) => {
	const ref = useRef<PlayerRef>(null);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const callback = () => {
			current?.seekTo(0);
			current?.play();
		};

		current?.getContainerNode()?.addEventListener('pointerenter', callback);

		return () => {
			current
				?.getContainerNode()
				?.removeEventListener('pointerenter', callback);
		};
	}, []);

	return (
		<Player
			ref={ref}
			acknowledgeRemotionLicense
			component={SampleTransition}
			compositionHeight={presentationCompositionHeight}
			compositionWidth={presentationCompositionWidth}
			durationInFrames={60}
			fps={30}
			initiallyMuted
			numberOfSharedAudioTags={0}
			style={{
				height: 60,
				borderRadius: 6,
			}}
			inputProps={{
				effect,
				durationRestThreshold,
				firstSceneDurationInFrames,
				secondSceneDurationInFrames,
				small: true,
				transition,
			}}
		/>
	);
};
