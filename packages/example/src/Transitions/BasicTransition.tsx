import {
	linearTiming,
	TransitionSeries,
	useTransitionProgress,
} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const Letter: React.FC<{
	readonly children: React.ReactNode;
	readonly color: string;
}> = ({children, color}) => {
	const {
		entering,
		exiting,
		isInTransitionSeries: isInTransition,
	} = useTransitionProgress();

	if (children === 'B') {
		console.log({entering, exiting, isInTransition});
	}
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
			{children} {entering.toFixed(2)} {exiting.toFixed(2)}{' '}
			{String(isInTransition)}
		</AbsoluteFill>
	);
};

export const BasicTransitionSceneB: React.FC = () => {
	return <Letter color="pink">B</Letter>;
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
				timing={linearTiming({durationInFrames: 18})}
			/>
			<TransitionSeries.Sequence durationInFrames={30} name="Connected scene B">
				<BasicTransitionSceneB />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={slide({direction: 'from-bottom'})}
				timing={linearTiming({durationInFrames: 10})}
			/>
			<TransitionSeries.Sequence durationInFrames={256}>
				<Letter color="pink">C</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
