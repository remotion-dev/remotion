import type {IncomingMessage} from 'node:http';

export const validateSameOrigin = (req: IncomingMessage): void => {
	const {origin, host} = req.headers;

	if (typeof origin !== 'string') {
		if (req.method === 'GET' || req.method === 'HEAD') {
			return;
		}

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
