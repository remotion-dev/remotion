import type {SeekResolution} from '../../work-on-seek-request';
import {getApproximateByteFromBitrate} from './seek/get-approximate-byte-from-bitrate';
import {getByteFromObservedSamples} from './seek/get-byte-from-observed-samples';
import {getSeekPointFromXing} from './seek/get-seek-point-from-xing';
import type {Mp3SeekingHints} from './seeking-hints';

export const getSeekingByteForMp3 = ({
	time,
	info,
}: {
	time: number;
	info: Mp3SeekingHints;
}): SeekResolution => {
	if (
		info.mp3BitrateInfo === null ||
		info.mp3Info === null ||
		info.mediaSection === null
	) {
		return {
			type: 'valid-but-must-wait',
		};
	}

	const approximateByte = getApproximateByteFromBitrate({
		mp3BitrateInfo: info.mp3BitrateInfo,
		timeInSeconds: time,
		mp3Info: info.mp3Info,
		mediaSection: info.mediaSection,
		contentLength: info.contentLength,
	});
	const bestAudioSample = getByteFromObservedSamples({
		info,
		timeInSeconds: time,
	});

	const xingSeekPoint =
		info.mp3BitrateInfo.type === 'variable'
			? getSeekPointFromXing({
					mp3Info: info.mp3Info,
					timeInSeconds: time,
					xingData: info.mp3BitrateInfo.xingData,
				})
			: null;

	const candidates = [
		approximateByte,
		bestAudioSample?.offset ?? null,
		xingSeekPoint,
	].filter((b) => b !== null);
	if (candidates.length === 0) {
		return {
			type: 'valid-but-must-wait',
		};
	}

	const byte = Math.max(...candidates);
	const timeInSeconds =
		byte === bestAudioSample?.offset ? bestAudioSample.timeInSeconds : time;

	return {
		type: 'do-seek',
		byte,
		timeInSeconds,
	};
};
