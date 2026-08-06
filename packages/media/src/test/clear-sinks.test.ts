import {expect, test} from 'vitest';
import {clearSinks, getSinkCacheKey, sinkPromises} from '../get-sink';
import type {GetSink} from '../video-extraction/get-frames-since-keyframe';

const makeFakeSink = () => {
	let disposed = 0;
	const sink = {
		getVideo: () => Promise.resolve('no-video-track' as const),
		getAudio: () => Promise.resolve('no-audio-track' as const),
		actualMatroskaTimestamps: null,
		isMatroska: false,
		getDuration: () => Promise.resolve(0),
		dispose: () => {
			disposed++;
		},
	} as unknown as GetSink;

	return {
		sink,
		getDisposeCount: () => disposed,
	};
};

const cacheKeyFor = (src: string) =>
	getSinkCacheKey({src, credentials: undefined, requestInit: undefined});

test('clearSinks() disposes every cached sink and empties the cache', async () => {
	const first = makeFakeSink();
	const second = makeFakeSink();

	sinkPromises[cacheKeyFor('first.mp4')] = Promise.resolve(first.sink);
	sinkPromises[cacheKeyFor('second.mp4')] = Promise.resolve(second.sink);

	await clearSinks('info');

	expect(first.getDisposeCount()).toBe(1);
	expect(second.getDisposeCount()).toBe(1);
	expect(Object.keys(sinkPromises)).toHaveLength(0);
});

test('clearSinks() does not reject when a cached sink failed to open', async () => {
	const healthy = makeFakeSink();

	sinkPromises[cacheKeyFor('healthy.mp4')] = Promise.resolve(healthy.sink);
	// A sink that never opened (e.g. a 404) must not stop the others from
	// being released, and must not surface as an unhandled rejection.
	sinkPromises[cacheKeyFor('broken.mp4')] = Promise.reject(
		new Error('could not open'),
	);

	await expect(clearSinks('info')).resolves.toBeUndefined();

	expect(healthy.getDisposeCount()).toBe(1);
	expect(Object.keys(sinkPromises)).toHaveLength(0);
});

test('clearSinks() is a no-op when nothing is cached', async () => {
	await expect(clearSinks('info')).resolves.toBeUndefined();
	expect(Object.keys(sinkPromises)).toHaveLength(0);
});
