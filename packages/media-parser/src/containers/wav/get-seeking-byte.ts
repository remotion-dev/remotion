import type {WavSeekingHints} from '../../seeking-hints';
import type {SeekResolution} from '../../work-on-seek-request';

export const WAVE_SAMPLES_PER_SECOND = 25;

export const getSeekingByteFromWav = ({
	info,
	time,
}: {
	info: WavSeekingHints;
	time: number;
}): Promise<SeekResolution> => {
	const bytesPerSecond = info.sampleRate * info.blockAlign;
	const durationInSeconds = info.mediaSection.size / bytesPerSecond;

	const timeRoundedDown =
		Math.floor(
			Math.min(time, durationInSeconds - 0.0000001) * WAVE_SAMPLES_PER_SECOND,
		) / WAVE_SAMPLES_PER_SECOND;

	const byteOffset = bytesPerSecond * timeRoundedDown;

	return Promise.resolve({
		type: 'do-seek',
		byte: byteOffset + info.mediaSection.start,
		timeInSeconds: timeRoundedDown,
	});
};
