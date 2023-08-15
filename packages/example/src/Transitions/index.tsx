import {
	makeFadePresentation,
	makeLinearTiming,
	makeSlidePresentation,
	makeSpringTiming,
	makeWipePresentation,
	TransitionSeries,
} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Easing, interpolateColors, random} from 'remotion';

const Letter: React.FC<{
	children: React.ReactNode;
	color: string;
}> = ({children, color}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: color,
				opacity: 0.9,
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 200,
				color: 'white',
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

export const BasicTransition: React.FC = () => {
	return (
		<TransitionSeries from={30}>
			<TransitionSeries.Sequence durationInFrames={40}>
				<Letter color="orange"> A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={makeSlidePresentation({direction: 'from-bottom'})}
				timing={makeSpringTiming({config: {}})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="pink"> ?</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={makeWipePresentation({origin: 'from-bottom-left'})}
				timing={makeLinearTiming({
					durationInFrames: 30,
					easing: Easing.bounce,
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">B</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={makeFadePresentation({})}
				timing={makeLinearTiming({
					durationInFrames: 40,
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">Fade</Letter>
			</TransitionSeries.Sequence>
			{new Array(10).fill(true).map((_, i) => (
				<>
					<TransitionSeries.Transition
						presentation={makeWipePresentation({origin: 'from-left'})}
						timing={makeSpringTiming({
							config: {
								damping: 200,
							},
							durationInFrames: 30,
						})}
					/>
					<TransitionSeries.Sequence durationInFrames={35}>
						<Letter
							color={interpolateColors(random(i), [0, 1], ['red', 'blue'])}
						>
							{'ABCDEFHIJKLMNO'[i]}
						</Letter>
					</TransitionSeries.Sequence>
				</>
			))}
		</TransitionSeries>
	);
};
