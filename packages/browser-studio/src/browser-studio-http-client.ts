type BrowserStudioHttpResponse = {
	body: Buffer;
	headers: Record<string, string>;
	status: number;
};

export const makeBrowserStudioHttpClient = ({
	fetchImplementation,
}: {
	fetchImplementation: (
		input: RequestInfo | URL,
		init?: RequestInit,
	) => Promise<Response>;
}) => {
	const responseCache = new Map<string, Promise<BrowserStudioHttpResponse>>();

	return (url: string, headers: Record<string, string>) => {
		const cacheKey = JSON.stringify([
			url,
			Object.entries(headers).sort(([left], [right]) =>
				left.localeCompare(right),
			),
		]);
		const cached = responseCache.get(cacheKey);
		if (cached) {
			return cached;
		}

		const responsePromise = fetchImplementation(url, {headers})
			.then(async (response) => {
				const responseHeaders: Record<string, string> = {};
				response.headers.forEach((value, key) => {
					responseHeaders[key] = value;
				});

				return {
					body: new Uint8Array(
						await response.arrayBuffer(),
					) as unknown as Buffer,
					headers: responseHeaders,
					status: response.status,
				};
			})
			.catch((error: unknown) => {
				responseCache.delete(cacheKey);
				throw error;
			});
		responseCache.set(cacheKey, responsePromise);
		return responsePromise;
	};
};
