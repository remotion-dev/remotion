import type {AudioCodec} from './audio-codec';
import type {Codec} from './codec';
import {validCodecs} from './codec';
import type {supportedAudioCodecs} from './file-extensions';
import {defaultFileExtensionMap} from './file-extensions';

export const getFileExtensionFromCodec = <T extends Codec>(
	codec: T,
	audioCodec: AudioCodec | null
) => {
	if (!validCodecs.includes(codec)) {
		throw new Error(
			`Codec must be one of the following: ${validCodecs.join(
				', '
			)}, but got ${codec}`
		);
	}

	const map = defaultFileExtensionMap[
		codec
	] as typeof defaultFileExtensionMap[T];
	if (audioCodec === null) {
		return map.default;
	}

	const typedAudioCodec =
		audioCodec as keyof typeof defaultFileExtensionMap[Codec]['forAudioCodec'];

	if (!(typedAudioCodec in map.forAudioCodec)) {
		throw new Error(
			`Audio codec ${typedAudioCodec} is not supported for codec ${codec}`
		);
	}

	return map.forAudioCodec[audioCodec as typeof supportedAudioCodecs[T][number]]
		.default;
};
