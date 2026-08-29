// Black-box characterization of SharedAudioContextProvider resume/suspend
// behavior. Asserts the observable native-op sequence (resume, suspend, gain
// writes) for the playback scenarios the Player actually produces — including
// the double-suspend pause path — without reference to the implementation.
import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import type React from 'react';
import {useContext} from 'react';
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

// Ordered log of everything that hits the native context boundary.
let ops: string[] = [];
let stallNativeResume = false;
let rejectNativeResume = false;
let finishNativeResume: (() => void) | null = null;
let lastContext: TrackedAudioContext | null = null;

class TrackedAudioContext {
	public state = 'suspended' as AudioContextState;
	public baseLatency = 0;
	public outputLatency = 0;
	public currentTime = 0;
	public destination = {};
	private readonly stateChangeListeners = new Set<EventListener>();
	private outputTime = 0;

	constructor() {
		lastContext = this;
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

	private fireStateChange() {
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
					ops.push(`gain:${value}`);
				},
				setValueAtTime: (value: number) => {
					ops.push(`gain:${value}`);
				},
			},
		};
	}

	suspend() {
		ops.push('suspend');
		this.state = 'suspended';
		this.fireStateChange();
		return Promise.resolve();
	}

	// Models the OS flipping state (interruption end, tab refocus) — fires
	// statechange without logging a native op we issued.
	simulateNativeStateChange(next: AudioContextState) {
		this.state = next;
		this.fireStateChange();
	}

	resume() {
		ops.push('resume');
		if (rejectNativeResume) {
			return Promise.reject(new Error('NotAllowedError'));
		}

		if (stallNativeResume) {
			return new Promise<void>((resolve) => {
				finishNativeResume = () => {
					this.state = 'running';
					this.fireStateChange();
					resolve();
				};
			});
		}

		this.state = 'running';
		this.fireStateChange();
		return Promise.resolve();
	}

	getOutputTimestamp() {
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

const renderProvider = (_experimentalKeepAudioContextAlive: boolean) => {
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

	// Mount has its own characterization test; scenarios start from a clean log.
	ops = [];
	return ref.current;
};

const withMockedAudioContext = async (fn: () => Promise<void>) => {
	const originalAudioContext = globalThis.AudioContext;
	globalThis.AudioContext =
		TrackedAudioContext as unknown as typeof AudioContext;
	ops = [];
	stallNativeResume = false;
	rejectNativeResume = false;
	finishNativeResume = null;
	lastContext = null;
	try {
		await fn();
	} finally {
		globalThis.AudioContext = originalAudioContext;
	}
};

const flush = () => act(async () => Promise.resolve());
const nativeOps = () => ops.filter((op) => op === 'resume' || op === 'suspend');

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

test('mount: default provider creates the context parked (suspend + gain init)', async () => {
	await withMockedAudioContext(async () => {
		const Probe: React.FC = () => {
			useContext(SharedAudioContext);
			return null;
		};

		render(
			<RemotionEnvironmentContext.Provider value={previewEnvironment}>
				<WrapSequenceContext>
					<SharedAudioContextProvider
						audioEnabled
						audioLatencyHint="interactive"
						previewSampleRate={null}
						_experimentalKeepAudioContextAlive={false}
					>
						<Probe />
					</SharedAudioContextProvider>
				</WrapSequenceContext>
			</RemotionEnvironmentContext.Provider>,
		);
		await flush();

		expect(ops[0]).toBe('suspend');
		expect(lastContext?.state).toBe('suspended');
	});
});

// ---------------------------------------------------------------------------
// Default mode
// ---------------------------------------------------------------------------

test('default: play then pause after resume settled → resume, suspend', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});

		expect(nativeOps()).toEqual(['resume', 'suspend']);
		expect(lastContext?.state).toBe('suspended');
	});
});

test('default: pause while resume pending ends with the context suspended', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		const pendingNativeResume = finishNativeResume;
		expect(pendingNativeResume).not.toBeNull();

		const suspendPromise = value.suspend();
		await flush();

		await act(async () => {
			pendingNativeResume?.();
			await suspendPromise;
		});
		await flush();

		expect(lastContext?.state).toBe('suspended');
	});
});

