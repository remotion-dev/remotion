// Default-mode suspension: suspend() declares paused intent and the provider
// converges the native context toward it, including states callers cannot
// reach — a resume() settling after pause, an interruption ending, a browser
// auto-starting a blocked context.
import {afterEach, expect, test} from 'bun:test';
import {act, cleanup} from '@testing-library/react';
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

test('the provider creates the context parked', async () => {
	await withMockedAudioContext(async () => {
		renderProvider(false);
		await flush();

		expect(mock.lastContext?.state).toBe('suspended');
	});
});

test('play then pause resumes and suspends the native context', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});

		expect(nativeOps()).toEqual(['resume', 'suspend']);
		expect(mock.lastContext?.state).toBe('suspended');
	});
});

test('pausing while a resume is still pending ends with the context suspended', async () => {
	await withMockedAudioContext(async () => {
		mock.stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const pendingNativeResume = mock.finishNativeResume;
		expect(pendingNativeResume).not.toBeNull();

		const suspendPromise = value.suspend();
		await flush();

		await act(async () => {
			pendingNativeResume?.();
			await suspendPromise;
		});
		await flush();

		expect(mock.lastContext?.state).toBe('suspended');
	});
});

test('a pause reaching suspend() twice still ends with the context suspended', async () => {
	// A real pause declares intent twice: once in the pause() method, once in
	// the use-playback effect when `playing` flips.
	await withMockedAudioContext(async () => {
		mock.stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const pendingNativeResume = mock.finishNativeResume;

		const first = value.suspend();
		const second = value.suspend();
		await flush();

		await act(async () => {
			pendingNativeResume?.();
			await Promise.all([first, second]);
		});
		await flush();

		expect(mock.lastContext?.state).toBe('suspended');
	});
});

test('playing again while the paused resume is still pending is not suspended', async () => {
	await withMockedAudioContext(async () => {
		mock.stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			await Promise.resolve();
		});
		const pendingNativeResume = mock.finishNativeResume;

		const suspendPromise = value.suspend();
		await flush();

		mock.stallNativeResume = false;
		await act(async () => {
			await value.resume();
		});
		mock.ops = [];

		await act(async () => {
			pendingNativeResume?.();
			await suspendPromise;
		});
		await flush();

		expect(nativeOps()).toEqual([]);
		expect(mock.lastContext?.state).toBe('running');
	});
});

test('a second resume() while one is pending issues no extra native resume', async () => {
	await withMockedAudioContext(async () => {
		mock.stallNativeResume = true;
		const value = renderProvider(false);

		await act(async () => {
			value.resume();
			value.resume();
			await Promise.resolve();
		});

		expect(nativeOps()).toEqual(['resume']);

		await act(async () => {
			mock.finishNativeResume?.();
			await Promise.resolve();
		});
	});
});

test('an interruption ending while paused does not leave the context running', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

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
		// The interruption itself must not be answered with a suspend.
		expect(nativeOps()).toEqual([]);

		act(() => {
			mock.lastContext?.setNativeState('running');
		});
		await flush();

		expect(nativeOps()).toEqual(['suspend']);
		expect(mock.lastContext?.state).toBe('suspended');
	});
});

test('every unwanted transition to running is answered exactly once', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			await value.resume();
		});
		await act(async () => {
			await value.suspend();
		});
		mock.ops = [];

		act(() => {
			mock.lastContext?.setNativeState('running');
		});
		await flush();
		act(() => {
			mock.lastContext?.setNativeState('running');
		});
		await flush();

		// One suspend per flip — the suspend's own statechange must not
		// trigger another round.
		expect(nativeOps()).toEqual(['suspend', 'suspend']);
		expect(mock.lastContext?.state).toBe('suspended');
	});
});

test('a context auto-started while paused is suspended and queued audio plays on resume', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);
		const started: number[] = [];

		scheduleAt(value, makeNode(started), 2);
		expect(started).toEqual([]);

		// Chrome starts a blocked context on a later gesture even if the
		// Player is paused by then.
		act(() => {
			mock.lastContext?.setNativeState('running');
		});
		expect(mock.lastContext?.state).toBe('suspended');

		await act(async () => {
			await value.resume();
		});
		expect(started).toEqual([2]);
		expect(mock.lastContext?.state).toBe('running');
	});
});

test('resuming after a buffering pause resumes the native context again', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);

		await act(async () => {
			await value.resume();
		});
		mock.ops = [];

		await act(async () => {
			await value.suspend();
		});
		await act(async () => {
			value.resume();
			await Promise.resolve();
		});

		expect(nativeOps()).toEqual(['suspend', 'resume']);
		expect(mock.lastContext?.state).toBe('running');
	});
});

test('a node scheduled while parked starts once on the next resume', async () => {
	await withMockedAudioContext(async () => {
		const value = renderProvider(false);
		const started: number[] = [];

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

test('a rejected resume settles the wait as failed so playback mutes', async () => {
	await withMockedAudioContext(async () => {
		mock.rejectNativeResume = true;
		const value = renderProvider(false);

		const captured: {wait: Promise<unknown> | null} = {wait: null};
		await act(async () => {
			value.resume();
			captured.wait = value.getIsResumingAudioContext();
			await Promise.resolve();
		});

		expect(captured.wait).not.toBeNull();
		expect(await captured.wait).toBe('failed');
		expect(value.getIsResumingAudioContext()).toBeNull();
	});
});
