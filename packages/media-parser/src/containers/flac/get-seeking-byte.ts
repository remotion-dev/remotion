import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {FlacSeekingHints} from './seeking-hints';

export const getSeekingByteForFlac = ({
	time,
	seekingHints,
	endOfFile,
}: {
	time: number;
	seekingHints: FlacSeekingHints;
	endOfFile: boolean;
}) => {
	let bestAudioSample: AudioSampleOffset | undefined;
	for (const hint of seekingHints.audioSampleMap) {
		if (hint.timeInSeconds > time) {
			continue;
		}

		if (hint.timeInSeconds + hint.durationInSeconds < time && !endOfFile) {
			continue;
		}

		if (!bestAudioSample) {
			bestAudioSample = hint;
			continue;
		}

		if (bestAudioSample.timeInSeconds < hint.timeInSeconds) {
			bestAudioSample = hint;
		}
	}

	if (bestAudioSample) {
		return bestAudioSample.offset;
	}

	return null;
};
