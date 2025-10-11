import type {ParserState} from '../../state/parser-state';
import {getMpegFrameLength} from './get-frame-length';
import type {XingData} from './parse-xing';
import {getSamplesPerMpegFrame} from './samples-per-mpeg-file';

export const getDurationFromMp3Xing = ({
	xingData,
	samplesPerFrame,
}: {
	xingData: XingData;
	samplesPerFrame: number;
}) => {
	const xingFrames = xingData.numberOfFrames;
	if (!xingFrames) {
		throw new Error('Cannot get duration of VBR MP3 file - no frames');
	}

	const {sampleRate} = xingData;
	if (!sampleRate) {
		throw new Error('Cannot get duration of VBR MP3 file - no sample rate');
	}

	const xingSamples = xingFrames * samplesPerFrame;
	return xingSamples / sampleRate;
};

export const getDurationFromMp3 = (state: ParserState): number | null => {
	const mp3Info = state.mp3.getMp3Info();
	const mp3BitrateInfo = state.mp3.getMp3BitrateInfo();
	if (!mp3Info || !mp3BitrateInfo) {
		return null;
	}

	const samplesPerFrame = getSamplesPerMpegFrame({
		layer: mp3Info.layer,
		mpegVersion: mp3Info.mpegVersion,
	});

	if (mp3BitrateInfo.type === 'variable') {
		return getDurationFromMp3Xing({
			xingData: mp3BitrateInfo.xingData,
			samplesPerFrame,
		});
	}
	/**
	 * sonnet: The variation between 1044 and 1045 bytes in MP3 frames occurs due to the bit reservoir mechanism in MP3 encoding. Here's the typical distribution:
	 * •	1044 bytes (99% of frames)
	 * •	1045 bytes (1% of frames)
	 */

	// we ignore that fact for now
	const frameLengthInBytes = getMpegFrameLength({
		bitrateKbit: mp3BitrateInfo.bitrateInKbit,
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
