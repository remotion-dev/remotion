import {springTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {AbsoluteFill, staticFile} from 'remotion';
import {addSound} from './AudioTransition-add-sound';

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

export const AudioTransition: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence
				style={{backgroundColor: 'green', opacity: 0.5}}
				durationInFrames={100}
			>
				<Letter color="green">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={addSound(
					wipe({direction: 'from-bottom'}),
					staticFile('whip.mp3'),
				)}
				timing={springTiming()}
			/>
			<TransitionSeries.Sequence
				style={{backgroundColor: 'orange'}}
				durationInFrames={100}
			>
				<Letter color="transparent">A</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={addSound(
					slide({direction: 'from-bottom'}),
					staticFile('whip.mp3'),
				)}
				timing={springTiming()}
			/>
			<TransitionSeries.Sequence durationInFrames={100}>
				<Letter color="pink">B</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
