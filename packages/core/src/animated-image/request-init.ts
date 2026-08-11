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
