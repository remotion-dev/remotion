import {afterEach, expect, spyOn, test} from 'bun:test';
import {type ContextType, createRef, useContext, useEffect} from 'react';
import {Html5Audio, Internals, useBufferState, useCurrentFrame} from 'remotion';
import type {LogLevel} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {usePlayerMethods} from '../use-player-methods.js';
import {act, cleanup, fireEvent, render} from './test-utils.js';

afterEach(() => {
	cleanup();
});

let nativeSuspendCalls = 0;
let nativeResumeCalls = 0;
let gainValues: number[] = [];

class TrackedAudioContext extends EventTarget {
	public state: AudioContextState | 'interrupted' = 'suspended';
	public baseLatency = 0;
	public outputLatency = 0;
	public currentTime = 0;
	public destination = {};

	close() {
		this.state = 'closed';
		return Promise.resolve();
	}

	createGain() {
		return {
			connect: () => undefined,
			disconnect: () => undefined,
			gain: {
				cancelScheduledValues: () => undefined,
				linearRampToValueAtTime: (value: number) => {
					gainValues.push(value);
				},
				setValueAtTime: (value: number) => {
					gainValues.push(value);
				},
			},
		};
	}

	suspend() {
		nativeSuspendCalls++;
		this.state = 'suspended';
		return Promise.resolve();
	}

	resume() {
		nativeResumeCalls++;
		this.state = 'running';
		return Promise.resolve();
	}

	getOutputTimestamp() {
		return {contextTime: this.currentTime, performanceTime: performance.now()};
	}

	createMediaElementSource() {
		return {
			connect: () => undefined,
			disconnect: () => undefined,
		};
	}
}

let startBuffering: (() => {unblock: () => void}) | null = null;

const AudioComposition = () => {
	startBuffering = useBufferState().delayPlayback;

	return (
		<Internals.SequenceManagerProvider>
			<Html5Audio src="audio.mp3" />
		</Internals.SequenceManagerProvider>
	);
};

const playAndPause = async ({
	_experimentalKeepAudioContextAlive,
	bufferAfterPlay = false,
}: {
	_experimentalKeepAudioContextAlive: boolean;
	bufferAfterPlay?: boolean;
}) => {
	const originalAudioContext = globalThis.AudioContext;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

	let animationFrameId = 0;
	const animationFrames = new Map<number, FrameRequestCallback>();

	globalThis.AudioContext =
		TrackedAudioContext as unknown as typeof AudioContext;
	globalThis.requestAnimationFrame = (callback) => {
		animationFrameId++;
		animationFrames.set(animationFrameId, callback);
		return animationFrameId;
	};

	globalThis.cancelAnimationFrame = (id) => {
		animationFrames.delete(id);
	};

	try {
		nativeSuspendCalls = 0;
		nativeResumeCalls = 0;
		gainValues = [];

		const playerRef = createRef<PlayerRef>();
		render(
			<Player
				ref={playerRef}
				component={AudioComposition}
				durationInFrames={300}
				compositionWidth={1920}
				compositionHeight={1080}
				fps={30}
				_experimentalKeepAudioContextAlive={_experimentalKeepAudioContextAlive}
			/>,
		);

		// The context is suspended once upon creation.
		expect(nativeSuspendCalls).toBe(1);
		nativeSuspendCalls = 0;
		nativeResumeCalls = 0;
		gainValues = [];

		await act(async () => {
			playerRef.current?.play();
			await Promise.resolve();
		});

		const resumeCallsDuringPlay = nativeResumeCalls;
		let gainValuesDuringBufferResume: number[] = [];
		if (bufferAfterPlay) {
			if (!startBuffering) {
				throw new Error('Expected buffering controls');
			}

			const beginBuffering = startBuffering;
			let unblock: () => void = () => undefined;
			await act(async () => {
				unblock = beginBuffering().unblock;
				await Promise.resolve();
			});

			const queuedFrames = [...animationFrames.values()];
			if (queuedFrames.length === 0) {
				throw new Error('Expected a queued animation frame');
			}

			animationFrames.clear();
			await act(async () => {
				for (const frame of queuedFrames) {
					frame(performance.now());
				}

				await Promise.resolve();
			});

			gainValues = [];
			await act(async () => {
				unblock();
				await Promise.resolve();
			});
			gainValuesDuringBufferResume = gainValues;
		}

		gainValues = [];

		await act(async () => {
			playerRef.current?.pause();
			await Promise.resolve();
		});

		return {
			resumeCallsDuringPlay,
			suspendCallsDuringPause: nativeSuspendCalls,
			gainValuesDuringPause: gainValues,
			gainValuesDuringBufferResume,
		};
	} finally {
		startBuffering = null;
		globalThis.AudioContext = originalAudioContext;
		globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
	}
};

