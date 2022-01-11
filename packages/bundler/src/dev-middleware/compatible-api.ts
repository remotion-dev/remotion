import {Response, Request} from 'express';
import {ReadStream} from 'fs';

export const getHeaderNames = (res: Response) => {
	if (typeof res.getHeaderNames !== 'function') {
		// @ts-expect-error
		return Object.keys(res._headers || {});
	}

	return res.getHeaderNames();
};

export const getHeaderFromRequest = (req: Request, name: string) => {
	// Express API
	if (typeof req.get === 'function') {
		return req.get(name);
	}

	return req.headers[name];
};

export const getHeaderFromResponse = (res: Response, name: string) => {
	return res.get(name);
};

export const setHeaderForResponse = (
	res: Response,
	name: string,
	value: string | number
) => {
	res.set(name, typeof value === 'number' ? String(value) : value);
};

export const setStatusCode = (res: Response, code: number) => {
	res.status(code);
};

export const send = (
	req: Request,
	res: Response,
	bufferOtStream: ReadStream | string | Buffer,
	byteLength: number
) => {
	if (typeof bufferOtStream === 'string' || Buffer.isBuffer(bufferOtStream)) {
		res.send(bufferOtStream);
		return;
	}

	setHeaderForResponse(res, 'Content-Length', byteLength);

	if (req.method === 'HEAD') {
		res.end();

		return;
	}

	bufferOtStream.pipe(res);
};
