import type {Mp3BitrateInfo, Mp3Info} from '../../../state/mp3';
import type {MediaSection} from '../../../state/video-section';
import {getMpegFrameLength} from '../get-frame-length';
import {getSamplesPerMpegFrame} from '../samples-per-mpeg-file';

export const getApproximateByteFromBitrate = ({
	mp3BitrateInfo,
	timeInSeconds,
	mp3Info,
	mediaSection,
	contentLength,
}: {
	mp3BitrateInfo: Mp3BitrateInfo;
	mp3Info: Mp3Info;
	timeInSeconds: number;
	mediaSection: MediaSection;
	contentLength: number;
}) => {
	if (mp3BitrateInfo.type === 'variable') {
		return null;
	}

	const samplesPerFrame = getSamplesPerMpegFrame({
		layer: mp3Info.layer,
		mpegVersion: mp3Info.mpegVersion,
	});

	const frameLengthInBytes = getMpegFrameLength({
		bitrateKbit: mp3BitrateInfo.bitrateInKbit,
		padding: false,
		samplesPerFrame,
		samplingFrequency: mp3Info.sampleRate,
		layer: mp3Info.layer,
	});

	const frameIndexUnclamped = Math.floor(
		(timeInSeconds * mp3Info.sampleRate) / samplesPerFrame,
	);

	const frames = Math.floor(
		(contentLength - mediaSection.start) / frameLengthInBytes,
	);

	const frameIndex = Math.min(frames - 1, frameIndexUnclamped);

	const byteRelativeToMediaSection = frameIndex * frameLengthInBytes;
	const byteBeforeFrame = byteRelativeToMediaSection + mediaSection.start;

	return byteBeforeFrame;
};
