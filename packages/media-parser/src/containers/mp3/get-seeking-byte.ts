import type {AudioSampleOffset} from '../../state/audio-sample-map';
import type {SeekResolution} from '../../work-on-seek-request';
import {getApproximateByteFromBitrate} from './seek/get-approximate-byte-from-bitrate';
import type {Mp3SeekingHints} from './seeking-hints';

export const getSeekingByteForMp3 = ({
	time,
	info,
}: {
	time: number;
	info: Mp3SeekingHints;
}): SeekResolution => {
	let bestAudioSample: AudioSampleOffset | undefined;

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
	if (approximateByte) {
		return {
			type: 'do-seek',
			byte: approximateByte,
		};
	}

	for (const hint of info.audioSampleMap) {
		if (hint.timeInSeconds > time) {
			continue;
		}

		// Everything is a mp3 in flac, so if this sample does not cover the time, it's not a good candidate.
		// Let's go to the next one. Exception: If we already saw the last sample, we use it so we find can at least
		// find the closest one.
		if (
			hint.timeInSeconds + hint.durationInSeconds < time &&
			!info.lastSampleObserved
		) {
			continue;
		}

		if (!bestAudioSample) {
			bestAudioSample = hint;
			continue;
		}

		if (bestAudioSample.timeInSeconds < hint.timeInSeconds) {
			bestAudioSample = hint;
		}
	}

	if (bestAudioSample) {
		return {
			type: 'do-seek',
			byte: bestAudioSample.offset,
		};
	}

	return {
		type: 'valid-but-must-wait',
	};
};