test('Pausing suspends the AudioContext by default', async () => {
	const {resumeCallsDuringPlay, suspendCallsDuringPause} = await playAndPause({
		_experimentalKeepAudioContextAlive: false,
	});

	expect(resumeCallsDuringPlay).toBe(1);
	expect(suspendCallsDuringPause).toBe(1);
});

test('_experimentalKeepAudioContextAlive silences through the gain instead of suspending', async () => {
	const {
		resumeCallsDuringPlay,
		suspendCallsDuringPause,
		gainValuesDuringPause,
	} = await playAndPause({_experimentalKeepAudioContextAlive: true});

	// The context was already started on mount, so playing does not need to
	// resume it again.
	expect(resumeCallsDuringPlay).toBe(0);
	expect(suspendCallsDuringPause).toBe(0);
	expect(gainValuesDuringPause).toContain(0);
});

test('_experimentalKeepAudioContextAlive resumes immediately after buffering', async () => {
	const {gainValuesDuringBufferResume} = await playAndPause({
		_experimentalKeepAudioContextAlive: true,
		bufferAfterPlay: true,
	});

	expect(gainValuesDuringBufferResume).toContain(1);
});

const renderClockedPlayer = (keepAudioContextAlive: boolean) => {
	let now = 0;
	let nextRaf = 0;
	let delayedCommit: {frame: number; milliseconds: number} | null = null;
	const rafs = new Map<number, FrameRequestCallback>();
	const anchors: number[] = [];
	let audio: ContextType<typeof Internals.SharedAudioContext> = null;
	let buffer: (() => {unblock: () => void}) | null = null;
	const originalAudioContext = globalThis.AudioContext;
	globalThis.AudioContext =
		TrackedAudioContext as unknown as typeof AudioContext;
	const clock = spyOn(performance, 'now').mockImplementation(() => now);
	const raf = spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
		(callback) => {
			const id = ++nextRaf;
			rafs.set(id, callback);
			return id;
		},
	);
	const cancel = spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(
		(id) => rafs.delete(id),
	);
	const setTime = (time: number) => {
		const context = audio!.audioContext as unknown as TrackedAudioContext;
		if (context.state === 'running') {
			context.currentTime += (time - now) / 1000;
		}

		now = time;
	};

	const Composition = () => {
		const shared = useContext(Internals.SharedAudioContext);
		const frame = useCurrentFrame();
		const {seek} = usePlayerMethods();
		buffer = useBufferState().delayPlayback;
		audio = shared;
		if (delayedCommit?.frame === frame) {
			const {milliseconds} = delayedCommit;
			delayedCommit = null;
			setTime(now + milliseconds);
		}

		useEffect(() => {
			const subscription = shared?.audioSyncAnchorEmitter.subscribe(() => {
				anchors.push(shared.audioSyncAnchor.value);
			});
			return () => subscription?.remove();
		}, [shared]);

		return (
			<>
				<output>Frame {frame}</output>
				<button type="button" onClick={() => seek(100)}>
					Seek while playing
				</button>
				<button type="button" onClick={() => seek(frame)}>
					Seek to current frame
				</button>
				<button type="button" onClick={() => seek(0)}>
					Seek to start
				</button>
			</>
		);
	};

	const player = createRef<PlayerRef>();
	const props = {
		component: Composition,
		durationInFrames: 1000,
		compositionWidth: 320,
		compositionHeight: 180,
		fps: 30,
		playbackRate: 1,
		inFrame: null as number | null,
		outFrame: null as number | null,
		loop: false,
		preferredEffectBackend: 'auto' as const,
		audioLatencyHint: 'playback' as AudioContextLatencyCategory,
		logLevel: 'info' as LogLevel,
		numberOfSharedAudioTags: 0,
		_experimentalKeepAudioContextAlive: keepAudioContextAlive,
	};
	const view = render(<Player ref={player} {...props} />);

	return {
		player,
		view,
		anchors,
		setTime,
		delayCommitForFrame: (frame: number, milliseconds: number) => {
			delayedCommit = {frame, milliseconds};
		},
		tick: (time: number) => {
			setTime(time);
			const pending = [...rafs.values()];
			rafs.clear();
			pending.forEach((callback) => callback(time));
		},
		changeConfig: (changes: Partial<typeof props>) => {
			Object.assign(props, changes);
			view.rerender(<Player ref={player} {...props} />);
		},
		startBuffering: () => buffer!(),
		anchor: () => audio!.audioSyncAnchor.value,
		audioContext: () => audio!.audioContext,
		setAudioContextState: (
			state: AudioContextState | 'interrupted',
			dispatch: boolean,
		) => {
			const context = audio!.audioContext as unknown as TrackedAudioContext;
			context.state = state;
			if (dispatch) {
				context.dispatchEvent(new Event('statechange'));
			}
		},
		dispose: () => {
			cleanup();
			clock.mockRestore();
			raf.mockRestore();
			cancel.mockRestore();
			globalThis.AudioContext = originalAudioContext;
		},
	};
};

