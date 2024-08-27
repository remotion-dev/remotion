import type {VideoSample, VideoTrack} from '@remotion/media-parser';
import {decoderWaitForDequeue} from './wait-for-dequeue';

export const createVideoDecoder = async ({
	track,
	onFrame,
}: {
	track: VideoTrack;
	onFrame: (frame: VideoFrame) => Promise<void>;
}) => {
	if (typeof VideoDecoder === 'undefined') {
		return null;
	}

	const actualConfig: VideoDecoderConfig = {
		...track,
		hardwareAcceleration: 'prefer-hardware',
	};

	const {supported} = await VideoDecoder.isConfigSupported(actualConfig);

	if (!supported) {
		return null;
	}

	const videoDecoder = new VideoDecoder({
		async output(inputFrame) {
			await onFrame(inputFrame);
		},
		error(error) {
			console.log(error);
		},
	});

	videoDecoder.configure(actualConfig);

	const processSample = async (sample: VideoSample) => {
		if (videoDecoder.state === 'closed') {
			return;
		}

		await decoderWaitForDequeue(videoDecoder);
		if (sample.type === 'key') {
			await videoDecoder.flush();
		}

		videoDecoder.decode(new EncodedVideoChunk(sample));
	};

	let queue = Promise.resolve();

	return {
		processSample: (sample: VideoSample) => {
			queue = queue.then(() => processSample(sample));
			return queue;
		},
	};
};
