import type {LogLevel} from '@remotion/renderer';
import type {IncomingMessage, ServerResponse} from 'node:http';
import type {ApiHandler, QueueMethods} from './api-types';
import {parseRequestBody} from './parse-body';

export const handleRequest = async <Req, Res>({
	remotionRoot,
	request,
	response,
	entryPoint,
	handler,
	logLevel,
	methods,
	binariesDirectory,
	publicDir,
}: {
	remotionRoot: string;
	publicDir: string;
	request: IncomingMessage;
	response: ServerResponse;
	entryPoint: string;
	binariesDirectory: string | null;
	handler: ApiHandler<Req, Res>;
	logLevel: LogLevel;
	methods: QueueMethods;
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
			methods,
			binariesDirectory,
			publicDir,
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
