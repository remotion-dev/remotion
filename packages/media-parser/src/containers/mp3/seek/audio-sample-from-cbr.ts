import type {ParserState} from '../../../state/parser-state';
import type {MediaParserAudioSample} from '../../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../../webcodecs-timescale';
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
	const timestamp = Math.round(timeInSeconds * WEBCODECS_TIMESCALE);
	const duration = Math.round(durationInSeconds * WEBCODECS_TIMESCALE);

	const audioSample: MediaParserAudioSample = {
		data,
		decodingTimestamp: timestamp,
		duration,
		offset: initialOffset,
		timestamp,
		type: 'key',
	};

	return {audioSample, timeInSeconds, durationInSeconds};
};

export type AudioSampleFromCbr = ReturnType<typeof getAudioSampleFromCbr>;
