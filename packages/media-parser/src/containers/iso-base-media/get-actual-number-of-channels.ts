import {
	createAacCodecPrivate,
	parseAacCodecPrivate,
} from '../../aac-codecprivate';
import type {MediaParserAudioCodec} from '../../get-tracks';

type AudioDecoderConfig = {
	numberOfChannels: number;
	sampleRate: number;
	codecPrivate: Uint8Array | null;
};

// Example video:	'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/riverside.mp4';
// This video has `numberOfChannels = 2`, but the actual number of channels is `1` according to Codec Private.
// Therefore, prioritizing Codec Private over `numberOfChannels`.
export const getActualDecoderParameters = ({
	audioCodec,
	codecPrivate,
	numberOfChannels,
	sampleRate,
}: {
	audioCodec: MediaParserAudioCodec;
	codecPrivate: Uint8Array | null;
	numberOfChannels: number;
	sampleRate: number;
}): AudioDecoderConfig => {
	if (audioCodec !== 'aac') {
		return {numberOfChannels, sampleRate, codecPrivate};
	}

	if (codecPrivate === null) {
		return {numberOfChannels, sampleRate, codecPrivate};
	}

	const parsed = parseAacCodecPrivate(codecPrivate);
	return {
		numberOfChannels: parsed.channelConfiguration,
		sampleRate: parsed.sampleRate,
		codecPrivate: createAacCodecPrivate({...parsed, codecPrivate}),
	};
};
