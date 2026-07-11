import type {IncomingMessage, ServerResponse} from 'node:http';
import type {LogLevel} from '@remotion/renderer';
import type {ApiHandler, QueueMethods} from './api-types';
import {parseRequestBody} from './parse-body';
import {validateSameOrigin} from './validate-same-origin';

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
	studioAuthToken,
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
	studioAuthToken: string;
}) => {
	if (request.method === 'OPTIONS') {
		response.statusCode = 200;
		response.end();
		return;
	}

	validateSameOrigin(request, studioAuthToken);

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
