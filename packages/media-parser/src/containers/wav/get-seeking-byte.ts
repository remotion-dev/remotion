import type {WavSeekingInfo} from '../../seeking-info';
import type {SeekResolution} from '../../work-on-seek-request';

export const WAVE_SECONDS_PER_SAMPLE = 1;

export const getSeekingByteFromWav = ({
	info,
	time,
}: {
	info: WavSeekingInfo;
	time: number;
}): Promise<SeekResolution> => {
	const bytesPerSecond = info.sampleRate * info.blockAlign;
	const videoSectionLength = info.videoSection.size;
	const durationInSeconds = videoSectionLength / bytesPerSecond;

	const timeRoundedDown =
		Math.floor(
			Math.min(time, durationInSeconds - 0.0000001) / WAVE_SECONDS_PER_SAMPLE,
		) * WAVE_SECONDS_PER_SAMPLE;

	const byteOffset = bytesPerSecond * timeRoundedDown;

	return Promise.resolve({
		type: 'do-seek',
		byte: byteOffset + info.videoSection.start,
	});
};
