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
	waitForReady(
		{
			timeoutInMilliseconds: 30000,
			scope: state,
			signal,
			apiName: 'renderStillOnWeb',
			internalState: null,
			keepalive: null,
		},
		null,
	);
afterEach(() => vi.unstubAllGlobals());
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
