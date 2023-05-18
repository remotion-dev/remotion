import type * as ff from '@google-cloud/functions-framework';
import type {ErrorResponsePayload} from './helpers/payloads';
import {CloudRunPayload} from './helpers/payloads';
import {renderMediaSingleThread} from './render-media-single-thread';
import {renderStillSingleThread} from './render-still-single-thread';

const renderOnCloudRun = async (req: ff.Request, res: ff.Response) => {
	const body = CloudRunPayload.parse(req.body);
	const renderType = body.type;

	try {
		switch (renderType) {
			case 'media':
				await renderMediaSingleThread(body, res);
				break;
			case 'still':
				await renderStillSingleThread(body, res);
				break;
			default:
				res
					.status(400)
					.send('Invalid render type, must be either "media" or "still"');
		}
	} catch (err) {
		const response: ErrorResponsePayload = {
			error: (err as Error).message,
			status: 'error',
			stack: (err as Error).stack ?? '',
		};

		res.status(500).send(JSON.stringify(response));
	}
};

export {renderOnCloudRun};
