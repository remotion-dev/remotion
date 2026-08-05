import {afterEach, expect, test} from 'bun:test';
import {createRef} from 'react';
import {Html5Audio, Internals} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

afterEach(() => {
	cleanup();
});

let createdAudioContexts = 0;
let resumeCalls = 0;

class FrozenAudioContext {
	public state = 'suspended' as AudioContextState;
	public baseLatency = 0;
	public outputLatency = 0;
	public currentTime = 0;
	public destination = {};

	constructor() {
		createdAudioContexts++;
	}

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
				setValueAtTime: () => undefined,
			},
		};
	}

	suspend() {
		this.state = 'suspended';
		return Promise.resolve();
	}

	resume() {
		resumeCalls++;
		return new Promise<void>(() => undefined);
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

test('Player mutes and continues after an AudioContext resume stays pending', async () => {
	const originalAudioContext = globalThis.AudioContext;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

	let animationFrameId = 0;
	const animationFrames = new Map<number, FrameRequestCallback>();

	globalThis.AudioContext =
		FrozenAudioContext as unknown as typeof AudioContext;
	globalThis.requestAnimationFrame = (callback) => {
		animationFrameId++;
		animationFrames.set(animationFrameId, callback);
		return animationFrameId;
	};

	globalThis.cancelAnimationFrame = (id) => {
		animationFrames.delete(id);
	};

	const flushAnimationFrames = () => {
		const callbacks = [...animationFrames.values()];
		animationFrames.clear();
		callbacks.forEach((callback) => callback(performance.now()));
	};

	try {
		createdAudioContexts = 0;
		resumeCalls = 0;
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
		expect(createdAudioContexts).toBe(1);

		await act(async () => {
			playerRef.current?.play();
			await Promise.resolve();
		});
		expect(resumeCalls).toBe(1);
		expect(animationFrames.size).toBe(1);
		const stalledFrame = playerRef.current?.getCurrentFrame();

		await new Promise<void>((resolve) => setTimeout(resolve, 50));
		act(flushAnimationFrames);
		expect(playerRef.current?.getCurrentFrame()).toBe(stalledFrame);

		await act(async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 1050));
		});
		expect(animationFrames.size).toBe(1);

		await new Promise<void>((resolve) => setTimeout(resolve, 50));
		act(flushAnimationFrames);

		expect(playerRef.current?.isPlaying()).toBe(true);
		expect(playerRef.current?.isMuted()).toBe(true);
		expect(playerRef.current?.getCurrentFrame()).toBeGreaterThan(
			stalledFrame ?? 0,
		);
		expect(resumeCalls).toBe(1);
		expect(animationFrames.size).toBe(1);

		await act(async () => {
			playerRef.current?.pause();
			await Promise.resolve();
		});
		expect(animationFrames.size).toBe(0);

		await act(async () => {
			playerRef.current?.unmute();
			playerRef.current?.play();
			await Promise.resolve();
		});
		expect(resumeCalls).toBe(2);
		expect(animationFrames.size).toBe(1);

		await act(async () => {
			playerRef.current?.pause();
			await Promise.resolve();
		});
		expect(playerRef.current?.isPlaying()).toBe(false);
		expect(animationFrames.size).toBe(0);
	} finally {
		globalThis.AudioContext = originalAudioContext;
		globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
	}
});
