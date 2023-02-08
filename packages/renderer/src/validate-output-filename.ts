import type {AudioCodec, supportedAudioCodec} from './audio-codec';
import {getDefaultAudioCodec} from './audio-codec';
import type {Codec} from './codec';
import type {FileExtension} from './get-extension-from-codec';
import {defaultFileExtensionMap} from './get-extension-from-codec';

export const validateOutputFilename = <T extends Codec>({
	codec,
	audioCodec,
	extension,
	preferLossless,
}: {
	codec: T;
	audioCodec: AudioCodec | null;
	extension: string;
	preferLossless: boolean;
}) => {
	if (!defaultFileExtensionMap[codec]) {
		throw new TypeError(
			`The codec "${codec}" is not supported. Supported codecs are: ${Object.keys(
				defaultFileExtensionMap
			).join(', ')}`
		);
	}

	const map = defaultFileExtensionMap[codec];
	const resolvedAudioCodec =
		audioCodec ?? getDefaultAudioCodec({codec, preferLossless});

	if (resolvedAudioCodec === null) {
		if (extension !== map.default) {
			throw new TypeError(
				`When using the ${codec} codec, the output filename must end in .${map.default}.`
			);
		}

		return;
	}

	if (!(resolvedAudioCodec in map.forAudioCodec)) {
		throw new Error(
			`Audio codec ${resolvedAudioCodec} is not supported for codec ${codec}`
		);
	}

	const acceptableExtensions =
		map.forAudioCodec[
			resolvedAudioCodec as typeof supportedAudioCodec[T][number]
		].possible;

	if (!acceptableExtensions.includes(extension as FileExtension)) {
		throw new TypeError(
			`When using the ${codec} codec with the ${resolvedAudioCodec} audio codec, the output filename must end in one of the following: ${acceptableExtensions.join(
				', '
			)}.`
		);
	}
};
