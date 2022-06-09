/*!
 * serve-static
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

import {IncomingMessage, ServerResponse} from 'http';
import {resolve} from 'path';
const send = require('send');

/**
 * @param {string} root
 * @param {object} [options]
 * @return {function}
 * @public
 */

export const serveStatic = (
	root: string,
	options: {
		cacheControl: true;
		dotfiles: 'allow';
		etag: true;
		extensions: false;
		fallthrough: false;
		immutable: false;
		index: false;
		lastModified: true;
		maxAge: 0;
		redirect: true;
	}
) => {
	if (!root) {
		throw new TypeError('root path required');
	}

	if (typeof root !== 'string') {
		throw new TypeError('root path must be a string');
	}

	// copy options object
	const opts = Object.create(options || null);

	// headers listener
	const {setHeaders} = opts;

	if (setHeaders && typeof setHeaders !== 'function') {
		throw new TypeError('option setHeaders must be function');
	}

	// setup options for send
	opts.maxage = opts.maxage || opts.maxAge || 0;
	opts.root = resolve(root);

	return function (req: IncomingMessage, res: ServerResponse) {
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			// method not allowed
			res.statusCode = 405;
			res.setHeader('Allow', 'GET, HEAD');
			res.setHeader('Content-Length', '0');
			res.end();
			return;
		}

		let path = new URL(req.url as string, 'http://localhost').pathname;

		// make sure redirect occurs at mount
		if (path === '/' && path.substr(-1) !== '/') {
			path = '';
		}

		// create send stream
		const stream = send(req, path, opts);

		// add directory handler
		stream.on('directory', () => {
			res.writeHead(500);
			res.write('Is a directory');
			res.end();
		});

		// add headers listener
		if (setHeaders) {
			stream.on('headers', setHeaders);
		}

		// forward errors
		stream.on('error', (err: Error) => {
			res.writeHead(500);
			res.write(err.toString());
			res.end();
		});

		// pipe
		stream.pipe(res);
	};
};
