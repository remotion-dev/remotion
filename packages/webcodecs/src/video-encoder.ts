import {getVideoEncoderConfigWithHardwareAcceleration} from './get-config';
import {encoderWaitForDequeue, encoderWaitForFinish} from './wait-for-dequeue';

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

	let prom = Promise.resolve();

	const encoder = new VideoEncoder({
		error(error) {
			console.error(error);
		},
		output(chunk) {
			prom = prom.then(() => onChunk(chunk));
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
		waitForFinish: async () => {
			await prom;
			await encoderWaitForFinish(encoder);
		},
		close: () => {
			encoder.close();
		},
	};
};
