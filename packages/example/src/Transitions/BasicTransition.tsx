import {springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

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

const B: React.FC = () => {
	return <Letter color="pink">B</Letter>;
};

export const BasicTransition: React.FC = () => {
	return (
		<Sequence durationInFrames={200} from={30} premountFor={100}>
			<TransitionSeries from={30}>
				<TransitionSeries.Sequence durationInFrames={40}>
					<Sequence>
						<Letter color="orange"> A</Letter>
					</Sequence>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={fade({})}
					timing={springTiming({durationInFrames: 10})}
				/>
				<TransitionSeries.Sequence premountFor={10} durationInFrames={40}>
					<B />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</Sequence>
	);
};
