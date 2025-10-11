// Native
import type {Stats} from 'node:fs';
import {createReadStream, promises} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path from 'node:path';
import {mimeContentType} from '../mime-types';
// Packages
import {isPathInside} from './is-path-inside';
import {rangeParser} from './range-parser';

const getHeaders = (absolutePath: string, stats: Stats | null) => {
	const {base} = path.parse(absolutePath);

	let defaultHeaders: Record<string, string> = {};

	if (stats) {
		defaultHeaders = {
			'Content-Length': String(stats.size),
			'Accept-Ranges': 'bytes',
		};

		defaultHeaders['Last-Modified'] = stats.mtime.toUTCString();

		const _contentType = mimeContentType(base);

		if (_contentType) {
			defaultHeaders['Content-Type'] = _contentType;
		}
	}

	return defaultHeaders;
};

const getPossiblePaths = (relativePath: string, extension: string) =>
	[
		path.join(relativePath, `index${extension}`),
		relativePath.endsWith('/')
			? relativePath.replace(/\/$/g, extension)
			: relativePath + extension,
	].filter((item) => path.basename(item) !== extension);

const findRelated = async (current: string, relativePath: string) => {
	const possible = getPossiblePaths(relativePath, '.html');

	let stats = null;

	for (let index = 0; index < possible.length; index++) {
		const related = possible[index];
		const absolutePath = path.join(current, related);

		try {
			stats = await promises.lstat(absolutePath);
		} catch (err) {
			if (
				(err as {code: string}).code !== 'ENOENT' &&
				(err as {code: string}).code !== 'ENOTDIR'
			) {
				throw err;
			}
		}

		if (stats) {
			return {
				stats,
				absolutePath,
			};
		}
	}

	return null;
};

const sendError = (
	absolutePath: string,
	response: ServerResponse,
	spec: {
		statusCode: number;
		code: string;
		message: string;
	},
) => {
	const {message, statusCode} = spec;

	const headers = getHeaders(absolutePath, null);

	response.writeHead(statusCode, {
		...headers,
		'Content-Type': 'application/json',
	});
	response.end(JSON.stringify({statusCode, message}));
};

const internalError = (absolutePath: string, response: ServerResponse) => {
	return sendError(absolutePath, response, {
		statusCode: 500,
		code: 'internal_server_error',
		message: 'A server error has occurred',
	});
};

export const serveHandler = async (
	request: IncomingMessage,
	response: ServerResponse,
	config: {
		public: string;
	},
) => {
	const cwd = process.cwd();
	const current = path.resolve(cwd, config.public);

	let relativePath = null;

	try {
		const parsedUrl = new URL(
			request.url as string,
			`http://${request.headers.host}`,
		);
		relativePath = decodeURIComponent(parsedUrl.pathname);
	} catch {
		return sendError('/', response, {
			statusCode: 400,
			code: 'bad_request',
			message: 'Bad Request',
		});
	}

	let absolutePath = path.join(current, relativePath);

	// Prevent path traversal vulnerabilities. We could do this
	// by ourselves, but using the package covers all the edge cases.
	if (!isPathInside(absolutePath, current)) {
		return sendError(absolutePath, response, {
			statusCode: 400,
			code: 'bad_request',
			message: 'Bad Request',
		});
	}

	let stats = null;

	// It's extremely important that we're doing multiple stat calls. This one
	// right here could technically be removed, but then the program
	// would be slower. Because for directories, we always want to see if a related file
	// exists and then (after that), fetch the directory itself if no
	// related file was found. However (for files, of which most have extensions), we should
	// always stat right away.
	//
	// When simulating a file system without directory indexes, calculating whether a
	// directory exists requires loading all the file paths and then checking if
	// one of them includes the path of the directory. As that's a very
	// performance-expensive thing to do, we need to ensure it's not happening if not really necessary.

	if (path.extname(relativePath) !== '') {
		try {
			stats = await promises.lstat(absolutePath);
		} catch (err) {
			if (
				(err as {code: string}).code !== 'ENOENT' &&
				(err as {code: string}).code !== 'ENOTDIR'
			) {
				return internalError(absolutePath, response);
			}
		}
	}

	if (!stats) {
		try {
			const related = await findRelated(current, relativePath);

			if (related) {
				stats = related.stats;
				absolutePath = related.absolutePath;
			}
		} catch (err) {
			if (
				(err as {code: string}).code !== 'ENOENT' &&
				(err as {code: string}).code !== 'ENOTDIR'
			) {
				return internalError(absolutePath, response);
			}
		}

		try {
			stats = await promises.lstat(absolutePath);
		} catch (err) {
			if (
				(err as {code: string}).code !== 'ENOENT' &&
				(err as {code: string}).code !== 'ENOTDIR'
			) {
				return internalError(absolutePath, response);
			}
		}
	}

	if (stats?.isDirectory()) {
		const directory = null;
		const singleFile = null;

		if (directory) {
			const _contentType = 'text/html; charset=utf-8';

			response.statusCode = 200;
			response.setHeader('Content-Type', _contentType);
			response.end('Is a directory');

			return;
		}

		if (!singleFile) {
			// The directory listing is disabled, so we want to
			// render a 404 error.
			stats = null;
		}
	}

	const isSymLink = stats?.isSymbolicLink();

	// There are two scenarios in which we want to reply with
	// a 404 error: Either the path does not exist, or it is a
	// symlink while the `symlinks` option is disabled (which it is by default).
	if (!stats || isSymLink) {
		// allow for custom 404 handling
		return sendError(absolutePath, response, {
			statusCode: 404,
			code: 'not_found',
			message: 'The requested path (' + absolutePath + ') could not be found',
		});
	}

	let streamOpts: {
		start: number;
		end: number;
	} | null = null;

	if (request.headers.range && stats.size) {
		const range = rangeParser(stats.size, request.headers.range);

		if (typeof range === 'object' && range.type === 'bytes') {
			const {start, end} = range.ranges[0];

			streamOpts = {
				start,
				end,
			};

			response.statusCode = 206;
		} else {
			response.statusCode = 416;
			response.setHeader('Content-Range', `bytes */${stats.size}`);
		}
	}

	let stream = null;

	try {
		stream = createReadStream(absolutePath, streamOpts ?? {});
	} catch {
		return internalError(absolutePath, response);
	}

	const headers = getHeaders(absolutePath, stats);

	if (streamOpts !== null) {
		headers['Content-Range'] =
			`bytes ${streamOpts.start}-${streamOpts.end}/${stats.size}`;
		headers['Content-Length'] = String(streamOpts.end - streamOpts.start + 1);
	}

	headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';

	response.writeHead(response.statusCode || 200, headers);
	stream.pipe(response);
};
