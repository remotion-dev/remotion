import type {IncomingMessage} from 'node:http';

export const validateSameOrigin = (req: IncomingMessage): void => {
	const {origin, host} = req.headers;
	if (origin) {
		const originUrl = new URL(origin);
		if (originUrl.host !== host) {
			throw new Error('Request from different origin not allowed');
		}
	}
};
