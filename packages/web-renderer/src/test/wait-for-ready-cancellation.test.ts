import type {DelayRenderScope} from 'remotion';
import {afterEach, expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {waitForReady} from '../wait-for-ready';
const scope = (): DelayRenderScope => ({
	remotion_renderReady: true,
	remotion_delayRenderHandles: [],
	remotion_delayRenderTimeouts: {},
	remotion_puppeteerTimeout: 30000,
	remotion_attempt: 1,
});
const wait = (state: DelayRenderScope, signal: AbortSignal | null) =>
	waitForReady({
		timeoutInMilliseconds: 30000,
		scope: state,
		signal,
		apiName: 'renderStillOnWeb',
		internalState: null,
		keepalive: null,
	});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});
test('stored cancellation rejects an already-ready wait with the original error and cause', async () => {
	const state = scope();
	const failure = new Error('fatal before wait', {
		cause: new Error('original cause'),
	});
	state.remotion_cancelledError = failure.stack!;
	state.remotion_cancelledErrorObject = failure;
	await expect(wait(state, null)).rejects.toBe(failure);
});
test('a defined empty legacy cancellation stack takes priority over readiness', async () => {
	const state = scope();
	state.remotion_cancelledError = '';
	await expect(wait(state, null)).rejects.toMatchObject({
		message: '',
		stack: '',
	});
});
test('a cancellation observed while waiting takes priority over a simultaneous ready transition', async () => {
	const ticks: FrameRequestCallback[] = [];
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		ticks.push(callback);
		return ticks.length;
	});
	const state = scope();
	state.remotion_renderReady = false;
	const waiting = wait(state, null);
	const failure = new Error('fatal before pending tick');
	state.remotion_cancelledError = failure.stack!;
	state.remotion_cancelledErrorObject = failure;
	state.remotion_renderReady = true;
	ticks.splice(0).forEach((callback) => callback(performance.now()));
	await expect(waiting).rejects.toBe(failure);
});
test('ordinary ready waits resolve and later cancellation does not undo a completed wait', async () => {
	const state = scope();
	const completed = wait(state, null);
	await expect(completed).resolves.toBeUndefined();
	const failure = new Error('later cancellation');
	state.remotion_cancelledError = failure.stack!;
	state.remotion_cancelledErrorObject = failure;
	await expect(completed).resolves.toBeUndefined();
	await expect(wait(state, null)).rejects.toBe(failure);
});
test('an already-aborted signal retains priority over stored cancellation and readiness', async () => {
	const state = scope();
	state.remotion_cancelledError = 'Error: renderer failure';
	const controller = new AbortController();
	controller.abort();
	await expect(wait(state, controller.signal)).rejects.toThrow(
		'renderStillOnWeb() was cancelled',
	);
});

const mockFrames = () => {
	const pending = new Map<number, FrameRequestCallback>();
	let id = 0;
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		pending.set(++id, callback);
		return id;
	});
	const cancel = vi.fn((handle: number) => pending.delete(handle));
	vi.stubGlobal('cancelAnimationFrame', cancel);
	const flush = () => {
		const callbacks = [...pending.values()];
		pending.clear();
		for (const callback of callbacks) callback(performance.now());
	};

	return {pending, cancel, flush};
};

test.for([
	'renderStillOnWeb',
	'renderFramesOnWeb',
	'renderMediaOnWeb',
] as const)(
	'aborts a pending %s readiness wait without an animation frame',
	async (apiName) => {
		const frames = mockFrames();
		const controller = new AbortController();
		const state = scope();
		state.remotion_renderReady = false;
		const observed = vi.fn();
		const waiting = waitForReady({
			timeoutInMilliseconds: 30000,
			scope: state,
			signal: controller.signal,
			apiName,
			internalState: null,
			keepalive: null,
		}).then(
			() => observed(null),
			(error: Error) => observed(error),
		);
		try {
			controller.abort();
			await Promise.resolve();
			expect(observed).toHaveBeenCalledTimes(1);
			expect(observed.mock.calls[0][0]).toMatchObject({
				message: `${apiName}() was cancelled`,
			});
			expect(frames.pending.size).toBe(0);
			expect(frames.cancel).toHaveBeenCalledTimes(1);
		} finally {
			frames.flush();
			await waiting;
		}
	},
);

test('removes the abort listener when a pending wait becomes ready', async () => {
	const frames = mockFrames();
	const controller = new AbortController();
	const add = vi.spyOn(controller.signal, 'addEventListener');
	const remove = vi.spyOn(controller.signal, 'removeEventListener');
	const state = scope();
	state.remotion_renderReady = false;
	const waiting = wait(state, controller.signal);
	state.remotion_renderReady = true;
	frames.flush();
	await waiting;
	expect(add).toHaveBeenCalledTimes(1);
	expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0][1]);
	controller.abort();
	await expect(waiting).resolves.toBeUndefined();
});

test('worker ticks retain only one pending animation frame and release it on completion', async () => {
	const frames = mockFrames();
	let tick: (() => void) | null = null;
	const keepalive = {
		waitForTick: () =>
			new Promise<void>((resolve) => {
				tick = resolve;
			}),
		[Symbol.dispose]: () => {},
	};
	const state = scope();
	state.remotion_renderReady = false;
	const waiting = waitForReady({
		timeoutInMilliseconds: 30000,
		scope: state,
		signal: null,
		apiName: 'renderMediaOnWeb',
		internalState: null,
		keepalive,
	});
	try {
		for (let i = 0; i < 60; i++) {
			tick!();
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
			expect(frames.pending.size).toBe(1);
		}

		state.remotion_renderReady = true;
		tick!();
		await waiting;
		expect(frames.pending.size).toBe(0);
	} finally {
		state.remotion_renderReady = true;
		tick!();
		frames.flush();
		await waiting;
	}
});

test('aborting one pending scope preserves another scope readiness wait', async () => {
	const frames = mockFrames();
	const first = new AbortController();
	const second = new AbortController();
	const firstState = scope();
	const secondState = scope();
	firstState.remotion_renderReady = false;
	secondState.remotion_renderReady = false;
	const observed = vi.fn();
	const a = wait(firstState, first.signal).catch((error: Error) =>
		observed(error.message),
	);
	const b = wait(secondState, second.signal).then(() =>
		observed('second ready'),
	);
	try {
		first.abort();
		await Promise.resolve();
		expect(observed).toHaveBeenCalledWith('renderStillOnWeb() was cancelled');
		expect(frames.pending.size).toBe(1);
		secondState.remotion_renderReady = true;
		frames.flush();
		await b;
		expect(observed).toHaveBeenCalledWith('second ready');
	} finally {
		secondState.remotion_renderReady = true;
		frames.flush();
		await Promise.all([a, b]);
	}
});
