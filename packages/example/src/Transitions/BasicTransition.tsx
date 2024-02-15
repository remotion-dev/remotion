import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolateColors,
	random,
	Sequence,
} from 'remotion';

export const Letter: React.FC<{
	children: React.ReactNode;
	color: string;
}> = ({children, color}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: color,
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
				<Sequence>
					<Letter color="orange"> A</Letter>
				</Sequence>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={slide({direction: 'from-bottom'})}
				timing={springTiming()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="pink">B</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={wipe({direction: 'from-bottom-left'})}
				timing={linearTiming({
					durationInFrames: 30,
					easing: Easing.bounce,
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">C</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={fade({})}
				timing={linearTiming({
					durationInFrames: 40,
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">D</Letter>
			</TransitionSeries.Sequence>
			{new Array(10).fill(true).map((_, i) => (
				<>
					<TransitionSeries.Transition
						presentation={wipe({direction: 'from-left'})}
						timing={springTiming({
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
							{'EFHIJKLMNO'[i]}
						</Letter>
					</TransitionSeries.Sequence>
				</>
			))}
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 30})}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<Letter color="black">P</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 30})}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<Letter color="red">Q</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
