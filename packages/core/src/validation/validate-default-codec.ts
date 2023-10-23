import type {Codec, CodecOrUndefined} from '../codec';
import {validCodecs} from '../codec';

export function validateDefaultCodec(
	defaultCodec: unknown,
	location: string,
): asserts defaultCodec is CodecOrUndefined {
	if (typeof defaultCodec === 'undefined') {
		return;
	}

	if (typeof defaultCodec !== 'string') {
		throw new TypeError(
			`The "defaultCodec" prop ${location} must be a string, but you passed a value of type ${typeof defaultCodec}.`,
		);
	}

	if (!validCodecs.includes(defaultCodec as Codec)) {
		throw new Error(
			`The "defaultCodec" prop ${location} must be one of ${validCodecs.join(
				', ',
			)}, but you passed ${defaultCodec}.`,
		);
	}
}
