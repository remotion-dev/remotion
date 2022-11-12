import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {jobQueue} from '.';
import {waitForLiveEventsListener} from '../live-events';
import {parseRequestBody} from '../parse-body';
import type {AddRenderRequest} from './job';

export const handleAddRender = async (
	remotionRoot: string,
	req: IncomingMessage,
	res: ServerResponse
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
	}

	try {
		const body = (await parseRequestBody(req)) as AddRenderRequest;

		jobQueue.push({
			compositionId: body.compositionId,
			id: String(Math.random()).replace('0.', ''),
			startedAt: Date.now(),
			type: 'still',
			outputLocation: path.resolve(remotionRoot, body.outName),
		});

		waitForLiveEventsListener().then((listener) => {
			listener.sendEventToClient({
				type: 'render-queue-updated',
				queue: jobQueue,
			});
		});

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
