import type {ParserState} from '../../state/parser-state';
import {getMpegFrameLength} from './get-frame-length';
import {getSamplesPerMpegFrame} from './samples-per-mpeg-file';

export const getDurationFromMp3 = (state: ParserState): number | null => {
	const mp3Info = state.mp3Info.getMp3Info();
	const mp3CbrInfo = state.mp3Info.getCbrMp3Info();
	if (!mp3Info || !mp3CbrInfo) {
		return null;
	}

	const samplesPerFrame = getSamplesPerMpegFrame({
		layer: mp3Info.layer,
		mpegVersion: mp3Info.mpegVersion,
	});
	const frameLengthInBytes = getMpegFrameLength({
		bitrateKbit: mp3CbrInfo.bitrateKbit,
		padding: false,
		samplesPerFrame,
		samplingFrequency: mp3Info.sampleRate,
		layer: mp3Info.layer,
	});

	const frames = Math.floor(
		(state.contentLength - mp3Info.startOfMpegStream) / frameLengthInBytes,
	);
	const samples = frames * samplesPerFrame;
	const durationInSeconds = samples / mp3Info.sampleRate;

	return durationInSeconds;
};
