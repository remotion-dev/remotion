import type * as ff from '@google-cloud/functions-framework';
import {RenderInternals} from '@remotion/renderer';
import {Log} from '../cli/log';
import type {ErrorResponsePayload} from './helpers/payloads';
import {CloudRunPayload} from './helpers/payloads';
import {renderMediaSingleThread} from './render-media-single-thread';
import {renderStillSingleThread} from './render-still-single-thread';

const renderOnCloudRun = async (req: ff.Request, res: ff.Response) => {
	try {
		Log.info('renderOnCloudRun', req.body);
		const body = CloudRunPayload.parse(req.body);
		const renderType = body.type;

		RenderInternals.setLogLevel(body.logLevel);
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
		Log.error('Error while rendering', err);
		const response: ErrorResponsePayload = {
			error: (err as Error).message,
			status: 'error',
			stack: (err as Error).stack ?? '',
		};

		res.status(500).send(JSON.stringify(response));
	}
};

export {renderOnCloudRun};
