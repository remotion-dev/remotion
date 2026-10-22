import {expect, mock, spyOn, test} from 'bun:test';
import {createRef} from 'react';
import {useCurrentFrame} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

test.each([
	{
		rate: 1,
		initial: 8,
		inFrame: null,
		outFrame: null,
		duration: 10,
		frames: [1, 3, 1, 3],
	},
	{
		rate: -1,
		initial: 1,
		inFrame: null,
		outFrame: null,
		duration: 10,
		frames: [8, 6, 8, 6],
	},
	{
		rate: 2,
		initial: 6,
		inFrame: 3,
		outFrame: 7,
		duration: 10,
		frames: [7, 6, 7, 6],
	},
	{
		rate: -2,
		initial: 4,
		inFrame: 3,
		outFrame: 7,
		duration: 10,
		frames: [3, 4, 3, 4],
	},
	{
		rate: 0.5,
		initial: 8,
		inFrame: null,
		outFrame: null,
		duration: 10,
		frames: [9, 0, 4, 5],
	},
	{
		rate: -0.5,
		initial: 1,
		inFrame: null,
		outFrame: null,
		duration: 10,
		frames: [0, 9, 5, 4],
	},
	{
		rate: 1,
		initial: 0,
		inFrame: null,
		outFrame: null,
		duration: 1,
		frames: [0, 0, 0, 0],
	},
	{
		rate: -1,
		initial: 0,
		inFrame: null,
		outFrame: null,
		duration: 1,
		frames: [0, 0, 0, 0],
	},
	// Starting outside the playback range still enters it at the existing boundary.
	{
		rate: 1,
		initial: 8,
		inFrame: 3,
		outFrame: 7,
		duration: 10,
		frames: [3, 5, 3, 5],
	},
	{
		rate: -1,
		initial: 2,
		inFrame: 3,
		outFrame: 7,
		duration: 10,
		frames: [7, 5, 7, 5],
	},
	{
		rate: 1,
		initial: 1,
		inFrame: 3,
		outFrame: 7,
		duration: 10,
		frames: [4, 6, 4, 6],
	},
	{
		rate: -1,
		initial: 8,
		inFrame: 3,
		outFrame: 7,
		duration: 10,
		frames: [5, 3, 5, 3],
	},
])(
	'looping Player preserves elapsed frames at $rate x from $initial within [$inFrame, $outFrame]',
	({rate, initial, inFrame, outFrame, duration, frames}) => {
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
		const ended = mock(() => {});
		const Composition = () => <output>Frame {useCurrentFrame()}</output>;

		try {
			const view = render(
				<Player
					ref={player}
					component={Composition}
					durationInFrames={duration}
					initialFrame={initial}
					inFrame={inFrame}
					outFrame={outFrame}
					compositionWidth={320}
					compositionHeight={180}
					fps={30}
					playbackRate={rate}
					loop
					initiallyMuted
					numberOfSharedAudioTags={0}
				/>,
			);
			player.current!.addEventListener('ended', ended);
			act(() => player.current!.play());

			// Drop frames, continue normally, skip multiple loops, then continue again.
			for (const [index, time] of [101, 168, 1101, 1168].entries()) {
				now = time;
				const pending = [...rafs.values()];
				rafs.clear();
				act(() => {
					for (const callback of pending) callback(time);
				});
				expect(view.getByText(`Frame ${frames[index]}`)).toBeTruthy();
				expect(player.current!.getCurrentFrame()).toBe(frames[index]);
			}

			expect(player.current!.isPlaying()).toBe(true);
			expect(ended).not.toHaveBeenCalled();
		} finally {
			cleanup();
			clock.mockRestore();
			raf.mockRestore();
			cancel.mockRestore();
		}
	},
);
