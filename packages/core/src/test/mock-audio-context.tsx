import {render} from '@testing-library/react';
import type React from 'react';
import {useContext} from 'react';
import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from '../audio/shared-audio-tags.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

const previewEnvironment = {
	isClientSideRendering: false,
	isPlayer: true,
	isReadOnlyStudio: false,
	isRendering: false,
	isStudio: false,
};

export type MockAudioContextControls = {
	// Ordered log of everything crossing the native boundary:
	// 'resume', 'suspend', 'gain:<value>'.
	ops: string[];
	stallNativeResume: boolean;
	rejectNativeResume: boolean;
	finishNativeResume: (() => void) | null;
	lastContext: MockAudioContext | null;
};

export const mock: MockAudioContextControls = {
	ops: [],
	stallNativeResume: false,
	rejectNativeResume: false,
	finishNativeResume: null,
	lastContext: null,
};

export class MockAudioContext {
	public state = 'suspended' as AudioContextState;
	public baseLatency = 0;
	public outputLatency = 0;
	public currentTime = 0;
	public destination = {};
	private readonly stateChangeListeners = new Set<EventListener>();
	private outputTime = 0;

	constructor() {
		mock.lastContext = this;
	}

	addEventListener(name: string, listener: EventListener) {
		if (name === 'statechange') {
			this.stateChangeListeners.add(listener);
		}
	}

	removeEventListener(name: string, listener: EventListener) {
		if (name === 'statechange') {
			this.stateChangeListeners.delete(listener);
		}
	}

	// Sets the state and fires statechange without logging a native op —
	// models the browser flipping state on its own (an interruption ending,
	// auto-starting a blocked context on a gesture). Real browsers dispatch
	// statechange in a later task; tests must not depend on same-tick
	// ordering between a native call and its statechange.
	setNativeState(next: AudioContextState) {
		this.state = next;
		for (const listener of this.stateChangeListeners) {
			listener(new Event('statechange'));
		}
	}

	createGain() {
		return {
			connect: () => undefined,
			gain: {
				cancelScheduledValues: () => undefined,
				linearRampToValueAtTime: (value: number) => {
					mock.ops.push(`gain:${value}`);
				},
				setValueAtTime: (value: number) => {
					mock.ops.push(`gain:${value}`);
				},
			},
		};
	}

	suspend() {
		mock.ops.push('suspend');
		this.setNativeState('suspended');
		return Promise.resolve();
	}

	resume() {
		mock.ops.push('resume');
		if (mock.rejectNativeResume) {
			return Promise.reject(new Error('NotAllowedError'));
		}

		if (mock.stallNativeResume) {
			return new Promise<void>((resolve) => {
				mock.finishNativeResume = () => {
					this.setNativeState('running');
					resolve();
				};
			});
		}

		this.setNativeState('running');
		return Promise.resolve();
	}

	getOutputTimestamp() {
		// A running context's clocks advance; a suspended one's are frozen.
		// Reads happen from waitUntilActuallyResumed's polling, so advancing
		// per read models exactly what the poller observes in a browser.
		if (this.state === 'running') {
			this.currentTime += 0.01;
			this.outputTime += 10;
		}

		return {contextTime: this.currentTime, performanceTime: this.outputTime};
	}

	createMediaElementSource() {
		return {
			connect: () => undefined,
			disconnect: () => undefined,
		};
	}
}

export const nativeOps = () =>
	mock.ops.filter((op) => op === 'resume' || op === 'suspend');

export const makeNode = (started: number[]) => {
	return {
		playbackRate: {value: 1},
		start: (scheduledTime: number) => {
			started.push(scheduledTime);
		},
	} as unknown as AudioBufferSourceNode;
};

export const scheduleAt = (
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

export const renderProvider = (_experimentalKeepAudioContextAlive: boolean) => {
	const ref: {
		current: NonNullable<React.ContextType<typeof SharedAudioContext>> | null;
	} = {current: null};

	const Probe: React.FC = () => {
		ref.current = useContext(SharedAudioContext);
		return null;
	};

	render(
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
		</RemotionEnvironmentContext.Provider>,
	);

	if (!ref.current) {
		throw new Error('Expected the shared audio context to be available');
	}

	// Mount behavior has its own test; scenarios start from a clean log.
	mock.ops = [];
	return ref.current;
};

export const withMockedAudioContext = async (fn: () => Promise<void>) => {
	const originalAudioContext = globalThis.AudioContext;
	globalThis.AudioContext = MockAudioContext as unknown as typeof AudioContext;
	mock.ops = [];
	mock.stallNativeResume = false;
	mock.rejectNativeResume = false;
	mock.finishNativeResume = null;
	mock.lastContext = null;
	try {
		await fn();
	} finally {
		globalThis.AudioContext = originalAudioContext;
	}
};
