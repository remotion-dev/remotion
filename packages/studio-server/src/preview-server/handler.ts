import type {IncomingMessage, ServerResponse} from 'node:http';
import type {
	DefaultCodingAgent,
	DefaultEditor,
	LogLevel,
} from '@remotion/renderer';
import type {ApiHandler, QueueMethods} from './api-types';
import {parseRequestBody} from './parse-body';
import {validateSameOrigin} from './validate-same-origin';

const MAX_REQUEST_BODY_BYTES = 10 * 1024 * 1024;

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
	configFile,
	getDefaultCodingAgent,
	getDefaultEditor,
}: {
	remotionRoot: string;
	publicDir: string;
	request: IncomingMessage;
	response: ServerResponse;
	entryPoint: string;
	binariesDirectory: string | null;
	configFile: string | null;
	getDefaultCodingAgent: () => DefaultCodingAgent | null;
	getDefaultEditor: () => DefaultEditor | null;
	handler: ApiHandler<Req, Res>;
	logLevel: LogLevel;
	methods: QueueMethods;
}) => {
	if (request.method === 'OPTIONS') {
		response.statusCode = 200;
		response.end();
		return;
	}

	validateSameOrigin(request);

	response.setHeader('content-type', 'application/json');
	response.writeHead(200);

	try {
		const body = (await parseRequestBody(request, {
			maxBytes: MAX_REQUEST_BODY_BYTES,
		})) as Req;

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
			configFile,
			getDefaultCodingAgent,
			getDefaultEditor,
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
