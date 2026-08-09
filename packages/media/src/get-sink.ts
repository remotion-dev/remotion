import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {
	getMediaRequestInitFingerprint,
	normalizeMediaRequestInit,
	type MediaRequestInit,
} from './request-init';
import type {GetSink} from './video-extraction/get-frames-since-keyframe';
import {makeSinks} from './video-extraction/get-frames-since-keyframe';

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

export const makeSinkManager = () => {
	const sinkPromises: Record<string, Promise<GetSink>> = {};
	const inputDisposers: Record<string, () => void> = {};
	let disposed = false;

	return {
		getSink: (
			src: string,
			logLevel: LogLevel,
			credentials: RequestCredentials | undefined,
			requestInit: MediaRequestInit | undefined,
		) => {
			if (disposed) {
				return Promise.reject(
					new Error('Media cache has already been disposed'),
				);
			}

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
				const sinks = makeSinks(
					src,
					logLevel,
					credentials,
					normalizedRequestInit,
				);
				promise = sinks.promise;
				sinkPromises[cacheKey] = promise;
				inputDisposers[cacheKey] = sinks.dispose;
			}

			return promise;
		},
		dispose: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			let firstError: unknown = null;
			for (const cacheKey of Object.keys(inputDisposers)) {
				try {
					inputDisposers[cacheKey]();
				} catch (error) {
					firstError ??= error;
				} finally {
					delete inputDisposers[cacheKey];
					delete sinkPromises[cacheKey];
				}
			}

			if (firstError !== null) {
				throw firstError;
			}
		},
	};
};

export type SinkManager = ReturnType<typeof makeSinkManager>;
