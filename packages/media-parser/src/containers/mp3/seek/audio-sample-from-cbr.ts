import type {ParserState} from '../../../state/parser-state';
import type {AudioOrVideoSample} from '../../../webcodec-sample-types';
import {getAverageMpegFrameLength} from '../get-frame-length';

export const getAudioSampleFromCbr = ({
	bitrateInKbit,
	initialOffset,
	layer,
	sampleRate,
	samplesPerFrame,
	data,
	state,
}: {
	bitrateInKbit: number;
	layer: number;
	samplesPerFrame: number;
	sampleRate: number;
	initialOffset: number;
	data: Uint8Array;
	state: ParserState;
}) => {
	const avgLength = getAverageMpegFrameLength({
		bitrateKbit: bitrateInKbit,
		layer,
		samplesPerFrame,
		samplingFrequency: sampleRate,
	});

	const mp3Info = state.mp3.getMp3Info();
	if (!mp3Info) {
		throw new Error('No MP3 info');
	}

	const nthFrame = Math.round(
		(initialOffset - state.mediaSection.getMediaSectionAssertOnlyOne().start) /
			avgLength,
	);

	const durationInSeconds = samplesPerFrame / sampleRate;
	const timeInSeconds = (nthFrame * samplesPerFrame) / sampleRate;
	const timestamp = Math.round(timeInSeconds * 1_000_000);
	const duration = Math.round(durationInSeconds * 1_000_000);

	const audioSample: AudioOrVideoSample = {
		data,
		cts: timestamp,
		dts: timestamp,
		duration,
		offset: initialOffset,
		timescale: 1_000_000,
		timestamp,
		trackId: 0,
		type: 'key',
	};

	return {audioSample, timeInSeconds, durationInSeconds};
};

export type AudioSampleFromCbr = ReturnType<typeof getAudioSampleFromCbr>;
