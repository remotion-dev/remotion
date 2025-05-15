import type {MediaParserVideoSample} from '../../webcodec-sample-types';

export type QueuedVideoSample = Omit<
	MediaParserVideoSample,
	'cts' | 'dts' | 'timestamp'
>;

export const queuedBFramesState = () => {
	const queuedFrames: QueuedVideoSample[] = [];
	const releasedFrames: QueuedVideoSample[] = [];

	const sortFrames = () => {
		queuedFrames.sort((a, b) => {
			if (!a.avc || !b.avc || a.avc.poc === null || b.avc.poc === null) {
				throw new Error('Invalid frame');
			}

			return a.avc.poc - b.avc.poc;
		});
	};

	const flush = () => {
		sortFrames();

		releasedFrames.push(...queuedFrames);
		queuedFrames.length = 0;
	};

	return {
		addFrame: (frame: QueuedVideoSample, maxFramesInBuffer: number) => {
			if (frame.type === 'key') {
				flush();
			}

			queuedFrames.push(frame);

			if (queuedFrames.length > maxFramesInBuffer) {
				sortFrames();

				releasedFrames.push(queuedFrames.shift()!);
			}
		},
		flush,
		getReleasedFrame: (): QueuedVideoSample | null => {
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
