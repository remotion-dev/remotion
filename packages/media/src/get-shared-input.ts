import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';
import {getDurationOrCompute} from './get-duration-or-compute';
import {getMaxSourceCacheSize} from './max-cache-size';
import {
	getMediaRequestInitFingerprint,
	normalizeMediaRequestInit,
	resolveRequestInit,
	type MediaRequestInit,
} from './request-init';

// A single mediabunny `Input` (backed by one `UrlSource`) is expensive to spin
// up for network media: on creation it must fetch and parse the container
// header, and its `UrlSource` keeps a byte cache + demuxer state that is warm
// only for that instance.
//
// Previously every `MediaPlayer` created its own `Input`, so mounting a new
// range (jump cut / play-range) meant a cold container re-parse and cold seek —
// which is exactly the loader that shows at each cut. Since all ranges of the
// same media share the same `src`, they can share ONE `Input`: the container is
// parsed once and subsequent seeks are served from the warm byte cache.
//
const getSharedInputCacheKey = ({
	src,
	credentials,
	requestInit,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	requestInit: MediaRequestInit | undefined;
}): string =>
	Internals.getMediabunnyInputResourceKey({
		src,
		credentials: credentials ?? null,
		requestInitFingerprint: getMediaRequestInitFingerprint(requestInit),
		revision: null,
	});

export const acquireSharedInput = ({
	src,
	credentials,
	requestInit,
	logLevel,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	requestInit: MediaRequestInit | undefined;
	logLevel: LogLevel;
}): {
	input: Input;
	getDuration: () => Promise<number>;
	release: () => void;
} => {
	const normalizedRequestInit = normalizeMediaRequestInit(requestInit);
	const cacheKey = getSharedInputCacheKey({
		src,
		credentials,
		requestInit: normalizedRequestInit,
	});

	const resolvedRequestInit = resolveRequestInit({
		credentials,
		requestInit: normalizedRequestInit,
	});
	const lease = Internals.globalMediaResourceManager.acquire<Input>({
		key: cacheKey,
		create: () => {
			const input = new Input({
				source: new UrlSource(src, {
					maxCacheSize: getMaxSourceCacheSize(logLevel),
					...(resolvedRequestInit
						? {requestInit: resolvedRequestInit}
						: undefined),
				}),
				formats: ALL_FORMATS,
			});

			return {resource: input, dispose: () => input.dispose()};
		},
	});

	return {
		input: lease.resource,
		getDuration: () =>
			lease.getOrCreateValue(Internals.MEDIABUNNY_DURATION_VALUE_KEY, () =>
				getDurationOrCompute(lease.resource),
			),
		release: lease.release,
	};
};
