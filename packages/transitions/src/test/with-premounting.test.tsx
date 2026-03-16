import {expect, test} from 'bun:test';
import type {PropsWithChildren} from 'react';
import {
	AbsoluteFill,
	Freeze,
	Sequence,
	Series,
	useCurrentFrame,
} from 'remotion';
import {TransitionSeries} from '../TransitionSeries';
import {renderForFrame} from './render-for-frame';

type CustomAbsoluteFillProps = {
	readonly style?: React.CSSProperties;
};

const CustomAbsoluteFill = ({
	children,
	style,
}: PropsWithChildren<CustomAbsoluteFillProps>) => {
	return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const PremountFor20251208Component: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60} premountFor={30}>
				<div>hi</div>
			</TransitionSeries.Sequence>
			<TransitionSeries.Sequence durationInFrames={60} premountFor={30}>
				<Series>
					<Series.Sequence durationInFrames={30} premountFor={15} name="green">
						<CustomAbsoluteFill style={{backgroundColor: 'green'}} />
					</Series.Sequence>
					<Series.Sequence
						durationInFrames={30}
						premountFor={150}
						name="yellow"
					>
						<CustomAbsoluteFill style={{backgroundColor: 'yellow'}} />
					</Series.Sequence>
				</Series>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

test('Should premount the correct elements', () => {
	const outerHTML = renderForFrame(80, <PremountFor20251208Component />);
	expect(outerHTML).toContain('background-color:yellow');
});

function FrameSquare() {
	const frame = useCurrentFrame();
	return <div>{frame}</div>;
}

export const HelloWorld: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Series>
				<Series.Sequence durationInFrames={30}>
					<Freeze frame={0}>
						<FrameSquare />
					</Freeze>
				</Series.Sequence>
				<Series.Sequence durationInFrames={30}>
					<FrameSquare />
				</Series.Sequence>
				<Series.Sequence durationInFrames={30}>
					<FrameSquare />
				</Series.Sequence>
				<Series.Sequence durationInFrames={30}>
					<FrameSquare />
				</Series.Sequence>
				<Series.Sequence durationInFrames={120}>
					<Series>
						<Series.Sequence durationInFrames={30}>
							<Freeze frame={0}>
								<FrameSquare />
							</Freeze>
						</Series.Sequence>
						<Series.Sequence durationInFrames={30}>
							<FrameSquare />
						</Series.Sequence>
						<Series.Sequence durationInFrames={30}>
							<FrameSquare />
						</Series.Sequence>
						<Series.Sequence durationInFrames={30}>
							<FrameSquare />
						</Series.Sequence>
					</Series>
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};

test('should not regress #5673', () => {
	const outerHTML = renderForFrame(138, <HelloWorld />);
	expect(outerHTML).toContain('<div>0</div>');
});

const CurrentFrame = () => {
	const currentFrame = useCurrentFrame();
	return <div>{currentFrame}</div>;
};

const BugReport6027 = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,

				backgroundColor: 'red',
				color: 'white',
				fontSize: 50,

				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Sequence layout="none" from={0} durationInFrames={120}>
				<CurrentFrame />
			</Sequence>
			<Sequence layout="none" from={80} durationInFrames={140}>
				{/* this will display current frame in range 0-139 */}
				<CurrentFrame />
				<Freeze frame={0}>
					{/* this will display current frame 80 (expected 0) */}
					<CurrentFrame />
				</Freeze>
			</Sequence>
			<Sequence layout="none" from={180} durationInFrames={120}>
				<CurrentFrame />
			</Sequence>
		</div>
	);
};

test('should correctly render against report #6027', () => {
	const outerHTML = renderForFrame(138, <BugReport6027 />);
	expect(outerHTML).toContain('<div>0</div>');
});

// Regression test for https://github.com/remotion-dev/remotion/issues/6727
// premountFor should not cascade from parent to child Sequences
const BugReport6727: React.FC = () => {
	return (
		<Sequence from={15} premountFor={15}>
			{Array.from({length: 10}, (_, i) => (
				<Sequence key={i} from={i * 3} durationInFrames={3} premountFor={15}>
					<div data-child-id={i} />
				</Sequence>
			))}
		</Sequence>
	);
};

test('Should not cascade premountFor in nested Sequences - issue #6727', () => {
	// Parent starts at abs frame 15 with premountFor=15 (premounts from frame 0).
	// Each child has premountFor=15, so child i premounts when the absolute frame
	// is in [abs_start - 15, abs_start - 1] = [i*3, 15 + i*3 - 1].
	//
	// At frame 0: only child 0 (abs start=15, window [0,14]) should be premounted.
	// Before the fix, 6 children were premounted due to cascading.
	const frame0HTML = renderForFrame(0, <BugReport6727 />);
	const premountedAt0 = (frame0HTML.match(/data-child-id/g) ?? []).length;
	expect(premountedAt0).toBe(1);

	// At frame 3: children 0 (window [0,14]) and 1 (window [3,17]) should be premounted.
	const frame3HTML = renderForFrame(3, <BugReport6727 />);
	const premountedAt3 = (frame3HTML.match(/data-child-id/g) ?? []).length;
	expect(premountedAt3).toBe(2);
});
