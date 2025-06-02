import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {SeekResolution} from '../../work-on-seek-request';
import type {AacSeekingHints} from './seeking-hints';

export const getSeekingByteForAac = ({
	time,
	seekingHints,
}: {
	time: number;
	seekingHints: AacSeekingHints;
}): SeekResolution => {
	let bestAudioSample: AudioSampleOffset | undefined;

	for (const hint of seekingHints.audioSampleMap) {
		if (hint.timeInSeconds > time) {
			continue;
		}

		// Everything is a keyframe in flac, so if this sample does not cover the time, it's not a good candidate.
		// Let's go to the next one. Exception: If we already saw the last sample, we use it so we find can at least
		// find the closest one.
		if (
			hint.timeInSeconds + hint.durationInSeconds < time &&
			!seekingHints.lastSampleObserved
		) {
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
		return {
			type: 'do-seek',
			byte: bestAudioSample.offset,
			timeInSeconds: bestAudioSample.timeInSeconds,
		};
	}

	return {type: 'valid-but-must-wait'};
};
