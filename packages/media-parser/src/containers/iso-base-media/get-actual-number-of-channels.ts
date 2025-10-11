import {
	createAacCodecPrivate,
	parseAacCodecPrivate,
} from '../../aac-codecprivate';
import type {MediaParserCodecData} from '../../codec-data';
import type {MediaParserAudioCodec} from '../../get-tracks';

type AudioDecoderConfig = {
	numberOfChannels: number;
	sampleRate: number;
	codecPrivate: MediaParserCodecData | null;
};

// Example video:	'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/riverside.mp4';
// This video has `numberOfChannels = 2`, but the actual number of channels is `1` according to Codec Private.
// Therefore, prioritizing Codec Private over `numberOfChannels`.
export const getActualDecoderParameters = ({
	audioCodec,
	codecPrivate,
	numberOfChannels,
	sampleRate,
}: {
	audioCodec: MediaParserAudioCodec;
	codecPrivate: MediaParserCodecData | null;
	numberOfChannels: number;
	sampleRate: number;
}): AudioDecoderConfig => {
	if (audioCodec !== 'aac') {
		return {
			numberOfChannels,
			sampleRate,
			codecPrivate,
		};
	}

	if (codecPrivate === null) {
		return {numberOfChannels, sampleRate, codecPrivate};
	}

	if (codecPrivate.type !== 'aac-config') {
		throw new Error('Expected AAC codec private data');
	}

	const parsed = parseAacCodecPrivate(codecPrivate.data);

	const actual = createAacCodecPrivate({
		...parsed,
		codecPrivate: codecPrivate.data,
	});

	return {
		numberOfChannels: parsed.channelConfiguration,
		sampleRate: parsed.sampleRate,
		codecPrivate: {type: 'aac-config', data: actual},
	};
};
