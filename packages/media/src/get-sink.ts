import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

const normalizeHeaders = (
	headers: HeadersInit | undefined,
): [string, string][] | null => {
	if (!headers) {
		return null;
	}

	const entries: [string, string][] = [];
	if (headers instanceof Headers) {
		headers.forEach((value, key) => {
			entries.push([key.toLowerCase(), value]);
		});
	} else if (Array.isArray(headers)) {
		for (const [key, value] of headers) {
			entries.push([key.toLowerCase(), value]);
		}
	} else {
		for (const [key, value] of Object.entries(headers)) {
			entries.push([key.toLowerCase(), value]);
		}
	}

	entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
	return entries;
};

const getRequestInitFingerprint = (requestInit: RequestInit | undefined) => {
	if (!requestInit) {
		return null;
	}

	return [
		requestInit.cache ?? null,
		requestInit.credentials ?? null,
		requestInit.integrity ?? null,
		requestInit.mode ?? null,
		requestInit.redirect ?? null,
		requestInit.referrer ?? null,
		requestInit.referrerPolicy ?? null,
		normalizeHeaders(requestInit.headers),
	];
};

export const getSinkCacheKey = ({
	src,
	credentials,
	requestInit,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	requestInit: RequestInit | undefined;
}) =>
	JSON.stringify([src, credentials, getRequestInitFingerprint(requestInit)]);

export const getSink = (
	src: string,
	logLevel: LogLevel,
	credentials: RequestCredentials | undefined,
	requestInit?: RequestInit,
) => {
	const cacheKey = getSinkCacheKey({src, credentials, requestInit});
	let promise = sinkPromises[cacheKey];
	if (!promise) {
		Internals.Log.verbose(
			{
				logLevel,
				tag: '@remotion/media',
			},
			`Sink for ${src} was not found, creating new sink`,
		);
		promise = getSinks(src, credentials, requestInit);
		sinkPromises[cacheKey] = promise;
	}

	return promise;
};
