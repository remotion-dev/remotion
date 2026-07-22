import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
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
// The Input is reference counted: `acquireSharedInput` hands out the cached
// Input and bumps a count; `releaseSharedInput` decrements it and only disposes
// (and evicts) the Input once the last holder releases it. This mirrors the
// sink cache in `get-sink.ts`, but for the preview `MediaPlayer` path.

type SharedInputEntry = {
	input: Input;
	refCount: number;
};

const sharedInputs: Record<string, SharedInputEntry> = {};

const getSharedInputCacheKey = ({
	src,
	credentials,
	requestInit,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	requestInit: MediaRequestInit | undefined;
}): string =>
	JSON.stringify([
		src,
		credentials ?? null,
		getMediaRequestInitFingerprint(requestInit),
	]);

export const acquireSharedInput = ({
	src,
	credentials,
	requestInit,
}: {
	src: string;
	credentials: RequestCredentials | undefined;
	requestInit: MediaRequestInit | undefined;
}): {input: Input; cacheKey: string} => {
	const normalizedRequestInit = normalizeMediaRequestInit(requestInit);
	const cacheKey = getSharedInputCacheKey({
		src,
		credentials,
		requestInit: normalizedRequestInit,
	});

	const existing = sharedInputs[cacheKey];
	if (existing) {
		existing.refCount++;
		return {input: existing.input, cacheKey};
	}

	const resolvedRequestInit = resolveRequestInit({
		credentials,
		requestInit: normalizedRequestInit,
	});
	const input = new Input({
		source: new UrlSource(
			src,
			resolvedRequestInit ? {requestInit: resolvedRequestInit} : undefined,
		),
		formats: ALL_FORMATS,
	});

	sharedInputs[cacheKey] = {input, refCount: 1};
	return {input, cacheKey};
};

export const releaseSharedInput = (cacheKey: string): void => {
	const entry = sharedInputs[cacheKey];
	if (!entry) {
		return;
	}

	entry.refCount--;
	if (entry.refCount <= 0) {
		delete sharedInputs[cacheKey];
		entry.input.dispose();
	}
};
