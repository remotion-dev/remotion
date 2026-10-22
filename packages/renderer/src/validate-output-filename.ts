import {NoReactInternals} from 'remotion/no-react';
import type {Codec} from './codec';
import type {FileExtension} from './file-extensions';
import {defaultFileExtensionMap} from './file-extensions';
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
	extension: string | null;
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

	// File extensions are case-insensitive: `out.MP4` is a valid MP4 output.
	const normalizedExtension =
		extension === null ? null : extension.toLowerCase();

	if (
		NoReactInternals.ENABLE_V5_BREAKING_CHANGES &&
		codec === 'aac' &&
		(normalizedExtension === 'mpg' || normalizedExtension === 'mpeg')
	) {
		throw new Error(
			'AAC output with .mpg or .mpeg extensions is not supported. Use .aac for raw ADTS AAC or .m4a for an MPEG-4 audio container.',
		);
	}

	const map = defaultFileExtensionMap[codec];
	const resolvedAudioCodec = resolveAudioCodec({
		codec,
		preferLossless,
		setting: audioCodecSetting,
		separateAudioTo,
	});

	if (resolvedAudioCodec === null) {
		if (normalizedExtension !== map.default) {
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
		!acceptableExtensions.includes(normalizedExtension as FileExtension) &&
		!separateAudioTo
	) {
		throw new TypeError(
			`When using the ${codec} codec with the ${resolvedAudioCodec} audio codec, the output filename must end in one of the following: ${acceptableExtensions.join(
				', ',
			)}.`,
		);
	}
};
