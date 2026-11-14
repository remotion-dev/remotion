import {afterEach, expect, test} from 'bun:test';
import {
	cancelRender,
	cancelRenderInternal,
	reportRenderErrorInternal,
} from '../cancel-render.js';
import type {DelayRenderScope} from '../delay-render.js';

const scope = (): DelayRenderScope => ({
	remotion_renderReady: true,
	remotion_delayRenderHandles: [],
	remotion_delayRenderTimeouts: {},
	remotion_puppeteerTimeout: 30000,
	remotion_attempt: 1,
});

afterEach(() => {
	delete window.remotion_cancelledError;
	delete window.remotion_cancelledErrorObject;
});

test('owned promise cancellation notifies its owner and rejects with the original error', async () => {
	const owner = scope();
	const cause = new Error('effect setup failed');
	const failure = new Error('effect failed', {cause});
	const reported: Error[] = [];
	const onCancel = (error: Error) => reported.push(error);
	await expect(
		Promise.reject(failure).catch((error) =>
			cancelRenderInternal(owner, error, onCancel),
		),
	).rejects.toBe(failure);
	expect(reported).toEqual([failure]);
	expect(reported[0].cause).toBe(cause);
	expect(owner.remotion_cancelledError).toBeUndefined();
	expect(owner.remotion_cancelledErrorObject).toBeUndefined();
});

test('unhandled scoped cancellation and global cancellation retain their throw and renderer error state', () => {
	const unhandled = scope();
	expect(() => cancelRenderInternal(unhandled, 'scope failed', null)).toThrow(
		'scope failed',
	);
	expect(unhandled.remotion_cancelledErrorObject?.message).toBe('scope failed');
	const failure = new Error('global failed');
	expect(() => cancelRender(failure)).toThrow(failure);
	expect(window.remotion_cancelledErrorObject).toBe(failure);
	expect(window.remotion_cancelledError).toContain('global failed');
});

test('a cancellation owner failure is not swallowed', () => {
	const failure = new Error('effect failed');
	const ownerFailure = new Error('owner failed');
	expect(() =>
		cancelRenderInternal(scope(), failure, () => {
			throw ownerFailure;
		}),
	).toThrow(ownerFailure);
});

test('code after an owned cancellation is unreachable', () => {
	let continued = false;
	const failure = new Error('stop');
	expect(() => {
		cancelRenderInternal(scope(), failure, () => undefined);
		continued = true;
	}).toThrow(failure);
	expect(continued).toBe(false);
});

test('a terminal owned async reporter resolves after delivering the original error and cause', async () => {
	const renderer = scope();
	const cause = new Error('setup cause');
	const failure = new Error('terminal runtime failure', {cause});
	const reported: Error[] = [];
	const owner = (error: Error) => {
		reported.push(error);
	};

	await expect(
		Promise.reject(failure).catch((error) =>
			reportRenderErrorInternal(renderer, error, owner),
		),
	).resolves.toBeUndefined();
	expect(reported).toEqual([failure]);
	expect(reported[0].cause).toBe(cause);
	expect(renderer.remotion_cancelledErrorObject).toBeUndefined();
	await expect(
		Promise.reject(failure).catch((error) =>
			cancelRenderInternal(renderer, error, owner),
		),
	).rejects.toBe(failure);
	expect(reported).toEqual([failure, failure]);
});

test('the terminal reporter retains unowned renderer throwing and normalization', () => {
	const renderer = scope();
	const failure = new Error('renderer terminal');
	expect(() => reportRenderErrorInternal(renderer, failure, null)).toThrow(
		failure,
	);
	expect(renderer.remotion_cancelledErrorObject).toBe(failure);
	expect(renderer.remotion_cancelledError).toContain('renderer terminal');
	expect(() => reportRenderErrorInternal(undefined, failure, null)).toThrow(
		failure,
	);
	const reported: Error[] = [];
	reportRenderErrorInternal(renderer, 'normalized terminal', (error) => {
		reported.push(error);
	});
	expect(reported[0]).toBeInstanceOf(Error);
	expect(reported[0].message).toBe('normalized terminal');
});

test('an owned terminal reporter never suppresses a failing owner callback', async () => {
	const ownerFailure = new Error('reporter failed');
	await expect(
		Promise.reject(new Error('runtime failure')).catch((error) =>
			reportRenderErrorInternal(scope(), error, () => {
				throw ownerFailure;
			}),
		),
	).rejects.toBe(ownerFailure);
});
