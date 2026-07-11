import type {IncomingMessage} from 'node:http';

export const REMOTION_STUDIO_AUTH_HEADER = 'x-remotion-studio-token';

const isLoopbackRemoteAddress = (
	remoteAddress: string | undefined,
): boolean => {
	return (
		remoteAddress === '127.0.0.1' ||
		remoteAddress === '::1' ||
		remoteAddress === '::ffff:127.0.0.1'
	);
};

export const validateLocalRequest = (req: IncomingMessage): void => {
	if (!isLoopbackRemoteAddress(req.socket.remoteAddress)) {
		throw new Error('Request from non-local address not allowed');
	}
};

export const validateStudioAuthToken = (
	req: IncomingMessage,
	studioAuthToken: string,
): void => {
	const authHeader = req.headers[REMOTION_STUDIO_AUTH_HEADER];
	if (typeof authHeader !== 'string' || authHeader !== studioAuthToken) {
		throw new Error('Invalid Studio authentication token');
	}
};

export const validateSameOrigin = (
	req: IncomingMessage,
	studioAuthToken?: string,
): void => {
	const {origin, host} = req.headers;
	validateLocalRequest(req);

	if (studioAuthToken) {
		validateStudioAuthToken(req, studioAuthToken);
	}

	if (typeof origin !== 'string') {
		throw new Error('Request without Origin header not allowed');
	}

	if (typeof host !== 'string') {
		throw new Error('Request without Host header not allowed');
	}

	let originUrl: URL;
	try {
		originUrl = new URL(origin);
	} catch {
		throw new Error('Request from different origin not allowed');
	}

	if (originUrl.origin !== `http://${host}`) {
		throw new Error('Request from different origin not allowed');
	}
};
