import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {getSink, sinkPromises} from '../get-sink';
import {getRequestInit} from '../helpers/get-request-init';
import {getSinks} from '../video-extraction/get-frames-since-keyframe';

vi.mock('../video-extraction/get-frames-since-keyframe', () => ({
	getSinks: vi.fn(),
}));

type MockedGetSinks = ReturnType<typeof vi.fn<typeof getSinks>>;
const mockedGetSinks = getSinks as unknown as MockedGetSinks;

const clearSinkPromises = () => {
	for (const key of Object.keys(sinkPromises)) {
		delete sinkPromises[key];
	}
};

beforeEach(() => {
	mockedGetSinks.mockReset();
	clearSinkPromises();
});

afterEach(() => {
	clearSinkPromises();
});

test('getRequestInit returns expected RequestInit values', () => {
	expect(getRequestInit({crossOrigin: undefined})).toBeUndefined();
	expect(getRequestInit({crossOrigin: ''})).toBeUndefined();
	expect(getRequestInit({crossOrigin: 'anonymous'})).toEqual({
		mode: 'cors',
		credentials: 'omit',
	});
	expect(getRequestInit({crossOrigin: 'use-credentials'})).toEqual({
		mode: 'cors',
		credentials: 'include',
	});
});

test('getSink caches sinks separately by crossOrigin value', async () => {
	mockedGetSinks.mockImplementation((src, crossOrigin) =>
		Promise.resolve({src, crossOrigin} as never),
	);

	const defaultSink = getSink({
		src: 'video.mp4',
		logLevel: 'info',
		crossOrigin: undefined,
	});
	const sameDefaultSink = getSink({
		src: 'video.mp4',
		logLevel: 'info',
		crossOrigin: undefined,
	});

	expect(mockedGetSinks).toHaveBeenCalledTimes(1);
	expect(defaultSink).toBe(sameDefaultSink);

	const anonymousSink = getSink({
		src: 'video.mp4',
		logLevel: 'info',
		crossOrigin: 'anonymous',
	});

	expect(mockedGetSinks).toHaveBeenCalledTimes(2);
	expect(anonymousSink).not.toBe(defaultSink);

	const credentialedSink = getSink({
		src: 'video.mp4',
		logLevel: 'info',
		crossOrigin: 'use-credentials',
	});

	expect(mockedGetSinks).toHaveBeenCalledTimes(3);
	expect(credentialedSink).not.toBe(anonymousSink);

	expect(Object.keys(sinkPromises).length).toBe(3);
});
