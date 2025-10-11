import type {MediaParserVideoSample} from '../../webcodec-sample-types';

export type QueuedVideoSample = Omit<
	MediaParserVideoSample,
	'decodingTimestamp' | 'timestamp'
>;

type QueueItem = {
	sample: QueuedVideoSample;
	trackId: number;
	timescale: number;
};

export const queuedBFramesState = () => {
	const queuedFrames: QueueItem[] = [];
	const releasedFrames: QueueItem[] = [];

	const flush = () => {
		releasedFrames.push(...queuedFrames);
		queuedFrames.length = 0;
	};

	return {
		addFrame: ({
			frame,
			maxFramesInBuffer,
			trackId,
			timescale,
		}: {
			frame: QueuedVideoSample;
			trackId: number;
			maxFramesInBuffer: number;
			timescale: number;
		}) => {
			if (frame.type === 'key') {
				flush();
				releasedFrames.push({sample: frame, trackId, timescale});
				return;
			}

			queuedFrames.push({sample: frame, trackId, timescale});

			if (queuedFrames.length > maxFramesInBuffer) {
				releasedFrames.push(queuedFrames.shift()!);
			}
		},
		flush,
		getReleasedFrame: (): QueueItem | null => {
			if (releasedFrames.length === 0) {
				return null;
			}

			return releasedFrames.shift()!;
		},
		hasReleasedFrames: () => {
			return releasedFrames.length > 0;
		},
		clear: () => {
			releasedFrames.length = 0;
			queuedFrames.length = 0;
		},
	};
};
