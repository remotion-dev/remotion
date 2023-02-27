import type * as ff from '@google-cloud/functions-framework';
import {renderMediaSingleThread} from './render-media-single-thread';
import {renderStillSingleThread} from './render-still-single-thread';

const renderOnCloudRun = async (req: ff.Request, res: ff.Response) => {
	const renderType = req.body.type;

	switch (renderType) {
		case 'media':
			await renderMediaSingleThread(req, res);
			break;
		case 'still':
			await renderStillSingleThread(req, res);
			break;
		default:
			res
				.status(400)
				.send('Invalid render type, must be either "media" or "still"');
	}
};

export {renderOnCloudRun};
