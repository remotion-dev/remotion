import {afterEach, beforeEach, expect, test} from 'bun:test';
import {createRef} from 'react';
import {Html5Audio, Internals} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

const originalAudioContext = globalThis.AudioContext;
const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

afterEach(() => {
	cleanup();
	globalThis.AudioContext = originalAudioContext;
	globalThis.requestAnimationFrame = originalRequestAnimationFrame;
	globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
});

let createdAudioContexts = 0;
let resumeCalls = 0;
let suspendCalls = 0;
let pendingResumes: (() => void)[] = [];
let animationFrameId = 0;
let animationFrames = new Map<number, FrameRequestCallback>();

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
		suspendCalls++;
		this.state = 'suspended';
		return Promise.resolve();
	}

	resume() {
		resumeCalls++;
		return new Promise<void>((resolve) => {
			pendingResumes.push(() => {
				this.state = 'running';
				resolve();
			});
		});
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

const AudioComposition = () => {
	return (
		<Internals.SequenceManagerProvider>
			<Html5Audio src="audio.mp3" />
		</Internals.SequenceManagerProvider>
	);
};

beforeEach(() => {
	createdAudioContexts = 0;
	resumeCalls = 0;
	suspendCalls = 0;
	pendingResumes = [];
	animationFrameId = 0;
	animationFrames = new Map<number, FrameRequestCallback>();
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
});

const flushAnimationFrames = () => {
	const callbacks = [...animationFrames.values()];
	animationFrames.clear();
	callbacks.forEach((callback) => callback(performance.now()));
};

test.serial(
	'Player keeps waiting when a user-initiated AudioContext resume stays pending',
	async () => {
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

		await act(async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 1050));
		});
		act(flushAnimationFrames);

		expect(playerRef.current?.isPlaying()).toBe(true);
		expect(playerRef.current?.isMuted()).toBe(false);
		expect(playerRef.current?.getCurrentFrame()).toBe(stalledFrame);
		expect(resumeCalls).toBe(1);
		expect(animationFrames.size).toBe(1);

		const suspendsBeforePause = suspendCalls;
		await act(async () => {
			playerRef.current?.pause();
			await Promise.resolve();
		});
		expect(playerRef.current?.isPlaying()).toBe(false);
		expect(animationFrames.size).toBe(0);
		// A pending native resume must settle before it is safe to suspend.
		expect(suspendCalls).toBe(suspendsBeforePause);
		await act(async () => {
			pendingResumes.shift()!();
			await Promise.resolve();
		});
		expect(suspendCalls).toBe(suspendsBeforePause + 1);

		await act(async () => {
			playerRef.current?.play();
			await Promise.resolve();
		});
		await act(async () => {
			playerRef.current?.pause();
			await Promise.resolve();
		});
		await act(async () => {
			playerRef.current?.play();
			await Promise.resolve();
		});
		// Resume is still called synchronously; a newer Play cancels the
		// deferred suspension belonging to the preceding Pause.
		expect(resumeCalls).toBe(3);
		await act(async () => {
			pendingResumes.splice(0).forEach((resolve) => resolve());
			await Promise.resolve();
		});
		expect(suspendCalls).toBe(suspendsBeforePause + 1);
		expect(playerRef.current?.isPlaying()).toBe(true);
		await act(async () => {
			playerRef.current?.pause();
			await Promise.resolve();
		});
		expect(suspendCalls).toBe(suspendsBeforePause + 2);
	},
);

test.serial(
	'Player mutes and continues when an autoplay AudioContext resume stays pending',
	async () => {
		const playerRef = createRef<PlayerRef>();
		render(
			<Player
				ref={playerRef}
				component={AudioComposition}
				durationInFrames={300}
				compositionWidth={1920}
				compositionHeight={1080}
				fps={30}
				autoPlay
			/>,
		);
		await act(async () => {
			await Promise.resolve();
		});
		expect(createdAudioContexts).toBe(1);
		expect(resumeCalls).toBe(1);
		expect(animationFrames.size).toBe(1);
		const stalledFrame = playerRef.current?.getCurrentFrame();

		await act(async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 1050));
		});
		await new Promise<void>((resolve) => setTimeout(resolve, 50));
		act(flushAnimationFrames);

		expect(playerRef.current?.isPlaying()).toBe(true);
		expect(playerRef.current?.isMuted()).toBe(true);
		expect(playerRef.current?.getCurrentFrame()).toBeGreaterThan(
			stalledFrame ?? 0,
		);
		expect(resumeCalls).toBe(1);
		expect(animationFrames.size).toBe(1);
	},
);
