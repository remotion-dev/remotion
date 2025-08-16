import {extractFrames} from '@remotion/webcodecs';
import type {WorkerRequestPayload, WorkerResponsePayload} from './payloads';

onmessage = function (event: MessageEvent) {
	const {src, timestamp} = event.data as WorkerRequestPayload;
	extractFrames({
		src,
		timestampsInSeconds: [timestamp],
		onFrame: (frame) => {
			const response: WorkerResponsePayload = {
				frame,
				type: 'request-frame-response',
			};
			postMessage(response);
		},
	});
};
