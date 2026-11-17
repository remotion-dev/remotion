import type {DelayRenderScope} from 'remotion';
import {afterEach, expect, test, vi} from 'vitest';
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
	vi.useRealTimers();
	vi.unstubAllGlobals();
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
test('stored cancellation takes priority over readiness even if the only check is the deadline', async () => {
	vi.useFakeTimers();
	vi.stubGlobal('requestAnimationFrame', () => 1);
	const cancelFrame = vi.fn();
	vi.stubGlobal('cancelAnimationFrame', cancelFrame);
	const state = scope();
	state.remotion_renderReady = false;
	const waiting = wait(state, null);
	const failure = new Error('fatal before pending tick');
	const rejected = expect(waiting).rejects.toBe(failure);
	state.remotion_cancelledError = failure.stack!;
	state.remotion_cancelledErrorObject = failure;
	state.remotion_renderReady = true;
	await vi.advanceTimersByTimeAsync(33_000);
	await rejected;
	expect(cancelFrame).toHaveBeenCalledWith(1);
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
test('abort takes priority over stored cancellation and readiness before and during a wait', async () => {
	const state = scope();
	state.remotion_cancelledError = 'Error: renderer failure';
	const controller = new AbortController();
	controller.abort();
	await expect(wait(state, controller.signal)).rejects.toThrow(
		'renderStillOnWeb() was cancelled',
	);

	vi.useFakeTimers();
	vi.stubGlobal('requestAnimationFrame', () => 2);
	const cancelFrame = vi.fn();
	vi.stubGlobal('cancelAnimationFrame', cancelFrame);
	const pendingScope = scope();
	pendingScope.remotion_renderReady = false;
	const active = new AbortController();
	const pending = wait(pendingScope, active.signal);
	const rejected = expect(pending).rejects.toThrow(
		'renderStillOnWeb() was cancelled',
	);
	active.abort();
	await rejected;
	expect(cancelFrame).toHaveBeenCalledWith(2);
	expect(vi.getTimerCount()).toBe(0);
});
