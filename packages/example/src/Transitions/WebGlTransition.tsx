import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {zoomBlur} from '@remotion/transitions/zoom-blur';
import React from 'react';
import {Easing} from 'remotion';
import {AbsoluteFill, Img, Sequence, staticFile} from 'remotion';

export const Letter: React.FC<{
	readonly children: React.ReactNode;
	readonly color: string;
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

export const WebGlTransition: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={90}>
				<Sequence>
					<Img className="absolute" src={staticFile('1.jpg')}></Img>
					<Letter color="transparent">A</Letter>
				</Sequence>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={zoomBlur({})}
				timing={springTiming({durationInFrames: 40})}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<Sequence>
					<Img
						className="absolute object-cover"
						src={staticFile('2.jpg')}
					></Img>
					<Letter color="transparent">B</Letter>
				</Sequence>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={zoomBlur({})}
				timing={linearTiming({
					durationInFrames: 40,
					easing: Easing.bezier(0.36, 0.53, 0, 1),
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<Sequence>
					<Img className="absolute" src={staticFile('1.jpg')}></Img>
					<Letter color="transparent">A</Letter>
				</Sequence>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={slide({})}
				timing={linearTiming({
					durationInFrames: 40,
					easing: Easing.bezier(0.36, 0.53, 0, 1),
				})}
			/>
			<TransitionSeries.Sequence durationInFrames={90}>
				<Sequence>
					<Img
						className="absolute object-cover"
						src={staticFile('2.jpg')}
					></Img>
					<Letter color="transparent">B</Letter>
				</Sequence>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
