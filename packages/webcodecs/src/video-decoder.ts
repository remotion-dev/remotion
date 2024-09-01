import type {VideoSample, VideoTrack} from '@remotion/media-parser';
import {getVideoDecoderConfigWithHardwareAcceleration} from './get-config';
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

	const config = await getVideoDecoderConfigWithHardwareAcceleration(track);

	if (!config) {
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

	videoDecoder.configure(config);

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
