export const serializeRequestInit = (
	requestInit: RequestInit | undefined,
): string | null => {
	if (!requestInit) {
		return null;
	}

	const requestInitWithoutSignal = {...requestInit};
	delete requestInitWithoutSignal.signal;
	const {headers, ...rest} = requestInitWithoutSignal;

	return JSON.stringify({
		...rest,
		headers: headers ? Array.from(new Headers(headers).entries()) : null,
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
