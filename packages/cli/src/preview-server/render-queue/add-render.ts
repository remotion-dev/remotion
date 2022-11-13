import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {addJob} from '.';
import {parseRequestBody} from '../parse-body';
import type {AddRenderRequest} from './job';

export const handleAddRender = async (
	remotionRoot: string,
	req: IncomingMessage,
	res: ServerResponse,
	entryPoint: string
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
	}

	try {
		const body = (await parseRequestBody(req)) as AddRenderRequest;

		addJob(
			{
				compositionId: body.compositionId,
				id: String(Math.random()).replace('0.', ''),
				startedAt: Date.now(),
				type: 'still',
				outputLocation: path.resolve(remotionRoot, body.outName),
				status: 'idle',
			},
			entryPoint
		);

		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		res.end(
			JSON.stringify({
				success: true,
			})
		);
	} catch (err) {
		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		res.end(
			JSON.stringify({
				success: false,
			})
		);
	}
};
