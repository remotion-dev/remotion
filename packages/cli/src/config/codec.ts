import type {CodecOrUndefined} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {Log} from '../log';

const validLegacyFormats = ['mp4', 'png-sequence'] as const;

type LegacyFormat = typeof validLegacyFormats[number];

let codec: CodecOrUndefined;

export const setCodec = (newCodec: CodecOrUndefined) => {
	if (newCodec === undefined) {
		codec = undefined;
		return;
	}

	if (!RenderInternals.validCodecs.includes(newCodec)) {
		throw new Error(
			`Codec must be one of the following: ${RenderInternals.validCodecs.join(
				', '
			)}, but got ${newCodec}`
		);
	}

	codec = newCodec;
};

export const getOutputCodecOrUndefined = (): CodecOrUndefined => {
	return codec;
};

export const setOutputFormat = (newLegacyFormat: LegacyFormat) => {
	if (newLegacyFormat === undefined) {
		codec = undefined;
		return;
	}

	if (!validLegacyFormats.includes(newLegacyFormat)) {
		throw new Error(
			`Output format must be one of the following: ${validLegacyFormats.join(
				', '
			)}, but got ${newLegacyFormat}`
		);
	}

	Log.warn(
		'setOutputFormat() is deprecated. Use the setCodec() and setImageSequence() instead.'
	);
	if (newLegacyFormat === 'mp4') {
		codec = 'h264';
		return;
	}

	if (newLegacyFormat === 'png-sequence') {
		codec = undefined;
	}
};
