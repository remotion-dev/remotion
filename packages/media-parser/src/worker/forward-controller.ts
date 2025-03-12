import {Log} from '../log';
import type {MediaParserController} from '../media-parser-controller';
import type {WorkerRequestPayload} from './worker-types';

export const forwardMediaParserControllerToWorker = (
	controller: MediaParserController,
): ((message: WorkerRequestPayload) => void) => {
	return (message) => {
		if (message.type === 'request-pause') {
			controller.pause();
			return;
		}

		if (message.type === 'request-resume') {
			controller.resume();
			return;
		}

		if (message.type === 'request-abort') {
			controller.abort();
			return;
		}

		const msg = `Unknown message type: ${message.type}`;
		Log.error(msg);
		throw new Error(msg);
	};
};