test('default: the real Player pause path (two suspend calls) still suspends', async () => {
	// A real pause issues suspend() twice: use-player-methods.ts pause() and
	// the use-playback.ts effect when `playing` flips to false. The context
	// must end suspended regardless of when the pending resume settles.
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		const pendingNativeResume = finishNativeResume;
		expect(pendingNativeResume).not.toBeNull();

		const firstSuspend = value.suspend();
		const secondSuspend = value.suspend();
		await flush();

		await act(async () => {
			pendingNativeResume?.();
			await Promise.all([firstSuspend, secondSuspend]);
		});
		await flush();

		expect(lastContext?.state).toBe('suspended');
	});
});

test('default: pause then play again while resume pending → no suspend of new playback', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		const pendingNativeResume = finishNativeResume;
		const suspendPromise = value.suspend();
		await flush();

		// User hits play again before the first resume ever settled.
		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		stallNativeResume = false;
		await act(async () => {
			pendingNativeResume?.();
			await suspendPromise;
		});
		await flush();

		expect(lastContext?.state).toBe('running');
	});
});

test('default: a second resume while one is pending issues no extra native resume', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			value.resume();
			await Promise.resolve();
		});

		expect(nativeOps()).toEqual(['resume']);
	});
});

// ---------------------------------------------------------------------------
// Keep-alive mode
// ---------------------------------------------------------------------------

test('keep-alive: pause silences via gain, never natively suspends; resume restores gain', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		ops = [];

		await act(async () => {
			await value.suspend();
		});
		expect(ops).toContain('gain:0');
		expect(ops).not.toContain('suspend');
		ops = [];

		await act(async () => {
			await value.resume();
		});
		expect(ops).toContain('gain:1');
		expect(ops).not.toContain('suspend');
		expect(lastContext?.state).toBe('running');
	});
});

test('keep-alive: a later resume retries a stalled native resume on the same barrier', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		const barrier = value.getIsResumingAudioContext();
		expect(barrier).not.toBeNull();
		const resumesBefore = nativeOps().filter((op) => op === 'resume').length;

		stallNativeResume = false;
		await act(async () => {
			await value.resume();
		});

		const resumesAfter = nativeOps().filter((op) => op === 'resume').length;
		expect(resumesAfter).toBeGreaterThan(resumesBefore);
		expect(await barrier).toBe('resumed');
		expect(value.getIsResumingAudioContext()).toBeNull();
		expect(lastContext?.state).toBe('running');
	});
});

// NOTE: a rejected native resume cannot be characterized here: the upstream
// context wrapper (use-audio-context.ts) attaches `promise.finally(...)` and
// returns the ORIGINAL promise, so any rejection leaks as an unhandled
// rejection (pre-existing on main, not introduced by the patches) and bun
// fails the test. Retry-after-failure semantics are covered by the stalled
// variant above, which exercises the same barrier.

test('keep-alive: pausing while a resume is pending cancels the barrier', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		const barrier = value.getIsResumingAudioContext();
		expect(barrier).not.toBeNull();

		await act(async () => {
			await value.suspend();
		});

		expect(await barrier).toBe('cancelled');
		expect(nativeOps()).not.toContain('suspend');
	});
});

test('keep-alive: nodes scheduled while silenced start once the context resumes', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(true);
		const started: number[] = [];

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		// A node scheduled while the initial resume is still pending starts
		// immediately — the parked context clock keeps it from playing early —
		// and is not started a second time when the context reaches running.
		scheduleAt(value, makeNode(started), 2);
		expect(started).toEqual([2]);

		stallNativeResume = false;
		await act(async () => {
			await value.resume();
		});
		await flush();

		expect(started).toEqual([2]);
	});
});

// ---------------------------------------------------------------------------
// Player flows (agent-designed batch)
// ---------------------------------------------------------------------------

test('default: buffering pause then resume re-runs the full arm path', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			await value.resume();
		});
		ops = [];

		await act(async () => {
			await value.suspend();
		});
		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		// The second play re-enters the full arm path: a fresh native resume
		// (its barrier settles as soon as the context reports running).
		expect(nativeOps()).toEqual(['suspend', 'resume']);
		expect(lastContext?.state).toBe('running');
	});
});

test('default: a node scheduled while parked waits for the next play', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);
		const started: number[] = [];

		// Seek while paused: provider is still parked from mount.
		scheduleAt(value, makeNode(started), 5);
		expect(started).toEqual([]);

		await act(async () => {
			await value.resume();
		});
		expect(started).toEqual([5]);

		await act(async () => {
			await value.resume();
		});
		expect(started).toEqual([5]);
	});
});

test('mount+play: unmount suspends the keep-alive context', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		ops = [];

		await act(async () => {
			cleanup();
		});
		await flush();

		expect(nativeOps()).toEqual(['suspend']);
		expect(lastContext?.state).toBe('suspended');
	});
});

