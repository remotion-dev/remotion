import {springTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React, {useState} from 'react';
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
	const [id] = useState(() => Math.random());
	console.log(id);
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
				presentation={fade({})}
				timing={springTiming()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<B />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
