import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {getSinks} from './video-extraction/get-frames-since-keyframe';

export const sinkPromises: Record<string, Promise<GetSink>> = {};

export const getSinkCacheKey = ({
	src,
	credentials,
	fetchCache,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	fetchCache: RequestCache | undefined;
}) => JSON.stringify([src, credentials, fetchCache]);

export const getSink = (
	src: string,
	logLevel: LogLevel,
	credentials: RequestCredentials | undefined,
	fetchCache?: RequestCache,
) => {
	const cacheKey = getSinkCacheKey({src, credentials, fetchCache});
	let promise = sinkPromises[cacheKey];
	if (!promise) {
		Internals.Log.verbose(
			{
				logLevel,
				tag: '@remotion/media',
			},
			`Sink for ${src} was not found, creating new sink`,
		);
		promise = getSinks(src, credentials, fetchCache);
		sinkPromises[cacheKey] = promise;
	}

	return promise;
};
