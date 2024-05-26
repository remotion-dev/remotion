import type {Codec} from '@remotion/renderer';

export const humanReadableCodec = (codec: Codec) => {
	if (codec === 'aac') {
		return 'AAC';
	}

	if (codec === 'mp3') {
		return 'MP3';
	}

	if (codec === 'gif') {
		return 'GIF';
	}

	if (codec === 'h264') {
		return 'H.264';
	}

	if (codec === 'h264-mkv') {
		return 'H.264 Matroska';
	}

	if (codec === 'h264-ts') {
		return 'H.264 Transport Stream';
	}

	if (codec === 'h265') {
		return 'H.265';
	}

	if (codec === 'prores') {
		return 'ProRes';
	}

	if (codec === 'vp8') {
		return 'WebM VP8';
	}

	if (codec === 'vp9') {
		return 'WebM VP9';
	}

	if (codec === 'wav') {
		return 'Waveform';
	}

	throw new TypeError(`Got unexpected codec "${codec}"`);
};
