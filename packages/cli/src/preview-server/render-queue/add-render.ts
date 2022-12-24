import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {parseRequestBody} from '../parse-body';
import type {AddRenderRequest} from './job';
import {addJob} from './queue';

export const handleAddRender = async (
	remotionRoot: string,
	req: IncomingMessage,
	res: ServerResponse,
	entryPoint: string
) => {
	if (req.method === 'OPTIONS') {
		res.statusCode = 200;
		res.end();
		return;
	}

	try {
		const body = (await parseRequestBody(req)) as AddRenderRequest;

		if (body.type !== 'still') {
			// TODO support composition rendering
			throw new Error('Only still images are supported for now');
		}

		addJob({
			job: {
				compositionId: body.compositionId,
				id: String(Math.random()).replace('0.', ''),
				startedAt: Date.now(),
				type: 'still',
				outputLocation: path.resolve(remotionRoot, body.outName),
				status: 'idle',
				imageFormat: body.imageFormat,
				quality: body.quality,
				frame: body.frame,
				scale: body.scale,
				cleanup: [],
				deletedOutputLocation: false,
			},
			entryPoint,
			remotionRoot,
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
