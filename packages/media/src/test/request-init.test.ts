import {expect, test} from 'vitest';
import {getSinkCacheKey} from '../get-sink';
import {resolveRequestInit} from '../request-init';

test('creates no RequestInit if no fetch options are set', () => {
	expect(
		resolveRequestInit({credentials: undefined, requestInit: undefined}),
	).toBe(undefined);
});

test('uses requestInit in the sink cache key', () => {
	const requestInit = {cache: 'no-store'} as const;
	const defaultKey = getSinkCacheKey({
		src: 'https://example.com/video.mp4',
		credentials: undefined,
		requestInit: undefined,
	});
	const noStoreKey = getSinkCacheKey({
		src: 'https://example.com/video.mp4',
		credentials: undefined,
		requestInit,
	});

	expect(noStoreKey).not.toBe(defaultKey);
});