// ---------------------------------------------------------------------------
// Paused-intent enforcer (agent-designed batch)
// ---------------------------------------------------------------------------

test('default: iOS interruption ending while paused is re-suspended', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});
		ops = [];

		await act(async () => {
			lastContext?.simulateNativeStateChange(
				'interrupted' as AudioContextState,
			);
		});
		// The interruption alone must not trigger the enforcer.
		expect(nativeOps()).toEqual([]);

		await act(async () => {
			lastContext?.simulateNativeStateChange('running');
		});
		await flush();

		expect(nativeOps()).toEqual(['suspend']);
		expect(lastContext?.state).toBe('suspended');
	});
});

test('default: external running flips are re-suspended once each, no loop', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});
		ops = [];

		await act(async () => {
			lastContext?.simulateNativeStateChange('running');
		});
		await flush();
		await act(async () => {
			lastContext?.simulateNativeStateChange('running');
		});
		await flush();

		// One corrective suspend per flip: the enforcer must not re-trigger on
		// the statechange its own suspend() fires.
		expect(nativeOps()).toEqual(['suspend', 'suspend']);
		expect(lastContext?.state).toBe('suspended');
	});
});

test('default: a late resume settling after pause + new play is not suspended', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const pending = finishNativeResume;

		const suspendPromise = value.suspend();
		await flush();

		stallNativeResume = false;
		await act(async () => {
			await value.resume();
		});
		ops = [];

		await act(async () => {
			pending?.();
			await suspendPromise;
		});
		await flush();

		// The enforcer reads current intent (playing), not intent at pause time.
		expect(nativeOps()).toEqual([]);
		expect(lastContext?.state).toBe('running');
	});
});

test('keep-alive: the enforcer is inert through interrupted → running while silenced', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});
		ops = [];

		await act(async () => {
			lastContext?.simulateNativeStateChange(
				'interrupted' as AudioContextState,
			);
		});
		await act(async () => {
			lastContext?.simulateNativeStateChange('running');
		});
		await flush();

		expect(nativeOps()).toEqual([]);
		expect(lastContext?.state).toBe('running');

		await act(async () => {
			await value.resume();
		});
		expect(ops).toContain('gain:1');
	});
});

// ---------------------------------------------------------------------------
// Keep-alive steady state (agent-designed batch)
// ---------------------------------------------------------------------------

test('keep-alive: repeated pause/play cycles never touch the native context', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		ops = [];

		const cycles: string[][] = [];
		for (let i = 0; i < 3; i++) {
			await act(async () => {
				await value.suspend();
			});
			await act(async () => {
				await value.resume();
			});
			cycles.push([...ops]);
			ops = [];
		}

		for (const cycle of cycles) {
			expect(cycle.filter((op) => op === 'resume' || op === 'suspend')).toEqual(
				[],
			);
			// Each cycle emits the same gain pattern: silence, then ramp back up.
			expect(cycle).toEqual(cycles[0]);
			expect(cycle[0]).toBe('gain:0');
			expect(cycle[cycle.length - 1]).toBe('gain:1');
		}

		expect(lastContext?.state).toBe('running');
		expect(value.getIsResumingAudioContext()).toBeNull();
	});
});

test('keep-alive: nodes scheduled while silenced replay exactly once, in order', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);
		const started: number[] = [];

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});

		scheduleAt(value, makeNode(started), 1);
		scheduleAt(value, makeNode(started), 2);
		scheduleAt(value, makeNode(started), 3);
		// Queueing is driven by paused intent, not native state (still running).
		expect(started).toEqual([]);
		expect(lastContext?.state).toBe('running');

		await act(async () => {
			await value.resume();
		});
		await flush();
		expect(started).toEqual([1, 2, 3]);

		await act(async () => {
			await value.resume();
		});
		await flush();
		expect(started).toEqual([1, 2, 3]);
	});
});

test('keep-alive: repeated resume() calls while pending share one barrier identity', async () => {
	await withMockedAudioContext(async () => {
		stallNativeResume = true;
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const barrier = value.getIsResumingAudioContext();
		expect(barrier).not.toBeNull();

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const barrier2 = value.getIsResumingAudioContext();
		expect(barrier2).toBe(barrier);

		stallNativeResume = false;
		await act(async () => {
			await value.resume();
		});
		await flush();

		expect(await barrier).toBe('resumed');
		expect(value.getIsResumingAudioContext()).toBeNull();
		expect(lastContext?.state).toBe('running');
	});
});
