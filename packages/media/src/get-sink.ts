import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

const requestInitIds = new WeakMap<RequestInit, number>();
let requestInitId = 0;

const getRequestInitKey = (requestInit: RequestInit | undefined) => {
	if (!requestInit) {
		return null;
	}

	const cachedId = requestInitIds.get(requestInit);
	if (cachedId !== undefined) {
		return cachedId;
	}

	requestInitId++;
	requestInitIds.set(requestInit, requestInitId);
	return requestInitId;
};

export const getSinkCacheKey = ({
	src,
	credentials,
	requestInit,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	requestInit: RequestInit | undefined;
}) => JSON.stringify([src, credentials, getRequestInitKey(requestInit)]);

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
