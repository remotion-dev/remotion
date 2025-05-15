import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from './webcodec-sample-types';

const TARGET_TIMESCALE = 1_000_000;

const fixFloat = (value: number) => {
	if (value % 1 < 0.0000001) {
		return Math.floor(value);
	}

	if (value % 1 > 0.9999999) {
		return Math.ceil(value);
	}

	return value;
};

export const convertAudioOrVideoSampleToWebCodecsTimestamps = <
	T extends MediaParserAudioSample | MediaParserVideoSample,
>({
	sample,
	timescale,
}: {
	sample: T;
	timescale: number;
}): T => {
	if (timescale === TARGET_TIMESCALE) {
		return sample;
	}

	const {decodingTimestamp: dts, timestamp} = sample;

	return {
		decodingTimestamp: fixFloat(dts * (TARGET_TIMESCALE / timescale)),
		timestamp: fixFloat(timestamp * (TARGET_TIMESCALE / timescale)),
		duration:
			sample.duration === undefined
				? undefined
				: fixFloat(sample.duration * (TARGET_TIMESCALE / timescale)),
		data: sample.data,
		type: sample.type,
		offset: sample.offset,
		timescale: TARGET_TIMESCALE,
		...('avc' in sample ? {avc: sample.avc} : {}),
	} as T;
};
