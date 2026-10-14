import React from 'react';
import {
	useVideoConfig,
	AbsoluteFill,
	Easing,
	Interactive,
	type InteractivitySchema,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const COUNTDOWN_DURATION_IN_FRAMES = 59;

const CountdownPageInner: React.FC<{
	readonly number: string;
}> = ({number}) => {
	const {fps, durationInFrames} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			showInTimeline={false}
			premountFor={fps}
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				pointerEvents: 'none',
			}}
		>
			<Interactive.Div
				premountFor={fps}
				name="Countdown number"
				style={{
					color: '#ffffff',
					filter:
						'drop-shadow(0 18px 0 rgba(0, 0, 0, 0.96)) drop-shadow(0 36px 42px rgba(0, 0, 0, 0.55))',
					fontFamily: 'Arial Black, Arial, sans-serif',
					fontSize: 900,
					fontWeight: 900,
					letterSpacing: -72,
					lineHeight: 1,
					opacity: interpolate(
						frame,
						[0, durationInFrames - 4, durationInFrames - 1],
						[1, 1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.4, 0, 1, 1),
						},
					),
					paddingRight: 72,
					scale: interpolate(frame, [0, durationInFrames - 1], [1.35, 0.45], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						output: 'perceptual-scale',
					}),
					textAlign: 'center',
					transformOrigin: 'center center',
					WebkitTextStroke: '14px #000000',
				}}
			>
				{number}
			</Interactive.Div>
		</AbsoluteFill>
	);
};

const countdownPageSchema = {
	number: {type: 'string', default: '3', description: 'Number'},
} as const satisfies InteractivitySchema;

const CountdownPage = Interactive.withSchema({
	Component: CountdownPageInner,
	componentName: 'CountdownPage',
	schema: countdownPageSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});

const CountdownInner: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<>
			<CountdownPage
				name="Countdown 3"
				number="3"
				durationInFrames={20}
				premountFor={fps}
			/>
			<CountdownPage
				name="Countdown 2"
				number="2"
				from={20}
				durationInFrames={20}
				premountFor={fps}
			/>
			<CountdownPage
				name="Countdown 1"
				number="1"
				from={40}
				durationInFrames={19}
				premountFor={fps}
			/>
		</>
	);
};

export const Countdown = Interactive.withSchema({
	Component: CountdownInner,
	componentName: 'Countdown',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
