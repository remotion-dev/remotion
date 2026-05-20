import {expect, test} from 'vitest';
import {getSinkCacheKey} from '../get-sink';
import {makeRequestInit} from '../request-init';

test('creates no RequestInit if no fetch options are set', () => {
	expect(makeRequestInit({credentials: undefined, fetchCache: undefined})).toBe(
		undefined,
	);
});

test('passes fetch cache and credentials to mediabunny', () => {
	expect(
		makeRequestInit({credentials: 'include', fetchCache: 'no-store'}),
	).toEqual({
		credentials: 'include',
		cache: 'no-store',
	});
});

test('uses fetch cache in the sink cache key', () => {
	const defaultKey = getSinkCacheKey({
		src: 'https://example.com/video.mp4',
		credentials: undefined,
		fetchCache: undefined,
	});
	const noStoreKey = getSinkCacheKey({
		src: 'https://example.com/video.mp4',
		credentials: undefined,
		fetchCache: 'no-store',
	});

	expect(noStoreKey).not.toBe(defaultKey);
});
