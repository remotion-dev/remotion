import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';

export const COUNTDOWN_DURATION_IN_FRAMES = 59;

const PAGES = [
	{number: '3', from: 0, durationInFrames: 20},
	{number: '2', from: 20, durationInFrames: 20},
	{number: '1', from: 40, durationInFrames: 19},
] as const;

const CountdownPage: React.FC<{
	number: string;
	durationInFrames: number;
}> = ({number, durationInFrames}) => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				pointerEvents: 'none',
			}}
		>
			<Interactive.Div
				name={`Countdown number ${number}`}
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
						[0, Math.max(1, durationInFrames - 4), durationInFrames - 1],
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

export const Countdown: React.FC = () => {
	return (
		<AbsoluteFill>
			{PAGES.map((page) => (
				<Sequence
					key={page.number}
					name={`Countdown page ${page.number}`}
					from={page.from}
					durationInFrames={page.durationInFrames}
				>
					<CountdownPage
						number={page.number}
						durationInFrames={page.durationInFrames}
					/>
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
