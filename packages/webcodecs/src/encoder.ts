import {getVideoEncoderConfigWithHardwareAcceleration} from './get-config';
import {encoderWaitForDequeue} from './wait-for-dequeue';

export const createEncoder = async ({
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

	// TODO: Enable hardware acceleration if possible
	encoder.configure(config);

	let framesProcessed = 0;

	return {
		encodeFrame: async (_frame: VideoFrame) => {
			await encoderWaitForDequeue(encoder);
			encoder.encode(_frame, {
				keyFrame: framesProcessed % 40 === 0,
			});
			framesProcessed++;
		},
	};
};
