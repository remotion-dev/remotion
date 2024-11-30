import type {AudioTrack, LogLevel} from '@remotion/media-parser';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {getAudioEncoderConfig} from './audio-encoder-config';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';

export const canReencodeAudioTrack = async ({
	track,
	audioCodec,
	bitrate,
	logLevel = 'info',
}: {
	track: AudioTrack;
	audioCodec: ConvertMediaAudioCodec;
	bitrate: number;
	logLevel?: LogLevel;
}): Promise<boolean> => {
	const audioDecoderConfig = await getAudioDecoderConfig(track, logLevel);
	if (audioCodec === 'wav' && audioDecoderConfig) {
		return true;
	}

	const audioEncoderConfig = await getAudioEncoderConfig({
		codec: audioCodec,
		numberOfChannels: track.numberOfChannels,
		sampleRate: track.sampleRate,
		bitrate,
	});

	return Boolean(audioDecoderConfig && audioEncoderConfig);
};
