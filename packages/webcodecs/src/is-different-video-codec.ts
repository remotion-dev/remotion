import type {
	MediaParserAudioCodec,
	MediaParserVideoCodec,
} from '@remotion/media-parser';
import type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';

export const isSameVideoCodec = ({
	inputVideoCodec,
	outputCodec,
}: {
	inputVideoCodec: MediaParserVideoCodec;
	outputCodec: ConvertMediaVideoCodec;
}) => {
	if (outputCodec === 'h264') {
		return inputVideoCodec === 'h264';
	}

	if (outputCodec === 'h265') {
		return inputVideoCodec === 'h265';
	}

	if (outputCodec === 'vp8') {
		return inputVideoCodec === 'vp8';
	}

	if (outputCodec === 'vp9') {
		return inputVideoCodec === 'vp9';
	}

	throw new Error(`Unsupported output codec: ${outputCodec satisfies never}`);
};

export const isSameAudioCodec = ({
	inputAudioCodec,
	outputCodec,
}: {
	inputAudioCodec: MediaParserAudioCodec;
	outputCodec: ConvertMediaAudioCodec;
}) => {
	if (outputCodec === 'aac') {
		return inputAudioCodec === 'aac';
	}

	if (outputCodec === 'opus') {
		return inputAudioCodec === 'opus';
	}

	if (outputCodec === 'wav') {
		return (
			inputAudioCodec === 'pcm-f32' ||
			inputAudioCodec === 'pcm-s16' ||
			inputAudioCodec === 'pcm-s24' ||
			inputAudioCodec === 'pcm-s32' ||
			inputAudioCodec === 'pcm-u8'
		);
	}

	throw new Error(`Unsupported output codec: ${outputCodec satisfies never}`);
};
