import type {MediaParserAudioTrack} from '@remotion/media-parser';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {getAudioEncoderConfig} from './audio-encoder-config';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';

export const canReencodeAudioTrack = async ({
	track,
	audioCodec,
	bitrate,
	sampleRate,
}: {
	track: MediaParserAudioTrack;
	audioCodec: ConvertMediaAudioCodec;
	bitrate: number;
	sampleRate: number | null;
}): Promise<boolean> => {
	const audioDecoderConfig = await getAudioDecoderConfig(track);
	if (audioCodec === 'wav' && audioDecoderConfig) {
		return true;
	}

	const audioEncoderConfig = await getAudioEncoderConfig({
		codec: audioCodec,
		numberOfChannels: track.numberOfChannels,
		sampleRate: sampleRate ?? track.sampleRate,
		bitrate,
	});

	return Boolean(audioDecoderConfig && audioEncoderConfig);
};
