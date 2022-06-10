import {ReadStream} from 'fs';
import {IncomingMessage, ServerResponse} from 'http';
import mime from 'mime-types';
import path from 'path';
import {
	getHeaderFromRequest,
	getHeaderFromResponse,
	getHeaderNames,
	send,
	setHeaderForResponse,
} from './compatible-api';
import {parseRange} from './range-parser';
import {ready} from './ready';
import {DevMiddlewareContext} from './types';
// eslint-disable-next-line no-restricted-imports
import querystring from 'querystring';
import {parse} from 'url';
import {getPaths} from './get-paths';

const cacheStore = new WeakMap();

const mem = (fn: Function, {cache = new Map()} = {}) => {
	const memoized = (...arguments_: unknown[]) => {
		const [key] = arguments_;
		const cacheItem = cache.get(key);

		if (cacheItem) {
			return cacheItem.data;
		}

		const result = fn.apply(this, arguments_);

		cache.set(key, {
			data: result,
		});

		return result;
	};

	cacheStore.set(memoized, cache);

	return memoized;
};

const memoizedParse = mem(parse);

export function getFilenameFromUrl(
	context: DevMiddlewareContext,
	url: string | undefined
) {
	const paths = getPaths(context);

	let foundFilename;
	let urlObject;

	try {
		// The `url` property of the `request` is contains only  `pathname`, `search` and `hash`
		urlObject = memoizedParse(url, false, true);
	} catch (_ignoreError) {
		return;
	}

	for (const {publicPath, outputPath} of paths) {
		let filename: string;
		let publicPathObject;

		try {
			publicPathObject = memoizedParse(
				publicPath !== 'auto' && publicPath ? publicPath : '/',
				false,
				true
			);
		} catch (_ignoreError) {
			continue;
		}

		if (urlObject.pathname?.startsWith(publicPathObject.pathname)) {
			filename = outputPath;

			// Strip the `pathname` property from the `publicPath` option from the start of requested url
			// `/complex/foo.js` => `foo.js`
			const pathname = urlObject.pathname.substr(
				publicPathObject.pathname.length
			);

			if (pathname) {
				filename = path.join(outputPath, querystring.unescape(pathname));
			}

			if (!context.outputFileSystem) {
				continue;
			}

			try {
				let fsStats = context.outputFileSystem?.statSync(filename);

				if (fsStats.isFile()) {
					foundFilename = filename;

					break;
				} else if (fsStats.isDirectory()) {
					const indexValue = 'index.html';

					filename = path.join(filename, indexValue);

					// eslint-disable-next-line max-depth
					try {
						fsStats = context.outputFileSystem.statSync(filename);
					} catch (__ignoreError) {
						continue;
					}

					// eslint-disable-next-line max-depth
					if (fsStats.isFile()) {
						foundFilename = filename;

						break;
					}
				}
			} catch (_ignoreError) {
				continue;
			}
		}
	}

	return foundFilename;
}

export function getValueContentRangeHeader(
	type: string,
	size: number,
	range?: {
		start: number;
		end: number;
	}
) {
	return `${type} ${range ? `${range.start}-${range.end}` : '*'}/${size}`;
}

function createHtmlDocument(title: number, body: string) {
	return (
		`${
			'<!DOCTYPE html>\n' +
			'<html lang="en">\n' +
			'<head>\n' +
			'<meta charset="utf-8">\n' +
			'<title>'
		}${title}</title>\n` +
		`</head>\n` +
		`<body>\n` +
		`<pre>${body}</pre>\n` +
		`</body>\n` +
		`</html>\n`
	);
}

const BYTES_RANGE_REGEXP = /^ *bytes/i;

export type MiddleWare = (
	req: IncomingMessage,
	res: ServerResponse,
	next: () => void
) => void;

