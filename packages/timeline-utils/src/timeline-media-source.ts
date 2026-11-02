export type TimelineMediaSource = {
	readonly src: string;
	readonly cacheKey: string;
	readonly requestInit: RequestInit | null;
};

const requestKeys = new Map<string, Promise<string>>();

export const normalizeTimelineMediaSource = (
	source: string | TimelineMediaSource,
): TimelineMediaSource => {
	return typeof source === 'string'
		? {src: source, cacheKey: source, requestInit: null}
		: source;
};

export const getTimelineMediaSource = async ({
	src,
	requestInit,
}: {
	src: string;
	requestInit: RequestInit | null;
}): Promise<TimelineMediaSource> => {
	const {signal: _signal, headers, ...options} = requestInit ?? {};
	const headerEntries = Array.from(new Headers(headers).entries());
	if (Object.keys(options).length === 0 && headerEntries.length === 0) {
		return normalizeTimelineMediaSource(src);
	}

	const fingerprint = JSON.stringify([options, headerEntries]);
	let key = requestKeys.get(fingerprint);
	if (!key) {
		// Do not persist request headers or credentials in IndexedDB keys.
		key = crypto.subtle
			.digest('SHA-256', new TextEncoder().encode(fingerprint))
			.then((hash) =>
				Array.from(new Uint8Array(hash), (byte) =>
					byte.toString(16).padStart(2, '0'),
				).join(''),
			);
		requestKeys.set(fingerprint, key);
	}

	return {
		src,
		cacheKey: `${src}|request:${await key}`,
		requestInit: {...options, headers: headerEntries},
	};
};
