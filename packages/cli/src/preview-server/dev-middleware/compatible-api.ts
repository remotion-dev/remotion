import type {ReadStream} from 'fs';
import type {IncomingMessage, ServerResponse} from 'http';

export function setHeaderForResponse(
	res: ServerResponse,
	name: string,
	value: string | number
) {
	res.setHeader(name, typeof value === 'number' ? String(value) : value);
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
