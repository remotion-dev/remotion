import type {LogLevel} from '@remotion/renderer';
import type {IncomingMessage, ServerResponse} from 'node:http';
import type {ApiHandler} from './api-types';
import {parseRequestBody} from './parse-body';

export const handleRequest = async <Req, Res>({
	remotionRoot,
	request,
	response,
	entryPoint,
	handler,
	logLevel,
}: {
	remotionRoot: string;
	request: IncomingMessage;
	response: ServerResponse;
	entryPoint: string;
	handler: ApiHandler<Req, Res>;
	logLevel: LogLevel;
}) => {
	if (request.method === 'OPTIONS') {
		response.statusCode = 200;
		response.end();
		return;
	}

	response.setHeader('content-type', 'application/json');
	response.writeHead(200);

	try {
		const body = (await parseRequestBody(request)) as Req;

		const outputData = await handler({
			entryPoint,
			remotionRoot,
			request,
			response,
			input: body,
			logLevel,
		});

		response.end(
			JSON.stringify({
				success: true,
				data: outputData,
			}),
		);
	} catch (err) {
		response.end(
			JSON.stringify({
				success: false,
				error: (err as Error).message,
			}),
		);
	}
};
