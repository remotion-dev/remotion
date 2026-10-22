import type {IncomingMessage, ServerResponse} from 'node:http';

const isLoopbackHttp = (url: URL) =>
	url.protocol === 'http:' &&
	(url.hostname === 'localhost' || url.hostname === '127.0.0.1');

export const getAllowedStudioProtocolOrigin = (
	request: IncomingMessage,
): string | null => {
	try {
		const {origin, referer, host} = request.headers;
		if (origin === undefined) {
			// Browsers omit Origin on same-origin GET requests. Only trust a
			// Referer matching this local HTTP Studio, never an arbitrary site.
			const refererUrl = new URL(referer ?? '');
			return isLoopbackHttp(refererUrl) &&
				refererUrl.origin === `http://${host}`
				? refererUrl.origin
				: null;
		}

		const url = new URL(origin);
		if (url.protocol !== 'https:' && !isLoopbackHttp(url)) {
			return null;
		}

		return url.origin;
	} catch {
		return null;
	}
};

export const setStudioProtocolCorsHeaders = ({
	request,
	response,
}: {
	readonly request: IncomingMessage;
	readonly response: ServerResponse;
}): void => {
	const origin = getAllowedStudioProtocolOrigin(request);
	if (origin === null) {
		return;
	}

	response.setHeader('Access-Control-Allow-Origin', origin);
	response.setHeader(
		'Vary',
		'Origin, Access-Control-Request-Headers, Access-Control-Request-Private-Network',
	);
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	response.setHeader('Access-Control-Max-Age', '600');
	response.setHeader('Access-Control-Allow-Private-Network', 'true');
};

export const handleStudioProtocolOptions = ({
	request,
	response,
}: {
	readonly request: IncomingMessage;
	readonly response: ServerResponse;
}): Promise<void> => {
	setStudioProtocolCorsHeaders({request, response});
	const origin = getAllowedStudioProtocolOrigin(request);
	response.writeHead(origin === null ? 403 : 204);
	response.end();
	return Promise.resolve();
};
