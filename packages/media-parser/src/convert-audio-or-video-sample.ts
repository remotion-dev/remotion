import type {AudioOrVideoSample} from './webcodec-sample-types';

export const convertAudioOrVideoSampleToWebCodecsTimestamps = (
	sample: AudioOrVideoSample,
	timescale: number,
): AudioOrVideoSample => {
	const {cts, dts, timestamp} = sample;

	return {
		cts: (cts * 1_000_000) / timescale,
		dts: (dts * 1_000_000) / timescale,
		timestamp: (timestamp * 1_000_000) / timescale,
		duration:
			sample.duration === undefined
				? undefined
				: (sample.duration * 1_000_000) / timescale,
		data: sample.data,
		trackId: sample.trackId,
		type: sample.type,
		offset: sample.offset,
		timescale: 1_000_000,
	};
};
