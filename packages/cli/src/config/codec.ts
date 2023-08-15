import type {CodecOrUndefined} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

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
