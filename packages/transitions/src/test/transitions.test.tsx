import {expect, test} from 'bun:test';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fade} from '../presentations/fade.js';
import {linearTiming} from '../timings/linear-timing.js';
import {TransitionSeries} from '../TransitionSeries.js';
import {renderForFrame} from './render-for-frame.js';

const ABS_FILL =
	'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex">';

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

test('Should allow empty TransitionSeries.Sequence', () => {
	const outerHTML = renderForFrame(
		70,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">C</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence durationInFrames={60} />
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="blue">D</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);

	expect(outerHTML).toBe(`${ABS_FILL}${ABS_FILL}</div></div>`);
});

test('TransitionSeries.Sequence ignores a from prop passed from JavaScript', () => {
	const outerHTML = renderForFrame(
		70,
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Letter color="green">C</Letter>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence
				durationInFrames={60}
				{...({from: 0} as {from: number})}
			>
				<Letter color="blue">D</Letter>
			</TransitionSeries.Sequence>
		</TransitionSeries>,
	);

	expect(outerHTML).toContain('D');
});

test('TransitionSeries.Sequence trimBefore shifts child frames without moving later sequences', () => {
	const FrameLabel: React.FC<{readonly label: string}> = ({label}) => {
		const frame = useCurrentFrame();
		return <div>{`${label}${frame}`}</div>;
	};

	const content = (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={40} trimBefore={12}>
				<FrameLabel label="first" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={fade({})}
				timing={linearTiming({durationInFrames: 10})}
			/>
			<TransitionSeries.Sequence durationInFrames={30}>
				<FrameLabel label="second" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);

	expect(renderForFrame(0, content)).toContain('first12');
	expect(renderForFrame(1, content)).toContain('first13');
	// Second sequence still starts at frame 30 after the 10-frame overlap.
	expect(renderForFrame(29, content)).not.toContain('second');
	expect(renderForFrame(30, content)).toContain('second0');
	expect(renderForFrame(31, content)).toContain('second1');
});
