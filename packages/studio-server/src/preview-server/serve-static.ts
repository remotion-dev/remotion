/*!
 * serve-static
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

import {RenderInternals} from '@remotion/renderer';
import {createReadStream, existsSync, promises} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {getValueContentRangeHeader} from './dev-middleware/middleware';
import {parseRange} from './dev-middleware/range-parser';

export const serveStatic = async function ({
	root,
	path,
	req,
	res,
	allowOutsidePublicFolder,
}: {
	root: string;
	path: string;
	req: IncomingMessage;
	res: ServerResponse;
	allowOutsidePublicFolder: boolean;
}): Promise<void> {
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		// method not allowed
		res.statusCode = 405;
		res.setHeader('Allow', 'GET, HEAD');
		res.setHeader('Content-Length', '0');
		res.end();
		return;
	}

	if (!RenderInternals.isPathInside(path, root) && !allowOutsidePublicFolder) {
		res.writeHead(500);
		res.write('Not allowed to read');
		res.end();
		return;
	}

	const exists = existsSync(path);
	if (!exists) {
		res.writeHead(404);
		res.write(`${path} does not exist`);
		res.end();
		return;
	}

	const lstat = await promises.lstat(path);
	if (lstat.isSymbolicLink()) {
		const target = await promises.readlink(path);
		return serveStatic({
			path: target,
			root,
			req,
			res,
			allowOutsidePublicFolder: true,
		});
	}

	const isDirectory = lstat.isDirectory();

	if (isDirectory) {
		res.writeHead(500);
		res.write('Is a directory');
		res.end();
		return;
	}

	const hasRange = req.headers.range && lstat.size;
	if (!hasRange) {
		const readStream = createReadStream(path);
		res.setHeader(
			'content-type',
			RenderInternals.mimeLookup(path) || 'application/octet-stream',
		);
		res.setHeader('content-length', lstat.size);
		res.writeHead(200);
		readStream.pipe(res);
		return;
	}

	const range = parseRange(lstat.size, req.headers.range as string);

	if (typeof range === 'object' && range.type === 'bytes') {
		const {start, end} = range[0];

		res.setHeader(
			'content-type',
			RenderInternals.mimeLookup(path) || 'application/octet-stream',
		);
		res.setHeader(
			'content-range',
			getValueContentRangeHeader('bytes', lstat.size, {
				end,
				start,
			}),
		);
		res.setHeader('content-length', end - start + 1);

		res.writeHead(206);
		const readStream = createReadStream(path, {
			start,
			end,
		});
		readStream.pipe(res);
		return;
	}

	res.statusCode = 416;
	res.setHeader('Content-Range', `bytes */${lstat.size}`);
	res.end();
};
