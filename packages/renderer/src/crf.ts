import type {Codec} from './codec';
import {isAudioCodec} from './is-audio-codec';

export type Crf = number | undefined;

export const getDefaultCrfForCodec = (codec: Codec): number => {
	if (isAudioCodec(codec)) {
		return 0;
	}

	if (codec === 'h264' || codec === 'h264-mkv') {
		return 18; // FFMPEG default 23
	}

	if (codec === 'h265' || codec === 'gif') {
		return 23; // FFMPEG default 28
	}

	if (codec === 'vp8') {
		return 9; // FFMPEG default 10
	}

	if (codec === 'vp9') {
		return 28; // FFMPEG recommendation 31
	}

	if (codec === 'prores') {
		return 0;
	}

	throw new TypeError(`Got unexpected codec "${codec}"`);
};

export const getValidCrfRanges = (codec: Codec): [number, number] => {
	if (isAudioCodec(codec)) {
		return [0, 0];
	}

	if (codec === 'prores') {
		return [0, 0];
	}

	if (codec === 'h264' || codec === 'h264-mkv') {
		return [1, 51];
	}

	if (codec === 'h265' || codec === 'gif') {
		return [0, 51];
	}

	if (codec === 'vp8') {
		return [4, 63];
	}

	if (codec === 'vp9') {
		return [0, 63];
	}

	throw new TypeError(`Got unexpected codec "${codec}"`);
};

export const validateQualitySettings = ({
	codec,
	crf,
	videoBitrate,
}: {
	crf: unknown;
	codec: Codec;
	videoBitrate: string | null | undefined;
}): string[] => {
	if (crf && videoBitrate) {
		throw new Error(
			'"crf" and "videoBitrate" can not both be set. Choose one of either.'
		);
	}

	if (videoBitrate) {
		return ['-b:v', videoBitrate];
	}

	if (crf === null || typeof crf === 'undefined') {
		const actualCrf = getDefaultCrfForCodec(codec);

		return ['-crf', String(actualCrf)];
	}

	if (typeof crf !== 'number') {
		throw new TypeError(
			'Expected CRF to be a number, but is ' + JSON.stringify(crf)
		);
	}

	const range = getValidCrfRanges(codec);
	if (crf === 0 && (codec === 'h264' || codec === 'h264-mkv')) {
		throw new TypeError(
			"Setting the CRF to 0 with a H264 codec is not supported anymore because of it's inconsistencies between platforms. Videos with CRF 0 cannot be played on iOS/macOS. 0 is a extreme value with inefficient settings which you probably do not want. Set CRF to a higher value to fix this error."
		);
	}

	if (crf < range[0] || crf > range[1]) {
		throw new TypeError(
			`CRF must be between ${range[0]} and ${range[1]} for codec ${codec}. Passed: ${crf}`
		);
	}

	return ['-crf', String(crf)];
};
