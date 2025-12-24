import {expect, test} from 'bun:test';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries} from '../TransitionSeries.js';
import {fade} from '../presentations/fade.js';
import {linearTiming} from '../timings/linear-timing.js';
import {renderForFrame} from './render-for-frame.js';

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

test('Should throw if two transitions in a row', () => {
	expect(() => {
		return renderForFrame(
			10,
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<Letter color="green">C</Letter>
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={fade({})}
					timing={linearTiming({
						durationInFrames: 40,
					})}
				/>
				<TransitionSeries.Transition
					presentation={fade({})}
					timing={linearTiming({
						durationInFrames: 40,
					})}
				/>
			</TransitionSeries>,
		);
	}).toThrow(
		'A <TransitionSeries.Transition /> component must not be followed by another <TransitionSeries.Transition /> component (nth children = 1 and 2)',
	);
});
