import type {IncomingMessage} from 'node:http';
import {isIP} from 'node:net';
import {hostname} from 'node:os';

export const validateHost = (request: IncomingMessage): void => {
	const {host} = request.headers;
	if (typeof host !== 'string' || /[\\/\s@?#]/.test(host)) {
		throw new Error('Request host not allowed');
	}

	let url: URL;
	try {
		url = new URL(`http://${host}`);
	} catch {
		throw new Error('Request host not allowed');
	}

	const name = url.hostname;
	if (
		name === 'localhost' ||
		name.endsWith('.localhost') ||
		name === hostname().toLowerCase() ||
		isIP(name.replace(/^\[|\]$/g, '')) !== 0
	) {
		return;
	}

	throw new Error('Request host not allowed');
};
