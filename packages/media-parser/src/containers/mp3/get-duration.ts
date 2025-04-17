import type {ParserState} from '../../state/parser-state';
import {getMpegFrameLength} from './get-frame-length';
import {getSamplesPerMpegFrame} from './samples-per-mpeg-file';

export const getDurationFromMp3 = (state: ParserState): number | null => {
	const mp3Info = state.mp3.getMp3Info();
	const mp3CbrInfo = state.mp3.getCbrMp3Info();
	if (!mp3Info || !mp3CbrInfo) {
		return null;
	}

	const samplesPerFrame = getSamplesPerMpegFrame({
		layer: mp3Info.layer,
		mpegVersion: mp3Info.mpegVersion,
	});

	// TODO
	if (mp3CbrInfo.type === 'variable') {
		throw new Error('Cannot get duration of VBR MP3 file');
	}

	/**
	 * sonnet: The variation between 1044 and 1045 bytes in MP3 frames occurs due to the bit reservoir mechanism in MP3 encoding. Here's the typical distribution:
	 * •	1044 bytes (99% of frames)
	 * •	1045 bytes (1% of frames)
	 */

	// we ignore that fact for now
	const frameLengthInBytes = getMpegFrameLength({
		bitrateKbit: mp3CbrInfo.bitrateInKbit,
		padding: false,
		samplesPerFrame,
		samplingFrequency: mp3Info.sampleRate,
		layer: mp3Info.layer,
	});

	const frames = Math.floor(
		(state.contentLength -
			state.mediaSection.getMediaSectionAssertOnlyOne().start) /
			frameLengthInBytes,
	);

	const samples = frames * samplesPerFrame;
	const durationInSeconds = samples / mp3Info.sampleRate;

	return durationInSeconds;
};
