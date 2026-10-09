import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import type {ReactNode} from 'react';
import {Freeze} from '../freeze.js';
import {Internals} from '../internals.js';
import {Sequence} from '../Sequence.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useVideoConfig} from '../use-video-config.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

const Clock = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			Frame {frame}, duration {durationInFrames}
		</div>
	);
};

test('nested rates scale child clocks, trims and durations within parent-frame windows', () => {
	const content = (frame: number) => (
		<WrapSequenceContext currentFrame={frame} compositionDurationInFrames={120}>
			<Sequence from={30} durationInFrames={40} playbackRate={2}>
				<Sequence
					from={10}
					durationInFrames={20}
					playbackRate={0.5}
					trimBefore={3}
				>
					<Clock />
				</Sequence>
			</Sequence>
		</WrapSequenceContext>
	);
	const view = render(content(34));
	expect(view.container.textContent).toBe('');
	view.rerender(content(35));
	expect(view.getByText('Frame 3, duration 18')).toBeTruthy();
	view.rerender(content(44));
	expect(view.getByText('Frame 12, duration 18')).toBeTruthy();
	view.rerender(content(50));
	expect(view.container.textContent).toBe('');
});

test('slow sequences retain fractional child frames and freeze in the child clock', () => {
	const content = (frame: number, frozen: boolean) => (
		<WrapSequenceContext currentFrame={frame}>
			<Sequence
				from={10}
				durationInFrames={20}
				playbackRate={0.5}
				trimBefore={4}
			>
				{frozen ? (
					<Freeze frame={6}>
						<Clock />
					</Freeze>
				) : (
					<Clock />
				)}
			</Sequence>
		</WrapSequenceContext>
	);
	const view = render(content(11, false));
	expect(view.getByText('Frame 4.5, duration 24')).toBeTruthy();
	view.rerender(content(20, true));
	expect(view.getByText('Frame 6, duration 24')).toBeTruthy();
	view.rerender(content(49, true));
	expect(view.getByText('Frame 6, duration 24')).toBeTruthy();
	view.rerender(content(50, true));
	expect(view.container.textContent).toBe('');
});

test('parent-evaluated animation keeps the parent clock', () => {
	const Parent = () => {
		const frame = useCurrentFrame();
		return (
			<Sequence playbackRate={2} durationInFrames={20}>
				<div>Parent {frame}</div>
				<Clock />
			</Sequence>
		);
	};

	const view = render(
		<WrapSequenceContext currentFrame={5}>
			<Parent />
		</WrapSequenceContext>,
	);
	expect(view.getByText('Parent 5')).toBeTruthy();
	expect(view.getByText('Frame 10, duration 20')).toBeTruthy();
});

test('premount and postmount freeze accelerated descendants at the window boundaries', () => {
	const Preview = ({children}: {readonly children: ReactNode}) => (
		<Internals.RemotionEnvironmentContext
			value={{
				isRendering: false,
				isClientSideRendering: false,
				isPlayer: true,
				isStudio: false,
				isReadOnlyStudio: false,
			}}
		>
			{children}
		</Internals.RemotionEnvironmentContext>
	);
	const content = (frame: number) => (
		<WrapSequenceContext currentFrame={frame}>
			<Preview>
				<Sequence playbackRate={2}>
					<Sequence
						from={20}
						durationInFrames={10}
						playbackRate={3}
						trimBefore={6}
						premountFor={4}
						postmountFor={4}
					>
						<Clock />
					</Sequence>
				</Sequence>
			</Preview>
		</WrapSequenceContext>
	);
	const view = render(content(8));
	expect(view.getByText('Frame 6, duration 16')).toBeTruthy();
	view.rerender(content(12));
	expect(view.getByText('Frame 12.999999999999996, duration 16')).toBeTruthy();
	view.rerender(content(15));
	expect(view.container.textContent).toBe('');
});

test('playbackRate rejects invalid values and animation while allowing a paused static edit', () => {
	for (const playbackRate of [0, -1, Infinity, NaN, '2']) {
		expect(() =>
			render(
				<WrapSequenceContext>
					<Sequence playbackRate={playbackRate as number} />
				</WrapSequenceContext>,
			),
		).toThrow(/positive finite number/);
	}

	const content = (frame: number, playbackRate: number) => (
		<WrapSequenceContext currentFrame={frame}>
			<Sequence playbackRate={playbackRate} durationInFrames={20}>
				<Clock />
			</Sequence>
		</WrapSequenceContext>
	);
	const view = render(content(5, 1));
	view.rerender(content(5, 2));
	expect(view.getByText('Frame 10, duration 20')).toBeTruthy();
	view.rerender(content(6, 2));
	expect(view.getByText('Frame 12, duration 20')).toBeTruthy();
	expect(() => view.rerender(content(7, 3))).toThrow(/must be constant/);
});
