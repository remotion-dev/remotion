import type {VideoSample, VideoTrack} from '@remotion/media-parser';
import {decoderWaitForDequeue} from './wait-for-dequeue';

export const createDecoder = async ({
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
			console.error(error);
		},
	});

	videoDecoder.configure(actualConfig);

	return {
		processSample: async (sample: VideoSample) => {
			if (videoDecoder.state === 'closed') {
				return;
			}

			await decoderWaitForDequeue(videoDecoder);

			videoDecoder.decode(new EncodedVideoChunk(sample));
		},
	};
};
