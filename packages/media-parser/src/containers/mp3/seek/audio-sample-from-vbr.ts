import type {Mp3Info, VariableMp3BitrateInfo} from '../../../state/mp3';
import type {AudioOrVideoSample} from '../../../webcodec-sample-types';
import {getDurationFromMp3Xing} from '../get-duration';
import {getTimeFromPosition} from '../parse-xing';
import {getSamplesPerMpegFrame} from '../samples-per-mpeg-file';
import type {AudioSampleFromCbr} from './audio-sample-from-cbr';

export const getAudioSampleFromVbr = ({
	info,
	position,
	mp3Info,
	data,
}: {
	position: number;
	info: VariableMp3BitrateInfo;
	mp3Info: Mp3Info | null;
	data: Uint8Array;
}): AudioSampleFromCbr => {
	if (!mp3Info) {
		throw new Error('No MP3 info');
	}

	const samplesPerFrame = getSamplesPerMpegFrame({
		layer: mp3Info.layer,
		mpegVersion: mp3Info.mpegVersion,
	});
	const wholeFileDuration = getDurationFromMp3Xing({
		samplesPerFrame,
		xingData: info.xingData,
	});
	if (!info.xingData.fileSize) {
		throw new Error('file size');
	}

	if (!info.xingData.tableOfContents) {
		throw new Error('table of contents');
	}

	const timeInSeconds = getTimeFromPosition({
		durationInSeconds: wholeFileDuration,
		fileSize: info.xingData.fileSize,
		position,
		tableOfContents: info.xingData.tableOfContents,
	});
	const durationInSeconds = samplesPerFrame / info.xingData.sampleRate;

	const timestamp = Math.round(timeInSeconds * 1_000_000);
	const duration = Math.round(durationInSeconds * 1_000_000);

	const audioSample: AudioOrVideoSample = {
		data,
		cts: timestamp,
		dts: timestamp,
		duration,
		offset: position,
		timescale: 1_000_000,
		timestamp,
		trackId: 0,
		type: 'key',
	};

	return {timeInSeconds, audioSample, durationInSeconds};
};
