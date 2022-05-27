import {NextFunction, Request, Response} from 'express';
import {ReadStream} from 'fs';
import mime from 'mime-types';
import path from 'path';
import {
	getHeaderFromRequest,
	getHeaderFromResponse,
	getHeaderNames,
	send,
	setHeaderForResponse,
	setStatusCode,
} from './compatible-api';
import {getFilenameFromUrl} from './get-filename-from-url';
import {parseRange} from './range-parser';
import {ready} from './ready';
import {DevMiddlewareContext} from './types';

function getValueContentRangeHeader(
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
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<void>;

export function middleware(context: DevMiddlewareContext) {
	return async function (req: Request, res: Response, next: NextFunction) {
		const acceptedMethods = ['GET', 'HEAD'];

		// fixes #282. credit @cexoso. in certain edge situations res.locals is undefined.
		res.locals = res.locals || {};

		if (req.method && !acceptedMethods.includes(req.method)) {
			await goNext();

			return;
		}

		ready(context, processRequest, req);

		function goNext() {
			return next();
		}

		async function processRequest() {
			const filename = getFilenameFromUrl(context, req.url);

			if (!filename) {
				await goNext();

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

					setStatusCode(res, 416);
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
					setStatusCode(res, 206);
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
