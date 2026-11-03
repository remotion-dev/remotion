import {afterEach, expect, test} from 'bun:test';
import {cancelRender, cancelRenderInternal} from '../cancel-render.js';
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

test('scoped promise cancellation preserves the original error without creating another rejection', async () => {
	const owner = scope();
	const cause = new Error('effect setup failed');
	const failure = new Error('effect failed', {cause});
	const reported: Error[] = [];
	owner.remotion_onCancelRender = (error) => reported.push(error);
	await expect(
		Promise.reject(failure).catch((error) =>
			cancelRenderInternal(owner, error),
		),
	).resolves.toBeUndefined();
	expect(reported).toEqual([failure]);
	expect(reported[0].cause).toBe(cause);
	expect(owner.remotion_cancelledError).toBeUndefined();
	expect(owner.remotion_cancelledErrorObject).toBeUndefined();
});

test('unhandled scoped cancellation and global cancellation retain their throw and renderer error state', () => {
	const unhandled = scope();
	expect(() => cancelRenderInternal(unhandled, 'scope failed')).toThrow(
		'scope failed',
	);
	expect(unhandled.remotion_cancelledErrorObject?.message).toBe('scope failed');
	const failure = new Error('global failed');
	expect(() => cancelRender(failure)).toThrow(failure);
	expect(window.remotion_cancelledErrorObject).toBe(failure);
	expect(window.remotion_cancelledError).toContain('global failed');
});

test('a scope owner failure is not swallowed', () => {
	const owner = scope();
	const ownerFailure = new Error('owner failed');
	owner.remotion_onCancelRender = () => {
		throw ownerFailure;
	};
	expect(() => cancelRenderInternal(owner, new Error('effect failed'))).toThrow(
		ownerFailure,
	);
});
