import {expect, spyOn, test} from 'bun:test';
import {createRef} from 'react';
import {useCurrentFrame} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {usePlayerMethods} from '../use-player-methods.js';
import {act, cleanup, fireEvent, render} from './test-utils.js';

test('Playback advances from pending frames and resumes from an explicit seek', () => {
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
	const Composition = () => {
		const frame = useCurrentFrame();
		const {seek} = usePlayerMethods();

		return (
			<>
				<output>Frame {frame}</output>
				<button type="button" onClick={() => seek(100)}>
					Seek to frame 100
				</button>
			</>
		);
	};

	const tick = (time: number) => {
		now = time;
		const pending = [...rafs.values()];
		rafs.clear();
		for (const callback of pending) {
			callback(time);
		}
	};

	try {
		const view = render(
			<Player
				ref={player}
				component={Composition}
				durationInFrames={1000}
				initialFrame={100}
				compositionWidth={320}
				compositionHeight={180}
				fps={30}
				playbackRate={2}
				initiallyMuted
				numberOfSharedAudioTags={0}
			/>,
		);
		act(() => player.current!.play());
		act(() => {
			// Two 60 Hz ticks run before React commits either frame update.
			tick(17);
			tick(34);
		});
		expect(view.getByText('Frame 102')).toBeTruthy();
		act(() => tick(51));
		expect(view.getByText('Frame 103')).toBeTruthy();

		act(() => {
			tick(68);
			tick(85);
			// Seek while frames are pending, without pausing playback.
			fireEvent.click(view.getByRole('button', {name: 'Seek to frame 100'}));
			tick(102);
		});
		expect(view.getByText('Frame 101')).toBeTruthy();
		act(() => tick(119));
		expect(view.getByText('Frame 102')).toBeTruthy();
	} finally {
		cleanup();
		clock.mockRestore();
		raf.mockRestore();
		cancel.mockRestore();
	}
});
