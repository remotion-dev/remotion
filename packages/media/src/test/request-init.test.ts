import {expect, test} from 'vitest';
import {getSinkCacheKey} from '../get-sink';
import {
	normalizeMediaRequestInit,
	resolveRequestInit,
	type MediaRequestInit,
} from '../request-init';

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
	const a: MediaRequestInit = {cache: 'no-store'};
	const b: MediaRequestInit = {cache: 'no-store'};

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
	const headersObject: MediaRequestInit = {
		headers: {Authorization: 'Bearer x', 'X-Other': 'y'},
	};
	const headersArray: MediaRequestInit = {
		headers: [
			['x-other', 'y'],
			['authorization', 'Bearer x'],
		],
	};

	const key = (requestInit: MediaRequestInit) =>
		getSinkCacheKey({
			src: 'https://example.com/video.mp4',
			credentials: undefined,
			requestInit,
		});

	expect(key(headersObject)).toBe(key(headersArray));
});

test('normalizes a Headers instance to a clone-safe requestInit', () => {
	expect(
		normalizeMediaRequestInit({
			headers: new Headers({Authorization: 'Bearer x'}),
		} as unknown as MediaRequestInit),
	).toEqual({headers: [['authorization', 'Bearer x']]});
});

test('strips unsupported requestInit fields', () => {
	expect(
		normalizeMediaRequestInit({method: 'POST'} as unknown as MediaRequestInit),
	).toBe(undefined);
});

test('requestInit.credentials wins over the deprecated credentials prop', () => {
	expect(
		resolveRequestInit({
			credentials: 'omit',
			requestInit: {credentials: 'include'},
		}),
	).toEqual({credentials: 'include'});
});
