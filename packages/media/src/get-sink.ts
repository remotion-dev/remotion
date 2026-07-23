import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {
	getMediaRequestInitFingerprint,
	normalizeMediaRequestInit,
	type MediaRequestInit,
} from './request-init';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

export const getSinkCacheKey = ({
	src,
	credentials,
	requestInit,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	requestInit: MediaRequestInit | undefined;
}) =>
	JSON.stringify([
		src,
		credentials,
		getMediaRequestInitFingerprint(requestInit),
	]);

export const getSink = (
	src: string,
	logLevel: LogLevel,
	credentials: RequestCredentials | undefined,
	requestInit: MediaRequestInit | undefined,
) => {
	const normalizedRequestInit = normalizeMediaRequestInit(requestInit);
	const cacheKey = getSinkCacheKey({
		src,
		credentials,
		requestInit: normalizedRequestInit,
	});
	let promise = sinkPromises[cacheKey];
	if (!promise) {
		Internals.Log.verbose(
			{
				logLevel,
				tag: '@remotion/media',
			},
			`Sink for ${src} was not found, creating new sink`,
		);
		promise = getSinks(src, logLevel, credentials, normalizedRequestInit);
		sinkPromises[cacheKey] = promise;
	}

	return promise;
};
