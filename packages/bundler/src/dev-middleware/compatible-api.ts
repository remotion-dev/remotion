import {ReadStream} from 'fs';
import {IncomingMessage, ServerResponse} from 'http';

export function getHeaderNames(res: ServerResponse) {
	if (typeof res.getHeaderNames !== 'function') {
		// @ts-expect-error
		return Object.keys(res._headers || {});
	}

	return res.getHeaderNames();
}

export function getHeaderFromRequest(req: IncomingMessage, name: string) {
	return req.headers[name];
}

export function getHeaderFromResponse(res: ServerResponse, name: string) {
	return res.getHeader(name);
}

export function setHeaderForResponse(
	res: ServerResponse,
	name: string,
	value: string | number
) {
	res.setHeader(name, typeof value === 'number' ? String(value) : value);
}

export function setStatusCode(res: ServerResponse, code: number) {
	res.statusCode = code;
}

export function send(
	req: IncomingMessage,
	res: ServerResponse,
	bufferOtStream: ReadStream | string | Buffer,
	byteLength: number
) {
	if (typeof bufferOtStream === 'string' || Buffer.isBuffer(bufferOtStream)) {
		res.end(bufferOtStream);
		return;
	}

	setHeaderForResponse(res, 'Content-Length', byteLength);

	if (req.method === 'HEAD') {
		res.end();

		return;
	}

	bufferOtStream.pipe(res);
}
