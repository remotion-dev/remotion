import type {Codec, CodecOrUndefined} from '../codec';
import {validCodecs} from '../codec';

export function validateCodec(
	defaultCodec: unknown,
	location: string,
	name: string,
): asserts defaultCodec is CodecOrUndefined {
	if (typeof defaultCodec === 'undefined') {
		return;
	}

	if (typeof defaultCodec !== 'string') {
		throw new TypeError(
			`The "${name}" prop ${location} must be a string, but you passed a value of type ${typeof defaultCodec}.`,
		);
	}

	if (!validCodecs.includes(defaultCodec as Codec)) {
		throw new Error(
			`The "${name}" prop ${location} must be one of ${validCodecs.join(
				', ',
			)}, but you passed ${defaultCodec}.`,
		);
	}
}
