import {afterEach, expect, test} from 'bun:test';
import {act, cleanup} from '@testing-library/react';
import {RESUME_WAIT_TIMEOUT} from '../audio/wait-until-actually-resumed.js';
import {
	makeNode,
	mock,
	nativeOps,
	renderProvider,
	scheduleAt,
	withMockedAudioContext,
} from './mock-audio-context.js';

afterEach(() => {
	cleanup();
});

const flush = () =>
	act(async () => {
		await Promise.resolve();
	});

test('_experimentalKeepAudioContextAlive silences the gain instead of suspending', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		mock.ops = [];

		await act(async () => {
			await value.suspend();
		});

		expect(mock.ops).toContain('gain:0');
		expect(mock.ops).not.toContain('suspend');
		expect(mock.lastContext?.state).toBe('running');
	});
});

test('repeated pause/play cycles stay on the gain, never the native context', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		mock.ops = [];

		const cycles: string[][] = [];
		for (let i = 0; i < 3; i++) {
			await act(async () => {
				await value.suspend();
			});
			await act(async () => {
				await value.resume();
			});
			cycles.push([...mock.ops]);
			mock.ops = [];
		}

		for (const cycle of cycles) {
			expect(cycle.filter((op) => op === 'resume' || op === 'suspend')).toEqual(
				[],
			);
			expect(cycle).toEqual(cycles[0]);
			expect(cycle[0]).toBe('gain:0');
			expect(cycle[cycle.length - 1]).toBe('gain:1');
		}

		expect(value.getIsResumingAudioContext()).toBeNull();
	});
});

test('nodes scheduled while silenced start exactly once, in order, on resume', async () => {
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
		// Queueing follows playback intent, not native state (still running).
		expect(started).toEqual([]);
		expect(mock.lastContext?.state).toBe('running');

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

test('a later resume() retries a stalled native resume on the same wait promise', async () => {
	await withMockedAudioContext(async () => {
		mock.stallNativeResume = true;
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		const firstWait = value.getIsResumingAudioContext();
		expect(firstWait).not.toBeNull();
		const resumesBefore = nativeOps().filter((op) => op === 'resume').length;

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		expect(value.getIsResumingAudioContext()).toBe(firstWait);

		mock.stallNativeResume = false;
		await act(async () => {
			await value.resume();
		});

		const resumesAfter = nativeOps().filter((op) => op === 'resume').length;
		expect(resumesAfter).toBeGreaterThan(resumesBefore);
		expect(await firstWait).toBe('resumed');
		expect(value.getIsResumingAudioContext()).toBeNull();
		expect(mock.lastContext?.state).toBe('running');
	});
});

test('a rejected native resume keeps playing intent and a later attempt recovers', async () => {
	await withMockedAudioContext(async () => {
		mock.stallNativeResume = true;
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const wait = value.getIsResumingAudioContext();
		expect(wait).not.toBeNull();

		mock.stallNativeResume = false;
		mock.rejectNativeResume = true;
		await act(async () => {
			await value.resume();
		});
		expect(mock.lastContext?.state).toBe('suspended');

		mock.rejectNativeResume = false;
		await act(async () => {
			await value.resume();
		});

		expect(await wait).toBe('resumed');
		expect(mock.lastContext?.state).toBe('running');
	});
});

test('a stalled resume stops parking playback after the wait timeout', async () => {
	await withMockedAudioContext(async () => {
		mock.stallNativeResume = true;
		const value = renderProvider(true);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const wait = value.getIsResumingAudioContext();
		expect(wait).not.toBeNull();

		// 'cancelled' lets the frame clock advance without muting; audio joins
		// on the next gesture.
		const result = await Promise.race([
			wait,
			new Promise((resolve) => {
				setTimeout(() => resolve('pending'), RESUME_WAIT_TIMEOUT + 250);
			}),
		]);
		expect(result).toBe('cancelled');
		expect(value.getIsResumingAudioContext()).toBeNull();
	});
});

test('an interruption ending while silenced does not suspend the context', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});
		mock.ops = [];

		act(() => {
			mock.lastContext?.setNativeState('interrupted');
		});
		act(() => {
			mock.lastContext?.setNativeState('running');
		});
		await flush();

		expect(nativeOps()).toEqual([]);
		expect(mock.lastContext?.state).toBe('running');

		await act(async () => {
			await value.resume();
		});
		expect(mock.ops).toContain('gain:1');
	});
});

test('unmounting suspends the running context', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(true);

		await act(async () => {
			await value.resume();
		});
		mock.ops = [];

		act(() => {
			cleanup();
		});
		await flush();

		expect(nativeOps()).toEqual(['suspend']);
		expect(mock.lastContext?.state).toBe('suspended');
	});
});
