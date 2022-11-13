import type {IncomingMessage, ServerResponse} from 'http';
import {removeJob} from '.';
import {parseRequestBody} from '../parse-body';
import type {RemoveRenderRequest} from './job';

export const handleRemoveRender = async (
	req: IncomingMessage,
	res: ServerResponse
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
	}

	try {
		const body = (await parseRequestBody(req)) as RemoveRenderRequest;

		removeJob(body.jobId);

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
