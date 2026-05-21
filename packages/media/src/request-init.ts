export type MediaRequestInitOptions = {
	credentials: RequestCredentials | undefined;
	requestInit: RequestInit | undefined;
};

export const resolveRequestInit = ({
	credentials,
	requestInit,
}: MediaRequestInitOptions): RequestInit | undefined => {
	if (credentials === undefined) {
		return requestInit;
	}

	return {
		credentials,
		...requestInit,
	};
};
