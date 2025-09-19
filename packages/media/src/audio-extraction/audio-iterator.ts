import type {AudioSampleSink} from 'mediabunny';
import type {RememberActualMatroskaTimestamps} from '../video-extraction/remember-actual-matroska-timestamps';

// https://discord.com/channels/@me/1409810025844838481/1415028953093111870
// Audio frames might have dependencies on previous and next frames so we need to decode a bit more
// and then discard it.
// The worst case seems to be FLAC files with a 65'535 sample window, which would be 1486.0ms at 44.1Khz.
// So let's set a threshold of 1.5 seconds.

const extraThreshold = 1.5;

export const makeAudioIterator = ({
	audioSampleSink,
	isMatroska,
	timeInSeconds,
	src,
	actualMatroskaTimestamps,
}: {
	audioSampleSink: AudioSampleSink;
	isMatroska: boolean;
	timeInSeconds: number;
	src: string;
	actualMatroskaTimestamps: RememberActualMatroskaTimestamps;
}) => {
	// Matroska timestamps are not accurate unless we start from the beginning
	// So for matroska, we need to decode all samples :(

	// https://github.com/Vanilagy/mediabunny/issues/105

	const sampleIterator = audioSampleSink.samples(
		isMatroska ? 0 : Math.max(0, timeInSeconds - extraThreshold),
	);

	return {
		startTimestampInSeconds: timeInSeconds,
		currentTimestamp: timeInSeconds,
		src,
		getNextSample: async () => {
			const {value: sample, done} = await sampleIterator.next();
			if (done) {
				return null;
			}

			const realTimestamp = actualMatroskaTimestamps.getRealTimestamp(
				sample.timestamp,
			);

			if (realTimestamp !== null && realTimestamp !== sample.timestamp) {
				sample.setTimestamp(realTimestamp);
			}

			actualMatroskaTimestamps.observeTimestamp(sample.timestamp);
			actualMatroskaTimestamps.observeTimestamp(
				sample.timestamp + sample.duration,
			);

			return sample;
		},
	};
};

export type AudioSampleIterator = ReturnType<typeof makeAudioIterator>;
