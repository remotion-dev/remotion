import type {CubeDirection} from '@remotion-dev/cube-presentation';
import {cube} from '@remotion-dev/cube-presentation';
import type {PlayerRef} from '@remotion/player';
import {Player} from '@remotion/player';
import type {
	TransitionPresentation,
	TransitionTiming,
} from '@remotion/transitions';
import {TransitionSeries, springTiming} from '@remotion/transitions';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {fade} from '@remotion/transitions/fade';
import type {FlipDirection} from '@remotion/transitions/flip';
import {flip} from '@remotion/transitions/flip';
import {none} from '@remotion/transitions/none';
import type {SlideDirection} from '@remotion/transitions/slide';
import {slide} from '@remotion/transitions/slide';
import type {WipeDirection} from '@remotion/transitions/wipe';
import {wipe} from '@remotion/transitions/wipe';
import React, {useEffect, useRef} from 'react';
import type {SpringConfig} from 'remotion';
import {AbsoluteFill, measureSpring, spring, useVideoConfig} from 'remotion';
import {
	presentationCompositionHeight,
	presentationCompositionWidth,
} from '../TableOfContents/transitions/presentations';
import {customPresentation} from './custom-transition';

const SceneA: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#0b84f3',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
				fontSize: 100,
			}}
		>
			A
		</AbsoluteFill>
	);
};

const SceneB: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'pink',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
				fontSize: 100,
			}}
		>
			B
		</AbsoluteFill>
	);
};

export const SampleTransition: React.FC<{
	readonly effect: TransitionPresentation<Record<string, unknown>>;
	readonly durationRestThreshold: number;
	readonly transition?: TransitionTiming;
}> = ({durationRestThreshold, effect, transition}) => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneA />
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
			<TransitionSeries.Sequence durationInFrames={90}>
				<SceneB />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const FadeDemo: React.FC = () => {
	return <SampleTransition effect={fade()} durationRestThreshold={0.001} />;
};

export const SlideDemo: React.FC<{
	readonly direction: SlideDirection;
}> = ({direction}) => {
	return (
		<SampleTransition
			effect={slide({direction})}
			durationRestThreshold={0.001}
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
		/>
	);
};

export const NoneDemo: React.FC<{}> = () => {
	return <SampleTransition effect={none({})} durationRestThreshold={0.001} />;
};

export const SlideDemoLongDurationRest: React.FC<{
	readonly direction: SlideDirection;
}> = ({direction}) => {
	return (
		<SampleTransition
			effect={slide({direction})}
			durationRestThreshold={0.005}
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
		/>
	);
};

export const ClockWipeDemo: React.FC<{}> = () => {
	const {width, height} = useVideoConfig();

	return (
		<SampleTransition
			effect={clockWipe({width, height})}
			durationRestThreshold={0.001}
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
		/>
	);
};

export const CustomTransitionDemo: React.FC<{}> = () => {
	const {width, height} = useVideoConfig();

	return (
		<SampleTransition
			effect={customPresentation({height, width})}
			durationRestThreshold={0.001}
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
		/>
	);
};

export const PresentationPreview: React.FC<{
	readonly effect: TransitionPresentation<Record<string, unknown>>;
	readonly durationRestThreshold: number;
}> = ({effect, durationRestThreshold}) => {
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
			component={SampleTransition}
			compositionHeight={presentationCompositionHeight}
			compositionWidth={presentationCompositionWidth}
			durationInFrames={60}
			fps={30}
			numberOfSharedAudioTags={0}
			style={{
				height: 60,
				borderRadius: 6,
			}}
			inputProps={{
				effect,
				durationRestThreshold,
			}}
		/>
	);
};
