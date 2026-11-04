import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import type React from 'react';
import {StrictMode, useContext} from 'react';
import {renderToString} from 'react-dom/server';
import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from '../audio/shared-audio-tags.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(() => {
	cleanup();
});

const previewEnvironment = {
	isClientSideRendering: false,
	isPlayer: true,
	isReadOnlyStudio: false,
	isRendering: false,
	isStudio: false,
};

const contexts: TrackedAudioContext[] = [];
let nativeSuspendCalls = 0;
let gainValues: number[] = [];

class TrackedAudioContext {
	public closeCalls = 0;
	constructor() {
		contexts.push(this);
	}

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

	close() {
		this.closeCalls++;
		this.state = 'closed';
		return Promise.resolve();
	}

	createGain() {
		return {
			connect: () => undefined,
			disconnect: () => undefined,
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
		this.state = 'running';
		return Promise.resolve();
	}

	getOutputTimestamp() {
		return {contextTime: this.currentTime, performanceTime: 0};
	}

	createMediaElementSource() {
		return {
			connect: () => undefined,
			disconnect: () => undefined,
		};
	}
}

const makeNode = (started: number[]) => {
	return {
		playbackRate: {value: 1},
		start: (scheduledTime: number) => {
			started.push(scheduledTime);
		},
	} as unknown as AudioBufferSourceNode;
};

const scheduleAt = (
	value: NonNullable<React.ContextType<typeof SharedAudioContext>>,
	node: AudioBufferSourceNode,
	scheduledTime: number,
) => {
	return value.scheduleAudioNode({
		node,
		mediaTimestamp: 0,
		sourceOffset: 0,
		scheduledTime,
		duration: 1,
		offset: 0,
		originalUnloopedMediaTimestamp: 0,
	});
};

const renderProvider = (
	_experimentalKeepAudioContextAlive: boolean,
	strict = false,
) => {
	const ref: {
		current: NonNullable<React.ContextType<typeof SharedAudioContext>> | null;
	} = {current: null};

	const Probe: React.FC = () => {
		ref.current = useContext(SharedAudioContext);
		return null;
	};

	const tree = (
		<RemotionEnvironmentContext.Provider value={previewEnvironment}>
			<WrapSequenceContext>
				<SharedAudioContextProvider
					audioEnabled
					audioLatencyHint="interactive"
					previewSampleRate={null}
					_experimentalKeepAudioContextAlive={
						_experimentalKeepAudioContextAlive
					}
				>
					<Probe />
				</SharedAudioContextProvider>
			</WrapSequenceContext>
		</RemotionEnvironmentContext.Provider>
	);

	render(strict ? <StrictMode>{tree}</StrictMode> : tree);

	if (!ref.current) {
		throw new Error('Expected the shared audio context to be available');
	}

	return ref.current;
};

const withMockedAudioContext = async (fn: () => Promise<void> | void) => {
	const originalAudioContext = globalThis.AudioContext;
	globalThis.AudioContext =
		TrackedAudioContext as unknown as typeof AudioContext;
	nativeSuspendCalls = 0;
	gainValues = [];
	try {
		await fn();
	} finally {
		globalThis.AudioContext = originalAudioContext;
	}
};

test('suspend() suspends the AudioContext by default', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		nativeSuspendCalls = 0;

		await act(async () => {
			value.suspend();
			await Promise.resolve();
		});
		expect(nativeSuspendCalls).toBe(1);
	});
});

test('_experimentalKeepAudioContextAlive silences the gain instead of suspending', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		nativeSuspendCalls = 0;
		gainValues = [];

		await act(async () => {
			value.suspend();
			await Promise.resolve();
		});
		expect(nativeSuspendCalls).toBe(0);
		expect(gainValues).toContain(0);
	});
});

test('_experimentalKeepAudioContextAlive queues nodes scheduled while silenced', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		const startedWhileRunning: number[] = [];
		scheduleAt(value, makeNode(startedWhileRunning), 1);
		expect(startedWhileRunning).toEqual([1]);

		await act(async () => {
			value.suspend();
			await Promise.resolve();
		});

		// The native state is still 'running' here, so the node must be queued
		// based on the silenced state rather than on the context state.
		const startedWhileSilenced: number[] = [];
		scheduleAt(value, makeNode(startedWhileSilenced), 2);
		expect(startedWhileSilenced).toEqual([]);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		expect(startedWhileSilenced).toEqual([2]);
	});
});

// Repeated Player closure leaked every context; StrictMode also allocated an
// abandoned render-time context. Every committed resource must have one owner.
test.each([false, true])(
	'closes every context after repeated mounts (StrictMode=%s)',
	async (strict) => {
		await withMockedAudioContext(async () => {
			contexts.length = 0;
			for (let cycle = 0; cycle < 3; cycle++) {
				const value = renderProvider(false, strict);
				expect(value.audioContext?.state).toBe('suspended');
				expect(
					contexts.filter((context) => context.state !== 'closed'),
				).toHaveLength(1);
				await act(async () => {
					await value.resume();
				});
				expect(value.audioContext?.state).toBe('running');
				cleanup();
				expect(contexts.every((context) => context.closeCalls === 1)).toBe(
					true,
				);
			}
		});
	},
);

test('an uncommitted preview render allocates no AudioContext', async () => {
	await withMockedAudioContext(() => {
		contexts.length = 0;
		renderToString(
			<RemotionEnvironmentContext.Provider value={previewEnvironment}>
				<WrapSequenceContext>
					<SharedAudioContextProvider
						audioEnabled
						audioLatencyHint="interactive"
						previewSampleRate={null}
						_experimentalKeepAudioContextAlive={false}
					>
						<div />
					</SharedAudioContextProvider>
				</WrapSequenceContext>
			</RemotionEnvironmentContext.Provider>,
		);
		expect(contexts).toHaveLength(0);
	});
});
