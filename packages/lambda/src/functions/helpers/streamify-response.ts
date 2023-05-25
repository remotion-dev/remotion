import {Stream} from 'stream';

export class ResponseStream extends Stream.Writable {
	private response: Buffer[];
	_contentType?: string;
	_isBase64Encoded?: boolean;

	constructor() {
		super();
		this.response = [];
	}

	_write(
		chunk: string,
		encoding: BufferEncoding,
		callback: (error?: Error | null) => void
	): void {
		this.response.push(Buffer.from(chunk, encoding));
		callback();
	}

	getBufferedData(): Buffer {
		return Buffer.concat(this.response);
	}

	setContentType(contentType: string) {
		this._contentType = contentType;
	}

	setIsBase64Encoded(isBase64Encoded: boolean) {
		this._isBase64Encoded = isBase64Encoded;
	}
}
export const HANDLER_STREAMING = Symbol.for(
	'aws.lambda.runtime.handler.streaming'
);
export const STREAM_RESPONSE = 'response';

export function isInAWS(handler: Function): boolean {
	return (
		// @ts-expect-error
		handler[HANDLER_STREAMING] !== undefined &&
		// @ts-expect-error
		handler[HANDLER_STREAMING] === STREAM_RESPONSE
	);
}

export function streamifyResponse(handler: Function): Function {
	// Check for global awslambda
	if (isInAWS(handler)) {
		// @ts-expect-error
		return awslambda.streamifyResponse(handler);
	}

	return new Proxy(handler, {
		async apply(target, _, argList) {
			const responseStream: ResponseStream = patchArgs(argList);
			await target(...argList);
			return {
				statusCode: 200,
				headers: {
					'content-type': responseStream._contentType || 'application/json',
				},
				...(responseStream._isBase64Encoded
					? {isBase64Encoded: responseStream._isBase64Encoded}
					: {}),
				body: responseStream._isBase64Encoded
					? responseStream.getBufferedData().toString('base64')
					: responseStream.getBufferedData().toString(),
			};
		},
	});
}

function patchArgs(argList: unknown[]): ResponseStream {
	if (!(argList[1] instanceof ResponseStream)) {
		const responseStream = new ResponseStream();
		argList.splice(1, 0, responseStream);
	}

	return argList[1] as ResponseStream;
}
