import type {Codec} from './codec';
import {validCodecs} from './codec';

export const getFileExtensionFromCodec = (
	codec: Codec,
	type: 'chunk' | 'final'
) => {
	if (!validCodecs.includes(codec)) {
		throw new Error(
			`Codec must be one of the following: ${validCodecs.join(
				', '
			)}, but got ${codec}`
		);
	}

	switch (codec) {
		case 'aac':
			return 'aac';
		case 'h264':
			return 'mp4';
		// The chunks will be rendered as mkv, but the final output will still be MP4
		case 'h264-mkv':
			if (type === 'chunk') {
				return 'mkv';
			}

			return 'mp4';
		case 'h265':
			return 'mp4';
		case 'mp3':
			return 'mp3';
		case 'prores':
			return 'mov';
		case 'vp8':
			return 'webm';
		case 'vp9':
			return 'webm';
		case 'gif':
			if (type === 'chunk') {
				return 'mkv';
			}

			return 'gif';
		case 'wav':
			return 'wav';
		default:
			throw new Error(
				"Don't know which file extension to use for codec " + codec
			);
	}
};
