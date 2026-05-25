export type MediaHeadersInit = Record<string, string> | [string, string][];

export type MediaRequestInit = {
	cache?: RequestCache;
	credentials?: RequestCredentials;
	headers?: MediaHeadersInit;
	integrity?: string;
	mode?: RequestMode;
	redirect?: RequestRedirect;
	referrer?: string;
	referrerPolicy?: ReferrerPolicy;
};

export type MediaRequestInitOptions = {
	credentials: RequestCredentials | undefined;
	requestInit: MediaRequestInit | undefined;
};

export const normalizeMediaHeaders = (
	headers: HeadersInit | undefined,
): [string, string][] | undefined => {
	if (!headers) {
		return undefined;
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

export const normalizeMediaRequestInit = (
	requestInit: MediaRequestInit | undefined,
): MediaRequestInit | undefined => {
	if (!requestInit) {
		return undefined;
	}

	const headers = normalizeMediaHeaders(requestInit.headers);

	const normalized: MediaRequestInit = {
		...(requestInit.cache === undefined ? null : {cache: requestInit.cache}),
		...(requestInit.credentials === undefined
			? null
			: {credentials: requestInit.credentials}),
		...(headers === undefined ? null : {headers}),
		...(requestInit.integrity === undefined
			? null
			: {integrity: requestInit.integrity}),
		...(requestInit.mode === undefined ? null : {mode: requestInit.mode}),
		...(requestInit.redirect === undefined
			? null
			: {redirect: requestInit.redirect}),
		...(requestInit.referrer === undefined
			? null
			: {referrer: requestInit.referrer}),
		...(requestInit.referrerPolicy === undefined
			? null
			: {referrerPolicy: requestInit.referrerPolicy}),
	};

	return Object.keys(normalized).length === 0 ? undefined : normalized;
};

export const getMediaRequestInitFingerprint = (
	requestInit: MediaRequestInit | undefined,
) => {
	const normalized = normalizeMediaRequestInit(requestInit);

	if (!normalized) {
		return null;
	}

	return [
		normalized.cache ?? null,
		normalized.credentials ?? null,
		normalized.integrity ?? null,
		normalized.mode ?? null,
		normalized.redirect ?? null,
		normalized.referrer ?? null,
		normalized.referrerPolicy ?? null,
		normalized.headers ?? null,
	];
};

export const resolveRequestInit = ({
	credentials,
	requestInit,
}: MediaRequestInitOptions): MediaRequestInit | undefined => {
	if (credentials === undefined) {
		return normalizeMediaRequestInit(requestInit);
	}

	return normalizeMediaRequestInit({
		credentials,
		...requestInit,
	});
};
