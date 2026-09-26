import {expect, test} from 'bun:test';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fade} from '../presentations/fade.js';
import {linearTiming} from '../timings/linear-timing.js';
import {TransitionSeries} from '../TransitionSeries.js';
import {renderForFrame} from './render-for-frame.js';

const ABS_FILL =
	'<div style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex">';

const Frame = () => <span>{useCurrentFrame()}</span>;

test('TransitionSeries playback rates cascade and determine sequence boundaries', () => {
	const markup = (
		<TransitionSeries playbackRate={2}>
			<TransitionSeries.Sequence durationInFrames={20} playbackRate={0.5}>
				<Frame />
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence durationInFrames={20} playbackRate={3}>
				<Frame />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);

	expect(renderForFrame(9, markup)).toContain('<span>9</span>');
	expect(renderForFrame(10, markup)).toContain('<span>10</span>');
	expect(renderForFrame(20, markup)).toContain('<span>0</span>');
	expect(renderForFrame(23, markup)).toContain('<span>18</span>');
	expect(renderForFrame(24, markup)).not.toContain('<span>');
});

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
