export type MediaRequestInitOptions = {
	credentials: RequestCredentials | undefined;
	fetchCache: RequestCache | undefined;
};

export const makeRequestInit = ({
	credentials,
	fetchCache,
}: MediaRequestInitOptions): RequestInit | undefined => {
	const requestInit: RequestInit = {};

	if (credentials) {
		requestInit.credentials = credentials;
	}

	if (fetchCache) {
		requestInit.cache = fetchCache;
	}

	return Object.keys(requestInit).length === 0 ? undefined : requestInit;
};
