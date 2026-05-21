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

test('structurally-equal requestInit objects produce the same cache key', () => {
	const a: RequestInit = {cache: 'no-store'};
	const b: RequestInit = {cache: 'no-store'};

	expect(
		getSinkCacheKey({
			src: 'https://example.com/video.mp4',
			credentials: undefined,
			requestInit: a,
		}),
	).toBe(
		getSinkCacheKey({
			src: 'https://example.com/video.mp4',
			credentials: undefined,
			requestInit: b,
		}),
	);
});

test('normalizes headers regardless of input shape and order', () => {
	const headersObject: RequestInit = {
		headers: {Authorization: 'Bearer x', 'X-Other': 'y'},
	};
	const headersArray: RequestInit = {
		headers: [
			['x-other', 'y'],
			['authorization', 'Bearer x'],
		],
	};
	const headersInstance: RequestInit = {
		headers: new Headers({Authorization: 'Bearer x', 'X-Other': 'y'}),
	};

	const key = (requestInit: RequestInit) =>
		getSinkCacheKey({
			src: 'https://example.com/video.mp4',
			credentials: undefined,
			requestInit,
		});

	expect(key(headersObject)).toBe(key(headersArray));
	expect(key(headersObject)).toBe(key(headersInstance));
});

test('requestInit.credentials wins over the deprecated credentials prop', () => {
	expect(
		resolveRequestInit({
			credentials: 'omit',
			requestInit: {credentials: 'include'},
		}),
	).toEqual({credentials: 'include'});
});
