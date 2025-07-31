import {extractFrames} from './extract-frames';

onmessage = function (event: any) {
	let {src, timestamp} = event.data;
	extractFrames({
		src,
		timestampsInSeconds: [timestamp],
		onFrame: (frame) => {
			postMessage(frame);
		},
	});
};
