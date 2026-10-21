import {afterEach, expect, spyOn, test} from 'bun:test';
import {type ContextType, createRef, useContext, useEffect} from 'react';
import {Html5Audio, Internals, useBufferState, useCurrentFrame} from 'remotion';
import type {LogLevel} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

afterEach(() => {
	cleanup();
});

let nativeSuspendCalls = 0;
let nativeResumeCalls = 0;
let gainValues: number[] = [];

class TrackedAudioContext {
	public state = 'suspended' as AudioContextState;
	public baseLatency = 0;
	public outputLatency = 0;
	public currentTime = 0;
	public destination = {};

	addEventListener() {
		return undefined;
	}

	removeEventListener() {
		return undefined;
	}

	createGain() {
		return {
			connect: () => undefined,
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
		return {contextTime: 0, performanceTime: 0};
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

const renderClockedPlayer = () => {
	let now = 0;
	let nextRaf = 0;
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
	const Composition = () => {
		const shared = useContext(Internals.SharedAudioContext);
		const frame = useCurrentFrame();
		buffer = useBufferState().delayPlayback;
		audio = shared;
		useEffect(() => {
			const subscription = shared?.audioSyncAnchorEmitter.subscribe(() => {
				anchors.push(shared.audioSyncAnchor.value);
			});
			return () => subscription?.remove();
		}, [shared]);

		return <output>Frame {frame}</output>;
	};

	const player = createRef<PlayerRef>();
	const props = {
		component: Composition,
		durationInFrames: 1000,
		compositionWidth: 320,
		compositionHeight: 180,
		fps: 30,
		playbackRate: 1,
		audioLatencyHint: 'playback' as AudioContextLatencyCategory,
		logLevel: 'info' as LogLevel,
		numberOfSharedAudioTags: 0,
		_experimentalKeepAudioContextAlive: true,
	};
	const view = render(<Player ref={player} {...props} />);
	const setTime = (time: number) => {
		// In keep-alive mode the native audio clock advances even while paused.
		// A replacement context starts its own clock at zero.
		(audio!.audioContext as unknown as TrackedAudioContext).currentTime +=
			(time - now) / 1000;
		now = time;
	};

	return {
		player,
		view,
		anchors,
		setTime,
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
	const harness = renderClockedPlayer();
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
	const harness = renderClockedPlayer();
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
		const harness = renderClockedPlayer();
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
	const harness = renderClockedPlayer();
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
	const harness = renderClockedPlayer();
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
		expect(harness.anchor()).toBeCloseTo(0.7 - 2 / 30, 8);
	} finally {
		harness.dispose();
	}
});
