/*!
 * serve-static
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

import {createReadStream, existsSync, promises} from 'fs';
import {IncomingMessage, ServerResponse} from 'http';
import mime from 'mime-types';
import {parseRange} from './dev-middleware/range-parser';

export const serveStatic = async function (
	req: IncomingMessage,
	res: ServerResponse
) {
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

	const exists = existsSync(path);
	if (!exists) {
		res.writeHead(404);
		res.write('Not found');
		res.end();
		return;
	}

	const lstat = await promises.lstat(path);
	const isDirectory = lstat.isDirectory();

	if (isDirectory) {
		res.writeHead(500);
		res.write('Is a directory');
		res.end();
		return;
	}

	const hasRange = req.headers.range && lstat.size;
	if (!hasRange) {
		res.setHeader(
			'content-type',
			mime.lookup(path) || 'application/octet-stream'
		);
		res.writeHead(200);
		const readStream = createReadStream(path);
		readStream.pipe(res);
		return;
	}

	const range = parseRange(lstat.size, req.headers.range as string);

	if (typeof range === 'object' && range.type === 'bytes') {
		const {start, end} = range[0];

		res.writeHead(206);

		const readStream = createReadStream(path, {
			start,
			end,
		});
		readStream.pipe(res);
	} else {
		res.statusCode = 416;
		res.setHeader('Content-Range', `bytes */${lstat.size}`);
		res.end();
	}
};
