import type {IncomingMessage, ServerResponse} from 'node:http';

const isLoopbackHttp = (url: URL) =>
	url.protocol === 'http:' &&
	(url.hostname === 'localhost' || url.hostname === '127.0.0.1');

export const getAllowedStudioProtocolOrigin = (
	origin: string | undefined,
): string | null => {
	if (!origin) {
		return null;
	}

	try {
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
	const origin = getAllowedStudioProtocolOrigin(request.headers.origin);
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
	const origin = getAllowedStudioProtocolOrigin(request.headers.origin);
	response.writeHead(origin === null ? 403 : 204);
	response.end();
	return Promise.resolve();
};
