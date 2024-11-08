import type {AudioTrack} from '@remotion/media-parser';
import {getAudioDecoderConfig} from './audio-decoder-config';
import {getAudioEncoderConfig} from './audio-encoder-config';
import type {ConvertMediaAudioCodec} from './codec-id';

export const canReencodeAudio = async ({
	track,
	audioCodec,
	bitrate,
}: {
	track: AudioTrack;
	audioCodec: ConvertMediaAudioCodec;
	bitrate: number;
}): Promise<boolean> => {
	const audioDecoderConfig = await getAudioDecoderConfig({
		codec: track.codec,
		numberOfChannels: track.numberOfChannels,
		sampleRate: track.sampleRate,
		description: track.description,
	});

	const audioEncoderConfig = await getAudioEncoderConfig({
		codec: audioCodec,
		numberOfChannels: track.numberOfChannels,
		sampleRate: track.sampleRate,
		bitrate,
	});

	return Boolean(audioDecoderConfig && audioEncoderConfig);
};
