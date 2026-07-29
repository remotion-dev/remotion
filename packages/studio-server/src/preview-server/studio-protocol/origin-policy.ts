import type {IncomingMessage, ServerResponse} from 'node:http';

export const isAllowedStudioProtocolOrigin = (
	origin: string | undefined,
): boolean => {
	if (!origin) {
		return false;
	}

	try {
		const url = new URL(origin);
		return (
			(url.protocol === 'https:' &&
				(url.hostname === 'remotion.dev' ||
					url.hostname === 'www.remotion.dev')) ||
			(url.protocol === 'http:' &&
				(url.hostname === 'localhost' || url.hostname === '127.0.0.1'))
		);
	} catch {
		return false;
	}
};

export const setStudioProtocolCorsHeaders = ({
	request,
	response,
}: {
	readonly request: IncomingMessage;
	readonly response: ServerResponse;
}): void => {
	const {origin} = request.headers;
	if (typeof origin !== 'string' || !isAllowedStudioProtocolOrigin(origin)) {
		return;
	}

	response.setHeader('Access-Control-Allow-Origin', origin);
	response.setHeader('Vary', 'Origin');
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
	response.writeHead(
		isAllowedStudioProtocolOrigin(request.headers.origin) ? 204 : 403,
	);
	response.end();
	return Promise.resolve();
};