test('Keep-alive audio preserves its anchor across duration-only updates', () => {
	const harness = renderClockedPlayer(true);
	try {
		act(() => harness.player.current!.play());
		act(() => harness.tick(50));
		expect(harness.view.getByText('Frame 1')).toBeTruthy();
		const anchor = harness.anchor();
		harness.anchors.length = 0;

		act(() => {
			harness.tick(51);
			harness.changeConfig({durationInFrames: 1001});
		});
		expect(harness.anchor()).toBe(anchor);
		expect(harness.anchors).toEqual([]);

		act(() => harness.tick(100));
		expect(harness.view.getByText('Frame 3')).toBeTruthy();
		act(() => {
			harness.tick(117);
			harness.changeConfig({durationInFrames: 1002});
		});
		expect(harness.anchors).toEqual([]);
		act(() => harness.tick(200));
		expect(harness.view.getByText('Frame 6')).toBeTruthy();
	} finally {
		harness.dispose();
	}
});

test.each([
	{audioLatencyHint: 'interactive' as const},
	{logLevel: 'warn' as const},
])('Keep-alive audio re-anchors to a replacement context: %j', (config) => {
	const harness = renderClockedPlayer(true);
	try {
		act(() => harness.player.current!.play());
		act(() => harness.tick(100));
		expect(harness.view.getByText('Frame 3')).toBeTruthy();
		const previousContext = harness.audioContext();
		harness.anchors.length = 0;
		act(() => harness.changeConfig(config));
		expect(harness.audioContext()).not.toBe(previousContext);
		// The new native clock starts at zero while playback stays at frame 3.
		// This 100 ms offset is smaller than the usual drift tolerance.
		expect(harness.anchor()).toBeCloseTo(-0.1, 8);
		expect(harness.anchors).toHaveLength(1);
		harness.anchors.length = 0;
		act(() => {
			harness.tick(117);
			harness.changeConfig({durationInFrames: 1001});
		});
		expect(harness.anchor()).toBeCloseTo(-0.1, 8);
		expect(harness.anchors).toEqual([]);
		act(() => harness.tick(200));
		expect(harness.view.getByText('Frame 6')).toBeTruthy();
	} finally {
		harness.dispose();
	}
});

test.each(['pause', 'mute'] as const)(
	'Keep-alive audio still re-anchors after a short %s',
	(interruption) => {
		const harness = renderClockedPlayer(true);
		try {
			act(() => harness.player.current!.play());
			act(() => harness.tick(50));
			act(() => {
				if (interruption === 'pause') {
					harness.player.current!.pause();
				} else {
					harness.player.current!.mute();
				}
			});
			harness.anchors.length = 0;
			// Less than the normal drift tolerance: a genuine restart must force
			// an exact anchor even when a duration-only update must not.
			harness.setTime(60);
			act(() => {
				if (interruption === 'pause') {
					harness.player.current!.play();
				} else {
					harness.player.current!.unmute();
				}
			});
			expect(harness.anchors).toHaveLength(1);
			expect(harness.anchor()).toBeCloseTo(0.06 - 1 / 30, 8);
		} finally {
			harness.dispose();
		}
	},
);

