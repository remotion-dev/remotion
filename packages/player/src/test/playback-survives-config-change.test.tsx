import {expect, spyOn, test} from 'bun:test';
import {createRef} from 'react';
import {useCurrentFrame} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

test('Playback clock survives a durationInFrames change while playing', () => {
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
	const Composition = () => {
		const frame = useCurrentFrame();
		return <output>Frame {frame}</output>;
	};

	const tick = (time: number) => {
		now = time;
		const pending = [...rafs.values()];
		rafs.clear();
		for (const callback of pending) {
			callback(time);
		}
	};

	const props = (durationInFrames: number) => ({
		component: Composition,
		durationInFrames,
		compositionWidth: 320,
		compositionHeight: 180,
		fps: 30,
		initiallyMuted: true,
		numberOfSharedAudioTags: 0,
	});

	try {
		const player = createRef<PlayerRef>();
		const view = render(<Player ref={player} {...props(1000)} />);

		act(() => player.current!.play());
		expect(view.getByText('Frame 0')).toBeTruthy();

		// 50ms => 1 frame of 30fps should have been advanced.
		act(() => tick(50));
		expect(view.getByText('Frame 1')).toBeTruthy();

		// While playing, the composition length changes (e.g. a voiceover
		// finished loading), which re-runs the playback effect.
		// The clock should keep running instead of restarting from the
		// current frame.
		act(() => {
			tick(51);
			view.rerender(<Player ref={player} {...props(1001)} />);
		});

		// If the clock restarted at 51ms, 100ms here would only yield
		// 1000/fps * (1/33) frame advancements and the playback would fall
		// behind (“Frame 2” instead of “Frame 3”).
		act(() => tick(100));
		expect(view.getByText('Frame 3')).toBeTruthy();

		act(() => tick(200));
		expect(view.getByText('Frame 6')).toBeTruthy();
	} finally {
		cleanup();
		clock.mockRestore();
		raf.mockRestore();
		cancel.mockRestore();
	}
});
