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
		callback: (error?: Error | null) => void,
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

function patchArgs(argList: unknown[]): ResponseStream {
	if (!(argList[1] instanceof ResponseStream)) {
		const responseStream = new ResponseStream();
		argList.splice(1, 0, responseStream);
	}

	return argList[1] as ResponseStream;
}

export const HANDLER_STREAMING = Symbol.for(
	'aws.lambda.runtime.handler.streaming',
);
export const STREAM_RESPONSE = 'response';

export function streamifyResponse(handler: Function): Function {
	// Check if we are inside Lambda
	if (
		process.env.AWS_LAMBDA_FUNCTION_VERSION &&
		process.env.AWS_LAMBDA_FUNCTION_NAME &&
		// @ts-expect-error
		typeof awslambda !== 'undefined'
	) {
		// @ts-expect-error
		return awslambda.streamifyResponse(handler);
	}

	return new Proxy(handler, {
		async apply(target, _, argList) {
			const responseStream: ResponseStream = patchArgs(argList);
			await target(...argList);

			return {
				EventStream: [
					{
						PayloadChunk: {
							Payload: responseStream.getBufferedData(),
						},
						InvokeComplete: true,
					},
				],
			};
		},
	});
}
