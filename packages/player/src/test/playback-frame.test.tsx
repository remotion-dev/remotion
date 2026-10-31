import {expect, mock, spyOn, test} from 'bun:test';
import {createRef, useRef} from 'react';
import {useBufferState, useCurrentFrame} from 'remotion';
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

const mockPlaybackClock = () => {
	let now = 0;
	let nextId = 0;
	let visibility: DocumentVisibilityState = 'visible';
	const rafs = new Map<number, FrameRequestCallback>();
	const timeouts = new Map<number, {callback: () => void; time: number}>();
	const clock = spyOn(performance, 'now').mockImplementation(() => now);
	const raf = spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
		(callback) => {
			const id = ++nextId;
			rafs.set(id, callback);
			return id;
		},
	);
	const cancel = spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(
		(id) => {
			rafs.delete(id);
		},
	);
	const timeout = spyOn(globalThis, 'setTimeout').mockImplementation(((
		...args: Parameters<typeof setTimeout>
	) => {
		const [callback, delay, ...callbackArgs] = args;
		const id = ++nextId;
		timeouts.set(id, {
			callback: () => callback(...callbackArgs),
			time: now + (delay ?? 0),
		});
		return id as unknown as ReturnType<typeof setTimeout>;
	}) as typeof setTimeout);
	const clear = spyOn(globalThis, 'clearTimeout').mockImplementation((id) => {
		timeouts.delete(Number(id));
	});
	const visibilityDescriptor = Object.getOwnPropertyDescriptor(
		document,
		'visibilityState',
	);
	Object.defineProperty(document, 'visibilityState', {
		configurable: true,
		get: () => visibility,
	});

	return {
		setTime: (time: number) => {
			now = time;
		},
		tick: (time: number) => {
			now = time;
			const pending = [...rafs.values()];
			rafs.clear();
			for (const callback of pending) {
				callback(time);
			}
		},
		runTimeouts: (time: number) => {
			now = time;
			const pending = [...timeouts.entries()].filter(
				([, timer]) => timer.time <= time,
			);
			for (const [id, timer] of pending) {
				if (timeouts.delete(id)) {
					timer.callback();
				}
			}
		},
		setVisibility: (state: DocumentVisibilityState) => {
			visibility = state;
			document.dispatchEvent(new Event('visibilitychange', {bubbles: true}));
		},
		pendingRafs: () => rafs.size,
		restore: () => {
			clock.mockRestore();
			raf.mockRestore();
			cancel.mockRestore();
			timeout.mockRestore();
			clear.mockRestore();
			if (visibilityDescriptor) {
				Object.defineProperty(
					document,
					'visibilityState',
					visibilityDescriptor,
				);
			} else {
				Reflect.deleteProperty(document, 'visibilityState');
			}
		},
	};
};

const PlaybackComposition = () => {
	const frame = useCurrentFrame();
	const {seek} = usePlayerMethods();
	const {delayPlayback} = useBufferState();
	const buffer = useRef<{unblock: () => void} | null>(null);

	return (
		<>
			<output>Frame {frame}</output>
			<button type="button" onClick={() => seek(100)}>
				Seek to frame 100
			</button>
			<button type="button" onClick={() => seek(frame)}>
				Seek to current frame
			</button>
			<button
				type="button"
				onClick={() => {
					buffer.current = delayPlayback();
				}}
			>
				Start buffering
			</button>
			<button type="button" onClick={() => buffer.current?.unblock()}>
				Resume after buffering
			</button>
		</>
	);
};

test('Internal seeks restart elapsed playback time at the latest seek, including same-frame seeks', () => {
	const clock = mockPlaybackClock();
	const player = createRef<PlayerRef>();
	try {
		const view = render(
			<Player
				ref={player}
				component={PlaybackComposition}
				durationInFrames={1000}
				compositionWidth={320}
				compositionHeight={180}
				fps={30}
				initiallyMuted
				numberOfSharedAudioTags={0}
			/>,
		);
		act(() => player.current!.play());
		act(() => clock.tick(34));
		expect(view.getByText('Frame 1')).toBeTruthy();

		// The browser has not delivered a callback for almost a second when the
		// user seeks. Only time elapsed after the seek belongs to the new frame.
		clock.setTime(800);
		fireEvent.click(view.getByRole('button', {name: 'Seek to frame 100'}));
		act(() => clock.tick(834));
		expect(view.getByText('Frame 101')).toBeTruthy();
		act(() => clock.tick(867));
		expect(view.getByText('Frame 102')).toBeTruthy();

		clock.setTime(900);
		fireEvent.click(view.getByRole('button', {name: 'Seek to current frame'}));
		act(() => clock.tick(920));
		expect(view.getByText('Frame 102')).toBeTruthy();
		act(() => clock.tick(934));
		expect(view.getByText('Frame 103')).toBeTruthy();

		clock.setTime(1000);
		fireEvent.click(view.getByRole('button', {name: 'Seek to frame 100'}));
		clock.setTime(1030);
		fireEvent.click(view.getByRole('button', {name: 'Seek to frame 100'}));
		act(() => clock.tick(1050));
		expect(view.getByText('Frame 100')).toBeTruthy();
		act(() => clock.tick(1064));
		expect(view.getByText('Frame 101')).toBeTruthy();
		expect(player.current!.isPlaying()).toBe(true);
	} finally {
		cleanup();
		clock.restore();
	}
});

