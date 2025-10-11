import type {AudioSampleOffset} from '../../../state/audio-sample-map';
import type {Mp3SeekingHints} from '../seeking-hints';

export const getByteFromObservedSamples = ({
	info,
	timeInSeconds,
}: {
	info: Mp3SeekingHints;
	timeInSeconds: number;
}) => {
	let bestAudioSample: AudioSampleOffset | undefined;

	for (const hint of info.audioSampleMap) {
		if (hint.timeInSeconds > timeInSeconds) {
			continue;
		}

		// Everything is a keyframe in mp3, so if this sample does not cover the time, it's not a good candidate.
		// Let's go to the next one. Exception: If we already saw the last sample, we use it so we find can at least
		// find the closest one.
		if (
			hint.timeInSeconds + hint.durationInSeconds < timeInSeconds &&
			!info.lastSampleObserved
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

	return bestAudioSample;
};
