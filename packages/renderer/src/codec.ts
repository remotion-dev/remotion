export const validCodecs = [
	'h264',
	'h265',
	'vp8',
	'vp9',
	'mp3',
	'aac',
	'wav',
	'prores',
	'h264-mkv',
	'gif',
] as const;

export type Codec = typeof validCodecs[number];
export type CodecOrUndefined = Codec | undefined;

export const DEFAULT_CODEC: Codec = 'h264';

export const getFinalOutputCodec = ({
	codec: inputCodec,
	fileExtension,
	emitWarning,
}: {
	codec: CodecOrUndefined;
	fileExtension: string | null;
	emitWarning: boolean;
}): Codec => {
	if (inputCodec === undefined && fileExtension === 'webm') {
		if (emitWarning) {
			console.info(
				'You have specified a .webm extension, using the VP8 encoder. Use --codec=vp9 to use the Vp9 encoder.'
			);
		}

		return 'vp8';
	}

	if (inputCodec === undefined && fileExtension === 'hevc') {
		if (emitWarning) {
			console.info(
				'You have specified a .hevc extension, using the H265 encoder.'
			);
		}

		return 'h265';
	}

	if (inputCodec === undefined && fileExtension === 'mp3') {
		if (emitWarning) {
			console.info(
				'You have specified a .mp3 extension, using the MP3 encoder.'
			);
		}

		return 'mp3';
	}

	if (inputCodec === undefined && fileExtension === 'mov') {
		if (emitWarning) {
			console.info(
				'You have specified a .mov extension, using the Apple ProRes encoder.'
			);
		}

		return 'prores';
	}

	if (inputCodec === undefined && fileExtension === 'wav') {
		if (emitWarning) {
			console.info(
				'You have specified a .wav extension, using the WAV encoder.'
			);
		}

		return 'wav';
	}

	if (inputCodec === undefined && fileExtension === 'aac') {
		if (emitWarning) {
			console.info(
				'You have specified a .aac extension, using the AAC encoder.'
			);
		}

		return 'aac';
	}

	if (inputCodec === undefined && fileExtension === 'm4a') {
		if (emitWarning) {
			console.info(
				'You have specified a .m4a extension, using the AAC encoder.'
			);
		}

		return 'aac';
	}

	if (inputCodec === undefined && fileExtension === 'mkv') {
		if (emitWarning) {
			console.info(
				'You have specified a .mkv extension, using the H264 encoder and WAV audio format.'
			);
		}

		return 'h264-mkv';
	}

	if (inputCodec === undefined && fileExtension === 'gif') {
		if (emitWarning) {
			console.info('You have specified a .gif extension, rendering a GIF');
		}

		return 'gif';
	}

	return inputCodec ?? DEFAULT_CODEC;
};