test('Buffering before a delayed endpoint callback holds playback and resumes from the held frame', () => {
	const clock = mockPlaybackClock();
	const player = createRef<PlayerRef>();
	const ended = mock(() => {});
	try {
		const view = render(
			<Player
				ref={player}
				component={PlaybackComposition}
				durationInFrames={30}
				initialFrame={28}
				moveToBeginningWhenEnded={false}
				compositionWidth={320}
				compositionHeight={180}
				fps={30}
				initiallyMuted
				numberOfSharedAudioTags={0}
			/>,
		);
		player.current!.addEventListener('ended', ended);
		act(() => player.current!.play());
		clock.setTime(20);
		fireEvent.click(view.getByRole('button', {name: 'Start buffering'}));
		act(() => clock.tick(100));
		expect(view.getByText('Frame 28')).toBeTruthy();
		expect(player.current!.isPlaying()).toBe(true);
		expect(ended).not.toHaveBeenCalled();

		clock.setTime(1000);
		fireEvent.click(view.getByRole('button', {name: 'Resume after buffering'}));
		act(() => clock.tick(1034));
		expect(view.getByText('Frame 29')).toBeTruthy();
		expect(player.current!.isPlaying()).toBe(true);
		act(() => clock.tick(1067));
		expect(view.getByText('Frame 29')).toBeTruthy();
		expect(player.current!.isPlaying()).toBe(false);
		expect(ended).toHaveBeenCalledTimes(1);
	} finally {
		cleanup();
		clock.restore();
	}
});

test('Returning to a visible tab restores animation frames and keeps one playback loop through buffering', () => {
	const clock = mockPlaybackClock();
	const player = createRef<PlayerRef>();
	try {
		const view = render(
			<Player
				ref={player}
				component={PlaybackComposition}
				durationInFrames={1000}
				compositionWidth={320}
				compositionHeight={180}
				fps={30}
				initiallyMuted
				numberOfSharedAudioTags={0}
			/>,
		);
		act(() => player.current!.play());
		act(() => clock.tick(34));
		expect(view.getByText('Frame 1')).toBeTruthy();

		clock.setTime(40);
		act(() => clock.setVisibility('hidden'));
		// Background timeouts may be heavily throttled. Returning to a visible
		// tab should resume on its next paint, before that timeout arrives.
		clock.setTime(1000);
		act(() => clock.setVisibility('visible'));
		act(() => clock.tick(1017));
		expect(view.getByText('Frame 30')).toBeTruthy();
		act(() => clock.runTimeouts(1018));
		expect(view.getByText('Frame 30')).toBeTruthy();
		expect(clock.pendingRafs()).toBe(1);

		clock.setTime(1020);
		act(() => clock.setVisibility('hidden'));
		act(() => clock.runTimeouts(1201));
		expect(view.getByText('Frame 36')).toBeTruthy();
		clock.setTime(1220);
		act(() => clock.setVisibility('visible'));
		act(() => clock.tick(1234));
		expect(view.getByText('Frame 37')).toBeTruthy();

		for (const state of [
			'visible',
			'hidden',
			'visible',
			'hidden',
			'visible',
		] as const) {
			act(() => clock.setVisibility(state));
		}

		expect(clock.pendingRafs()).toBe(1);
		act(() => clock.tick(1267));
		expect(view.getByText('Frame 38')).toBeTruthy();

		clock.setTime(1270);
		fireEvent.click(view.getByRole('button', {name: 'Start buffering'}));
		for (const state of ['hidden', 'visible', 'hidden', 'visible'] as const) {
			act(() => clock.setVisibility(state));
		}

		act(() => clock.tick(1400));
		expect(view.getByText('Frame 38')).toBeTruthy();
		clock.setTime(2000);
		fireEvent.click(view.getByRole('button', {name: 'Resume after buffering'}));
		act(() => clock.tick(2034));
		expect(view.getByText('Frame 39')).toBeTruthy();
		// The Player also uses one-shot animation frames for its buffering UI.
		// After those run, only the recurring playback callback should remain.
		expect(clock.pendingRafs()).toBe(1);

		fireEvent.click(view.getByRole('button', {name: 'Start buffering'}));
		act(() => clock.tick(2068));
		act(() => player.current!.pause());
		fireEvent.click(view.getByRole('button', {name: 'Resume after buffering'}));
		act(() => clock.tick(2102));
		expect(clock.pendingRafs()).toBe(0);
		expect(view.getByText('Frame 39')).toBeTruthy();
		act(() => player.current!.play());
		act(() => clock.tick(2136));
		expect(view.getByText('Frame 40')).toBeTruthy();
	} finally {
		cleanup();
		clock.restore();
	}
});
