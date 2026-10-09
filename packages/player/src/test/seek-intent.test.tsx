import {afterEach, expect, mock, spyOn, test} from 'bun:test';
import React, {createRef, useContext, useLayoutEffect} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

afterEach(cleanup);

test('Player seeks publish boundaries before frame updates and stay local to each Player', () => {
	const players = [createRef<PlayerRef>(), createRef<PlayerRef>()];
	const ids = ['first', 'second'];
	const timelines: React.ContextType<typeof Internals.SetTimelineContext>[] =
		[];
	const Composition: React.FC<{readonly index: number}> = ({index}) => {
		timelines[index] = useContext(Internals.SetTimelineContext);
		return <output data-testid={`frame-${index}`}>{useCurrentFrame()}</output>;
	};

	const view = render(
		<>
			{players.map((ref, index) => (
				<Player
					key={ids[index]}
					ref={ref}
					component={Composition}
					inputProps={{index}}
					durationInFrames={300}
					compositionWidth={320}
					compositionHeight={180}
					fps={30}
					numberOfSharedAudioTags={0}
				/>
			))}
		</>,
	);
	const {revision} = timelines[0].seek!;
	const events: number[] = [];
	players[0].current!.addEventListener('seeked', () => {
		events.push(revision.current);
	});

	act(() => {
		players[0].current!.seekTo(30);
		expect(revision.current).toBe(1);
	});
	expect(view.getByTestId('frame-0').textContent).toBe('30');
	act(() => players[0].current!.play());
	expect(revision.current).toBe(1);
	act(() => {
		players[0].current!.seekTo(31);
		players[0].current!.seekTo(180);
		players[0].current!.seekTo(15);
	});
	expect(view.getByTestId('frame-0').textContent).toBe('15');
	expect(revision.current).toBe(4);
	act(() => players[0].current!.pause());
	act(() => players[0].current!.seekTo(15));
	expect(revision.current).toBe(5);
	expect(events).toEqual([1, 2, 3, 4, 5]);
	expect(view.getByTestId('frame-1').textContent).toBe('0');
	expect(timelines[1].seek!.revision.current).toBe(0);

	// The animation path updates frames without publishing navigation intent.
	act(() =>
		timelines[0].setFrameWithoutSeek((frames) => ({
			...frames,
			[Object.keys(frames)[0]]: 90,
		})),
	);
	expect(view.getByTestId('frame-0').textContent).toBe('90');
	expect(revision.current).toBe(5);
});

// Regression from kino-ai/kino#4121: a delayed callback skips the stopping frame.
test.each([
	{rate: 1, initial: 7, expected: 9},
	{rate: -1, initial: 2, expected: 0},
	{rate: 1, initial: 5, inFrame: 3, outFrame: 7, expected: 7},
	{rate: -1, initial: 5, inFrame: 3, outFrame: 7, expected: 3},
	{rate: 1, initial: 7, moveToBeginningWhenEnded: true, expected: 0},
	{rate: -1, initial: 2, moveToBeginningWhenEnded: true, expected: 9},
	{rate: 1, initial: 5, inFrame: 3, outFrame: 7, loop: true, expected: 3},
	{rate: -1, initial: 5, inFrame: 3, outFrame: 7, loop: true, expected: 7},
])(
	'late playback callback displays $expected at $rate x from $initial (loop=$loop, reset=$moveToBeginningWhenEnded)',
	({
		rate,
		initial,
		expected,
		inFrame,
		outFrame,
		loop = false,
		moveToBeginningWhenEnded = false,
	}) => {
		let now = 0;
		let nextRaf = 0;
		const rafs = new Map<number, FrameRequestCallback>();
		const clock = spyOn(performance, 'now').mockImplementation(() => now);
		const raf = spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
			(callback) => {
				const id = ++nextRaf;
				rafs.set(id, callback);
				return id;
			},
		);
		const cancel = spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(
			(id) => {
				rafs.delete(id);
			},
		);
		const player = createRef<PlayerRef>();
		let displayed = -1;
		const ended = mock(() => {});
		const Composition = () => {
			const frame = useCurrentFrame();
			useLayoutEffect(() => {
				displayed = frame;
			}, [frame]);
			return null;
		};

		const tick = (time: number) => {
			now = time;
			const pending = [...rafs.values()];
			rafs.clear();
			act(() => {
				for (const callback of pending) callback(time);
			});
		};

		try {
			render(
				<Player
					ref={player}
					component={Composition}
					durationInFrames={10}
					initialFrame={initial}
					inFrame={inFrame}
					outFrame={outFrame}
					compositionWidth={320}
					compositionHeight={180}
					fps={30}
					playbackRate={rate}
					loop={loop}
					moveToBeginningWhenEnded={moveToBeginningWhenEnded}
					initiallyMuted
					numberOfSharedAudioTags={0}
				/>,
			);
			player.current!.addEventListener('ended', ended);
			act(() => player.current!.play());
			// Three frame intervals elapse before the first scheduled callback.
			tick(101);
			expect(player.current!.getCurrentFrame()).toBe(expected);
			expect(displayed).toBe(expected);
			expect(ended).toHaveBeenCalledTimes(loop ? 0 : 1);
			expect(player.current!.isPlaying()).toBe(loop);
			if (!loop) {
				tick(500);
				expect(player.current!.getCurrentFrame()).toBe(expected);
				expect(ended).toHaveBeenCalledTimes(1);
			}
		} finally {
			cleanup();
			clock.mockRestore();
			raf.mockRestore();
			cancel.mockRestore();
		}
	},
);
