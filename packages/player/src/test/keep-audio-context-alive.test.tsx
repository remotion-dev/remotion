import {afterEach, expect, test} from 'bun:test';
import {createRef} from 'react';
import {Html5Audio, Internals} from 'remotion';
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
				linearRampToValueAtTime: () => undefined,
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

const AudioComposition = () => {
	return (
		<Internals.SequenceManager.Provider value={sequenceManager}>
			<Html5Audio src="audio.mp3" />
		</Internals.SequenceManager.Provider>
	);
};

const playAndPause = async ({
	keepAudioContextAlive,
}: {
	keepAudioContextAlive: boolean;
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
				keepAudioContextAlive={keepAudioContextAlive}
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
		gainValues = [];

		await act(async () => {
			playerRef.current?.pause();
			await Promise.resolve();
		});

		return {
			resumeCallsDuringPlay,
			suspendCallsDuringPause: nativeSuspendCalls,
			gainValuesDuringPause: gainValues,
		};
	} finally {
		globalThis.AudioContext = originalAudioContext;
		globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
	}
};

test('Pausing suspends the AudioContext by default', async () => {
	const {resumeCallsDuringPlay, suspendCallsDuringPause} = await playAndPause({
		keepAudioContextAlive: false,
	});

	expect(resumeCallsDuringPlay).toBe(1);
	expect(suspendCallsDuringPause).toBe(1);
});

test('keepAudioContextAlive silences through the gain instead of suspending', async () => {
	const {
		resumeCallsDuringPlay,
		suspendCallsDuringPause,
		gainValuesDuringPause,
	} = await playAndPause({keepAudioContextAlive: true});

	// The context was already started on mount, so playing does not need to
	// resume it again.
	expect(resumeCallsDuringPlay).toBe(0);
	expect(suspendCallsDuringPause).toBe(0);
	expect(gainValuesDuringPause).toContain(0);
});
