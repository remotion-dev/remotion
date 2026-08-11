export const normalizeRequestInit = (
	requestInit: RequestInit | undefined,
): RequestInit | undefined => {
	if (!requestInit) {
		return undefined;
	}

	const requestInitWithoutSignal = {...requestInit};
	delete requestInitWithoutSignal.signal;
	const {headers, ...rest} = requestInitWithoutSignal;

	return {
		...rest,
		headers: headers ? Array.from(new Headers(headers).entries()) : undefined,
	};
};

export const serializeRequestInit = (
	requestInit: RequestInit | undefined,
): string | null => {
	const normalizedRequestInit = normalizeRequestInit(requestInit);
	if (!normalizedRequestInit) {
		return null;
	}

	const {headers, ...rest} = normalizedRequestInit;
	return JSON.stringify({
		...rest,
		headers: headers ?? null,
	});
};

export const getGifCacheKey = ({
	resolvedSrc,
	requestInit,
}: {
	resolvedSrc: string;
	requestInit: RequestInit | undefined;
}) => {
	const requestInitKey = serializeRequestInit(requestInit);

	return requestInitKey === null
		? resolvedSrc
		: `${resolvedSrc}-${requestInitKey}`;
};
