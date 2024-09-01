import {getVideoEncoderConfigWithHardwareAcceleration} from './get-config';
import {encoderWaitForDequeue} from './wait-for-dequeue';

export const createVideoEncoder = async ({
	width,
	height,
	onChunk,
}: {
	width: number;
	height: number;
	onChunk: (chunk: EncodedVideoChunk) => Promise<void>;
}) => {
	if (typeof VideoEncoder === 'undefined') {
		return Promise.resolve(null);
	}

	const encoder = new VideoEncoder({
		error(error) {
			console.error(error);
		},
		async output(chunk) {
			await onChunk(chunk);
		},
	});

	const config = await getVideoEncoderConfigWithHardwareAcceleration({
		codec: 'vp8',
		height,
		width,
	});

	if (!config) {
		return null;
	}

	encoder.configure(config);

	let framesProcessed = 0;

	const encodeFrame = async (frame: VideoFrame) => {
		await encoderWaitForDequeue(encoder);
		if (encoder.state === 'closed') {
			return;
		}

		encoder.encode(frame, {
			keyFrame: framesProcessed % 40 === 0,
		});
		framesProcessed++;
	};

	let queue = Promise.resolve();

	return {
		encodeFrame: (frame: VideoFrame) => {
			queue = queue.then(() => encodeFrame(frame));
			return queue;
		},
	};
};
