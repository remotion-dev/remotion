import { extractFrames } from "@remotion/webcodecs";

onmessage = function (event: MessageEvent) {
	const {src, timestamp} = event.data;
	extractFrames({
		src,
		timestampsInSeconds: [timestamp],
		onFrame: (frame) => {
			postMessage(frame);
		},
	});
};
