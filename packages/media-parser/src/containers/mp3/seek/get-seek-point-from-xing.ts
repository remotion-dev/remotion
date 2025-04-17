import type {Mp3Info} from '../../../state/mp3';
import {getDurationFromMp3Xing} from '../get-duration';
import {getSeekPointInBytes, type XingData} from '../parse-xing';
import {getSamplesPerMpegFrame} from '../samples-per-mpeg-file';

export const getSeekPointFromXing = ({
	timeInSeconds,
	xingData,
	mp3Info,
}: {
	timeInSeconds: number;
	xingData: XingData;
	mp3Info: Mp3Info;
}) => {
	const samplesPerFrame = getSamplesPerMpegFrame({
		layer: mp3Info.layer,
		mpegVersion: mp3Info.mpegVersion,
	});

	const duration = getDurationFromMp3Xing({
		xingData,
		samplesPerFrame,
	});

	if (!xingData.fileSize || !xingData.tableOfContents) {
		throw new Error('Cannot seek of VBR MP3 file');
	}

	return getSeekPointInBytes({
		fileSize: xingData.fileSize,
		percentBetween0And100: (timeInSeconds / duration) * 100,
		tableOfContents: xingData.tableOfContents,
	});
};