test.each([
	{fps: 60, playbackRate: 1},
	{fps: 30, playbackRate: 2},
])('Keep-alive audio re-anchors when its clock changes: %j', (config) => {
	const harness = renderClockedPlayer(true);
	try {
		act(() => harness.player.current!.play());
		act(() => harness.tick(50));
		harness.anchors.length = 0;
		harness.setTime(51);
		act(() => harness.changeConfig(config));
		expect(harness.anchors).toHaveLength(1);
		expect(harness.anchor()).toBeCloseTo(
			0.051 - 1 / config.fps / config.playbackRate,
			8,
		);
	} finally {
		harness.dispose();
	}
});

test('Keep-alive audio still corrects drift after buffering', () => {
	const harness = renderClockedPlayer(true);
	try {
		act(() => harness.player.current!.play());
		act(() => harness.tick(50));
		let unblock = () => {};
		act(() => {
			unblock = harness.startBuffering().unblock;
		});
		act(() => harness.tick(60));
		harness.anchors.length = 0;
		act(() => harness.tick(660));
		expect(harness.view.getByText('Frame 1')).toBeTruthy();
		act(() => unblock());
		act(() => harness.tick(700));
		expect(harness.view.getByText('Frame 2')).toBeTruthy();
		expect(harness.anchors).toHaveLength(1);
		// Anchor when buffering ends, before the next frame advances.
		expect(harness.anchor()).toBeCloseTo(0.66 - 1 / 30, 8);
	} finally {
		harness.dispose();
	}
});

test.each([false, true])(
	'Late frame commits preserve the audio clock while playback catches up (keep alive: %j)',
	async (keepAlive) => {
		const harness = renderClockedPlayer(keepAlive);
		try {
			act(() => harness.changeConfig({fps: 20}));
			await act(async () => {
				harness.player.current!.play();
				harness.tick(1);
				await Promise.resolve();
			});
			const anchor = harness.anchor();
			harness.anchors.length = 0;

			harness.delayCommitForFrame(2, 500);
			act(() => harness.tick(101));
			expect(harness.view.getByText('Frame 2')).toBeTruthy();
			expect(harness.audioContext()!.currentTime).toBeCloseTo(0.601, 8);
			expect(harness.anchor()).toBe(anchor);
			expect(harness.anchors).toEqual([]);

			act(() => harness.tick(651));
			expect(harness.view.getByText('Frame 13')).toBeTruthy();
			expect(harness.player.current!.isPlaying()).toBe(true);
			expect(harness.anchor()).toBe(anchor);
			expect(harness.anchors).toEqual([]);
		} finally {
			harness.dispose();
		}
	},
);

test.each([
	{keepAlive: false, playbackRate: 1},
	{keepAlive: true, playbackRate: 1},
	{keepAlive: false, playbackRate: -1},
	{keepAlive: true, playbackRate: -1},
])(
	'Playback range jumps realign audio without looping: %j',
	async ({keepAlive, playbackRate}) => {
		const harness = renderClockedPlayer(keepAlive);
		try {
			act(() => harness.changeConfig({fps: 20, playbackRate}));
			await act(async () => {
				harness.player.current!.seekTo(playbackRate > 0 ? 0 : 40);
				harness.player.current!.play();
				harness.tick(1);
				await Promise.resolve();
			});
			act(() => harness.tick(1001));
			expect(harness.view.getByText('Frame 20')).toBeTruthy();
			harness.anchors.length = 0;

			act(() =>
				harness.changeConfig(
					playbackRate > 0
						? {inFrame: 2, outFrame: 10}
						: {inFrame: 30, outFrame: 39},
				),
			);
			const targetFrame = playbackRate > 0 ? 2 : 39;
			act(() => harness.tick(1051));
			expect(harness.view.getByText(`Frame ${targetFrame}`)).toBeTruthy();
			expect(harness.player.current!.isPlaying()).toBe(true);
			expect(harness.anchors).toHaveLength(1);
			expect(harness.anchor()).toBeCloseTo(
				harness.audioContext()!.currentTime - targetFrame / 20 / playbackRate,
				8,
			);
			const anchor = harness.anchor();

			act(() => harness.tick(1101));
			expect(
				harness.view.getByText(`Frame ${targetFrame + playbackRate}`),
			).toBeTruthy();
			harness.setTime(1102);
			act(() => harness.changeConfig({inFrame: 0, outFrame: 100}));
			expect(harness.anchor()).toBe(anchor);
			expect(harness.anchors).toHaveLength(1);
		} finally {
			harness.dispose();
		}
	},
);

