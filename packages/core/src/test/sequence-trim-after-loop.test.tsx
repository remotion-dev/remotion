import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import type {ReactNode} from 'react';
import {AbsoluteFill} from '../AbsoluteFill.js';
import {Loop} from '../loop/index.js';
import {Sequence} from '../Sequence.js';
import {Series} from '../series/index.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useVideoConfig} from '../use-video-config.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

const Clock = ({label}: {readonly label: string}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const loop = Loop.useLoop();
	const format = (value: number) => Number(value.toFixed(10));

	return (
		<div>{`${label}: frame ${format(frame)}, duration ${format(
			durationInFrames,
		)}, iteration ${loop?.iteration ?? 'none'}, period ${
			loop ? format(loop.durationInFrames) : 'none'
		}`}</div>
	);
};

const renderFrame = ({
	frame,
	children,
	compositionDurationInFrames = 100,
}: {
	readonly frame: number;
	readonly children: ReactNode;
	readonly compositionDurationInFrames?: number;
}) => {
	return (
		<WrapSequenceContext
			currentFrame={frame}
			compositionDurationInFrames={compositionDurationInFrames}
		>
			{children}
		</WrapSequenceContext>
	);
};

test('trimAfter uses the child clock and the earliest end wins', () => {
	const content = (durationInFrames: number) => (
		<Sequence
			layout="none"
			from={5}
			trimBefore={10}
			trimAfter={18}
			playbackRate={2}
			durationInFrames={durationInFrames}
		>
			<Clock label="clock" />
		</Sequence>
	);
	const view = render(renderFrame({frame: 4, children: content(10)}));

	expect(view.container.textContent).toBe('');
	view.rerender(renderFrame({frame: 5, children: content(10)}));
	expect(view.container.textContent).toBe(
		'clock: frame 10, duration 18, iteration none, period none',
	);
	view.rerender(renderFrame({frame: 8, children: content(10)}));
	expect(view.container.textContent).toBe(
		'clock: frame 16, duration 18, iteration none, period none',
	);
	view.rerender(renderFrame({frame: 9, children: content(10)}));
	expect(view.container.textContent).toBe('');

	view.rerender(renderFrame({frame: 6, children: content(2)}));
	expect(view.container.textContent).toBe(
		'clock: frame 12, duration 14, iteration none, period none',
	);
	view.rerender(renderFrame({frame: 7, children: content(2)}));
	expect(view.container.textContent).toBe('');
});

test('loop repeats the trimmed range and exposes a partial final iteration', () => {
	const content = (
		<Sequence
			layout="none"
			from={3}
			trimBefore={10}
			trimAfter={16}
			playbackRate={2}
			durationInFrames={8}
			loop
		>
			<Clock label="clock" />
		</Sequence>
	);
	const view = render(renderFrame({frame: 2, children: content}));

	expect(view.container.textContent).toBe('');
	for (const [frame, expected] of [
		[3, 'clock: frame 10, duration 16, iteration 0, period 3'],
		[5, 'clock: frame 14, duration 16, iteration 0, period 3'],
		[6, 'clock: frame 10, duration 16, iteration 1, period 3'],
		[9, 'clock: frame 10, duration 14, iteration 2, period 3'],
		[10, 'clock: frame 12, duration 14, iteration 2, period 3'],
	] as const) {
		view.rerender(renderFrame({frame, children: content}));
		expect(view.container.textContent).toBe(expected);
	}

	view.rerender(renderFrame({frame: 5, children: content}));
	expect(view.container.textContent).toBe(
		'clock: frame 14, duration 16, iteration 0, period 3',
	);
	view.rerender(renderFrame({frame: 11, children: content}));
	expect(view.container.textContent).toBe('');
});

test('loop respects nested playback rates and a parent cutting an iteration short', () => {
	const fractionalBoundary = (
		<Sequence layout="none" playbackRate={0.3} durationInFrames={20}>
			<Sequence layout="none" trimAfter={1} loop>
				<Clock label="fractional" />
			</Sequence>
		</Sequence>
	);
	const view = render(renderFrame({frame: 10, children: fractionalBoundary}));
	expect(view.container.textContent).toBe(
		'fractional: frame 0, duration 1, iteration 3, period 1',
	);

	const parentCutoff = (
		<Sequence layout="none" durationInFrames={7}>
			<Sequence layout="none" trimAfter={4} loop>
				<Clock label="cutoff" />
			</Sequence>
		</Sequence>
	);
	view.unmount();
	const cutoffView = render(renderFrame({frame: 6, children: parentCutoff}));
	expect(cutoffView.container.textContent).toBe(
		'cutoff: frame 2, duration 3, iteration 1, period 4',
	);
	cutoffView.rerender(renderFrame({frame: 7, children: parentCutoff}));
	expect(cutoffView.container.textContent).toBe('');
});

test('Sequence loop matches Loop and timed wrappers forward the props', () => {
	const content = (
		<>
			<Loop durationInFrames={5} times={3} layout="none">
				<Clock label="Loop" />
			</Loop>
			<Sequence layout="none" trimAfter={5} durationInFrames={15} loop>
				<Clock label="Sequence" />
			</Sequence>
			<AbsoluteFill
				from={2}
				trimBefore={4}
				trimAfter={6}
				durationInFrames={5}
				loop
			>
				<Clock label="AbsoluteFill" />
			</AbsoluteFill>
		</>
	);
	const view = render(renderFrame({frame: 5, children: content}));
	expect(
		view.getByText('Loop: frame 0, duration 5, iteration 1, period 5'),
	).toBeTruthy();
	expect(
		view.getByText('Sequence: frame 0, duration 5, iteration 1, period 5'),
	).toBeTruthy();
	expect(
		view.getByText('AbsoluteFill: frame 5, duration 6, iteration 1, period 2'),
	).toBeTruthy();

	const series = (
		<Series>
			<Series.Sequence layout="none" durationInFrames={5} trimAfter={2} loop>
				<Clock label="first" />
			</Series.Sequence>
			<Series.Sequence layout="none" durationInFrames={3}>
				<Clock label="second" />
			</Series.Sequence>
		</Series>
	);
	view.rerender(renderFrame({frame: 4, children: series}));
	expect(view.container.textContent).toBe(
		'first: frame 0, duration 1, iteration 2, period 2',
	);
	view.rerender(renderFrame({frame: 5, children: series}));
	expect(view.container.textContent).toBe(
		'second: frame 0, duration 3, iteration none, period none',
	);
});
