import {NoReactInternals} from 'remotion/no-react';
import type {Codec} from './codec';
import type {FileExtension} from './file-extensions';
import {defaultFileExtensionMap} from './file-extensions';
import {makeFileExtensionMap} from './get-extension-from-codec';
import type {AudioCodec, supportedAudioCodecs} from './options/audio-codec';
import {resolveAudioCodec} from './options/audio-codec';

export const validateOutputFilename = <T extends Codec>({
	codec,
	audioCodecSetting,
	extension,
	preferLossless,
	separateAudioTo,
}: {
	codec: T;
	audioCodecSetting: AudioCodec | null;
	extension: string;
	preferLossless: boolean;
	separateAudioTo: string | null;
}) => {
	if (!defaultFileExtensionMap[codec]) {
		throw new TypeError(
			`The codec "${codec}" is not supported. Supported codecs are: ${Object.keys(
				defaultFileExtensionMap,
			).join(', ')}`,
		);
	}

	const supportedCodecsForExtension = makeFileExtensionMap()[extension] ?? [];
	const extensionMismatch = NoReactInternals.getCodecContainerMismatch({
		codec,
		container: extension,
		supportedCodecs: supportedCodecsForExtension,
	});
	if (extensionMismatch && supportedCodecsForExtension.length > 0) {
		throw new TypeError(extensionMismatch);
	}

	const map = defaultFileExtensionMap[codec];
	const resolvedAudioCodec = resolveAudioCodec({
		codec,
		preferLossless,
		setting: audioCodecSetting,
		separateAudioTo,
	});

	if (resolvedAudioCodec === null) {
		if (extension !== map.default) {
			throw new TypeError(
				`When using the ${codec} codec, the output filename must end in .${map.default}.`,
			);
		}

		return;
	}

	if (!(resolvedAudioCodec in map.forAudioCodec)) {
		throw new Error(
			`Audio codec ${resolvedAudioCodec} is not supported for codec ${codec}`,
		);
	}

	const acceptableExtensions =
		map.forAudioCodec[
			resolvedAudioCodec as (typeof supportedAudioCodecs)[T][number]
		].possible;

	if (
		!acceptableExtensions.includes(extension as FileExtension) &&
		!separateAudioTo
	) {
		throw new TypeError(
			`When using the ${codec} codec with the ${resolvedAudioCodec} audio codec, the output filename must end in one of the following: ${acceptableExtensions.join(
				', ',
			)}.`,
		);
	}
};
