import {afterEach, expect, test} from 'bun:test';
import {createRef} from 'react';
import {Html5Audio, Internals, useBufferState} from 'remotion';
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

const sequenceManager = {
	registerSequence: () => undefined,
	unregisterSequence: () => undefined,
	sequences: [],
};

let startBuffering: (() => {unblock: () => void}) | null = null;

const AudioComposition = () => {
	startBuffering = useBufferState().delayPlayback;

	return (
		<Internals.SequenceManager.Provider value={sequenceManager}>
			<Html5Audio src="audio.mp3" />
		</Internals.SequenceManager.Provider>
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

test('a synchronous play() + pause() still suspends the AudioContext', async () => {
	// Both state updates batch into one commit, so the use-playback effect
	// never observes playing=true; the pause() method's own intent
	// declaration must cover this.
	const originalAudioContext = globalThis.AudioContext;
	globalThis.AudioContext =
		TrackedAudioContext as unknown as typeof AudioContext;
	try {
		nativeSuspendCalls = 0;
		const playerRef = createRef<PlayerRef>();
		render(
			<Player
				ref={playerRef}
				component={AudioComposition}
				durationInFrames={300}
				compositionWidth={1920}
				compositionHeight={1080}
				fps={30}
			/>,
		);
		nativeSuspendCalls = 0;

		await act(async () => {
			playerRef.current?.play();
			playerRef.current?.pause();
			await Promise.resolve();
		});

		expect(playerRef.current?.isPlaying()).toBe(false);
		expect(nativeSuspendCalls).toBeGreaterThan(0);
	} finally {
		globalThis.AudioContext = originalAudioContext;
	}
});
