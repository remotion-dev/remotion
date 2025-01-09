/* eslint-disable no-console */
import type {HardwareAccelerationOption} from './client';
import type {Codec} from './codec';
import {isAudioCodec} from './is-audio-codec';

export type Crf = number | undefined;

const defaultCrfMap: {[key in Codec]: number | null} = {
	h264: 18,
	h265: 23,
	vp8: 9,
	vp9: 28,
	prores: null,
	gif: null,
	'h264-mkv': 18,
	'h264-ts': 18,
	aac: null,
	mp3: null,
	wav: null,
};

export const getDefaultCrfForCodec = (codec: Codec): number | null => {
	const val = defaultCrfMap[codec];
	if (val === undefined) {
		throw new TypeError(`Got unexpected codec "${codec}"`);
	}

	return val;
};

const crfRanges: {[key in Codec]: [number, number]} = {
	h264: [1, 51],
	h265: [0, 51],
	vp8: [4, 63],
	vp9: [0, 63],
	prores: [0, 0],
	gif: [0, 0],
	'h264-mkv': [1, 51],
	'h264-ts': [1, 51],
	aac: [0, 0],
	mp3: [0, 0],
	wav: [0, 0],
};

export const getValidCrfRanges = (codec: Codec): [number, number] => {
	const val = crfRanges[codec];
	if (val === undefined) {
		throw new TypeError(`Got unexpected codec "${codec}"`);
	}

	return val;
};

export const validateQualitySettings = ({
	codec,
	crf,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	hardwareAcceleration,
}: {
	crf: unknown;
	codec: Codec;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	hardwareAcceleration: HardwareAccelerationOption;
}): string[] => {
	if (crf && videoBitrate) {
		throw new Error(
			'"crf" and "videoBitrate" can not both be set. Choose one of either.',
		);
	}

	if (crf && hardwareAcceleration === 'required') {
		throw new Error('"crf" option is not supported with hardware acceleration');
	}

	if (encodingMaxRate && !encodingBufferSize) {
		throw new Error(
			'"encodingMaxRate" can not be set without also setting "encodingBufferSize".',
		);
	}

	const bufSizeArray = encodingBufferSize
		? ['-bufsize', encodingBufferSize]
		: [];
	const maxRateArray = encodingMaxRate ? ['-maxrate', encodingMaxRate] : [];

	if (videoBitrate) {
		if (codec === 'prores') {
			console.warn('ProRes does not support videoBitrate. Ignoring.');
			return [];
		}

		if (isAudioCodec(codec)) {
			console.warn(`${codec} does not support videoBitrate. Ignoring.`);
			return [];
		}

		return ['-b:v', videoBitrate, ...bufSizeArray, ...maxRateArray];
	}

	if (crf === null || typeof crf === 'undefined') {
		const actualCrf = getDefaultCrfForCodec(codec);
		if (actualCrf === null) {
			return [...bufSizeArray, ...maxRateArray];
		}

		return ['-crf', String(actualCrf), ...bufSizeArray, ...maxRateArray];
	}

	if (typeof crf !== 'number') {
		throw new TypeError(
			'Expected CRF to be a number, but is ' + JSON.stringify(crf),
		);
	}

	const range = getValidCrfRanges(codec);
	if (
		crf === 0 &&
		(codec === 'h264' || codec === 'h264-mkv' || codec === 'h264-ts')
	) {
		throw new TypeError(
			"Setting the CRF to 0 with a H264 codec is not supported anymore because of it's inconsistencies between platforms. Videos with CRF 0 cannot be played on iOS/macOS. 0 is a extreme value with inefficient settings which you probably do not want. Set CRF to a higher value to fix this error.",
		);
	}

	if (crf < range[0] || crf > range[1]) {
		if (range[0] === 0 && range[1] === 0) {
			throw new TypeError(
				`The "${codec}" codec does not support the --crf option.`,
			);
		}

		throw new TypeError(
			`CRF must be between ${range[0]} and ${range[1]} for codec ${codec}. Passed: ${crf}`,
		);
	}

	if (codec === 'prores') {
		console.warn('ProRes does not support the "crf" option. Ignoring.');
		return [];
	}

	if (isAudioCodec(codec)) {
		console.warn(`${codec} does not support the "crf" option. Ignoring.`);
		return [];
	}

	return ['-crf', String(crf), ...bufSizeArray, ...maxRateArray];
};
