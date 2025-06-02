import type {MediaParserController} from '../controller/media-parser-controller';
import {Log} from '../log';
import type {WorkerRequestPayload} from './worker-types';

export const forwardMediaParserControllerToWorker = (
	controller: MediaParserController,
): ((message: WorkerRequestPayload) => void) => {
	return (message) => {
		if (message.type === 'request-pause') {
			controller.pause();
			return;
		}

		if (message.type === 'request-seek') {
			controller.seek(message.payload);
			return;
		}

		if (message.type === 'request-get-seeking-hints') {
			controller
				.getSeekingHints()
				.then((hints) => {
					postMessage({
						type: 'response-get-seeking-hints',
						payload: hints,
					});
				})
				.catch((error) => {
					postMessage({
						type: 'response-error',
						payload: error,
					});
				});
			return;
		}

		if (message.type === 'request-simulate-seek') {
			controller
				.simulateSeek(message.payload)
				.then((resolution) => {
					postMessage({
						type: 'response-simulate-seek',
						nonce: message.nonce,
						payload: resolution,
					});
				})
				.catch((err) => {
					postMessage({
						type: 'response-error',
						payload: err,
					});
				});
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