export function middleware(context: DevMiddlewareContext) {
	return function (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void
	) {
		const acceptedMethods = ['GET', 'HEAD'];

		if (req.method && !acceptedMethods.includes(req.method)) {
			goNext();

			return;
		}

		ready(context, processRequest, req);

		function goNext() {
			return next();
		}

		async function processRequest() {
			const filename = getFilenameFromUrl(context, req.url);

			if (!filename) {
				goNext();

				return;
			}

			/**
			 * @type {{key: string, value: string | number}[]}
			 */

			if (!getHeaderFromResponse(res, 'Content-Type')) {
				// content-type name(like application/javascript; charset=utf-8) or false
				const contentType = mime.contentType(path.extname(filename));

				// Only set content-type header if media type is known
				// https://tools.ietf.org/html/rfc7231#section-3.1.1.5
				if (contentType) {
					setHeaderForResponse(res, 'Content-Type', contentType);
				}
			}

			if (!getHeaderFromResponse(res, 'Accept-Ranges')) {
				setHeaderForResponse(res, 'Accept-Ranges', 'bytes');
			}

			const rangeHeader = getHeaderFromRequest(req, 'range');

			let start;
			let end;

			if (
				rangeHeader &&
				BYTES_RANGE_REGEXP.test(rangeHeader as string) &&
				context.outputFileSystem
			) {
				const size = await new Promise<number>((resolve) => {
					context.outputFileSystem?.lstat(filename, (error, stats) => {
						if (error) {
							context.logger.error(error);

							return;
						}

						resolve((stats?.size as number) ?? 0);
					});
				});

				const parsedRanges = parseRange(size, rangeHeader);

				if (parsedRanges === -1) {
					const message = "Unsatisfiable range for 'Range' header.";

					context.logger.error(message);

					const existingHeaders = getHeaderNames(res);

					for (let i = 0; i < existingHeaders.length; i++) {
						res.removeHeader(existingHeaders[i]);
					}

					res.statusCode = 416;
					setHeaderForResponse(
						res,
						'Content-Range',
						getValueContentRangeHeader('bytes', size)
					);
					setHeaderForResponse(res, 'Content-Type', 'text/html; charset=utf-8');

					const document = createHtmlDocument(416, `Error: ${message}`);
					const _byteLength = Buffer.byteLength(document);

					setHeaderForResponse(
						res,
						'Content-Length',
						Buffer.byteLength(document)
					);

					send(req, res, document, _byteLength);

					return;
				}

				if (parsedRanges === -2) {
					context.logger.error(
						"A malformed 'Range' header was provided. A regular response will be sent for this request."
					);
				} else if (parsedRanges.length > 1) {
					context.logger.error(
						"A 'Range' header with multiple ranges was provided. Multiple ranges are not supported, so a regular response will be sent for this request."
					);
				}

				if (parsedRanges !== -2 && parsedRanges.length === 1) {
					// Content-Range
					res.statusCode = 206;
					setHeaderForResponse(
						res,
						'Content-Range',
						getValueContentRangeHeader('bytes', size, parsedRanges[0])
					);

					[{start, end}] = parsedRanges;
				}
			}

			const isFsSupportsStream =
				typeof context.outputFileSystem?.createReadStream === 'function';

			let bufferOtStream;
			let byteLength = 0;

			try {
				if (
					typeof start !== 'undefined' &&
					typeof end !== 'undefined' &&
					isFsSupportsStream &&
					context.outputFileSystem
				) {
					bufferOtStream = context.outputFileSystem.createReadStream(filename, {
						start,
						end,
					}) as unknown as ReadStream;
					byteLength = end - start + 1;
				} else if (context.outputFileSystem) {
					bufferOtStream = context.outputFileSystem.readFileSync(filename);
					// @ts-expect-error
					byteLength = bufferOtStream.byteLength;
				}
			} catch (_ignoreError) {
				await goNext();

				return;
			}

			if (bufferOtStream) {
				send(req, res, bufferOtStream, byteLength);
			}
		}
	};
}