test.each([false, true])(
	'A late seek commit keeps the audio and visual clocks aligned (keep alive: %j)',
	async (keepAlive) => {
		const harness = renderClockedPlayer(keepAlive);
		try {
			act(() => harness.changeConfig({fps: 20}));
			await act(async () => {
				harness.player.current!.play();
				harness.tick(1);
				await Promise.resolve();
			});
			act(() => harness.tick(101));
			harness.setTime(110);
			harness.delayCommitForFrame(100, 500);
			fireEvent.click(
				harness.view.getByRole('button', {name: 'Seek while playing'}),
			);
			expect(harness.view.getByText('Frame 100')).toBeTruthy();
			act(() => harness.tick(710));
			expect(harness.view.getByText('Frame 112')).toBeTruthy();
			expect(
				(harness.audioContext()!.currentTime - harness.anchor()) * 20,
			).toBeCloseTo(112, 8);
		} finally {
			harness.dispose();
		}
	},
);

test.each([false, true])(
	'A delayed native recovery event keeps the audio and visual clocks aligned (keep alive: %j)',
	async (keepAlive) => {
		const harness = renderClockedPlayer(keepAlive);
		try {
			act(() => harness.changeConfig({fps: 20}));
			await act(async () => {
				harness.player.current!.play();
				harness.tick(1);
				await Promise.resolve();
			});
			act(() => harness.tick(101));
			harness.setTime(110);
			harness.setAudioContextState('interrupted', true);
			harness.setAudioContextState('running', false);
			harness.setTime(610);
			harness.setAudioContextState('running', true);
			act(() => harness.tick(710));
			expect(harness.view.getByText('Frame 14')).toBeTruthy();
			expect(
				(harness.audioContext()!.currentTime - harness.anchor()) * 20,
			).toBeCloseTo(14, 8);
		} finally {
			harness.dispose();
		}
	},
);

test.each([
	{keepAlive: false, boundary: 'seek'},
	{keepAlive: true, boundary: 'seek'},
	{keepAlive: false, boundary: 'loop'},
	{keepAlive: true, boundary: 'loop'},
])(
	'A same-frame boundary is not replayed by the next late commit: %j',
	async ({keepAlive, boundary}) => {
		const harness = renderClockedPlayer(keepAlive);
		try {
			act(() =>
				harness.changeConfig({
					fps: 20,
					loop: boundary === 'loop',
					outFrame: boundary === 'loop' ? 99 : null,
				}),
			);
			await act(async () => {
				harness.player.current!.play();
				harness.tick(1);
				await Promise.resolve();
			});
			if (boundary === 'seek') {
				act(() => harness.tick(101));
				harness.setTime(110);
				fireEvent.click(
					harness.view.getByRole('button', {name: 'Seek to current frame'}),
				);
				act(() => harness.tick(120));
			} else {
				act(() => harness.tick(5001));
			}

			const anchor = harness.anchor();
			harness.anchors.length = 0;
			harness.delayCommitForFrame(boundary === 'seek' ? 3 : 1, 500);
			act(() => harness.tick(boundary === 'seek' ? 170 : 5051));
			expect(harness.anchor()).toBe(anchor);
			expect(harness.anchors).toEqual([]);
			act(() => harness.tick(boundary === 'seek' ? 720 : 5601));
			const expectedFrame = boundary === 'seek' ? 14 : 12;
			expect(harness.view.getByText(`Frame ${expectedFrame}`)).toBeTruthy();
			expect(
				(harness.audioContext()!.currentTime - harness.anchor()) * 20,
			).toBeCloseTo(expectedFrame, 8);
			fireEvent.click(
				harness.view.getByRole('button', {name: 'Seek to start'}),
			);
			expect(harness.view.getByText('Frame 0')).toBeTruthy();
			act(() => harness.tick((boundary === 'seek' ? 720 : 5601) + 100));
			expect(harness.view.getByText('Frame 2')).toBeTruthy();
			expect(
				(harness.audioContext()!.currentTime - harness.anchor()) * 20,
			).toBeCloseTo(2, 8);
		} finally {
			harness.dispose();
		}
	},
);
