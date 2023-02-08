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

export const deriveExtensionFromFilename = (extension: string | null) => {
	if (extension === null) {
		return [];
	}

	return makeFileExtensionMap()[extension] ?? [];
};

export const makeFileExtensionMap = () => {
	const map: Record<string, Codec[]> = {};
	Object.keys(defaultFileExtensionMap).forEach(
		<T extends Codec>(_codec: string) => {
			const codec = _codec as T;
			const fileExtMap = defaultFileExtensionMap[
				codec
			] as typeof defaultFileExtensionMap[T];
			const audioCodecs = Object.keys(fileExtMap.forAudioCodec);

			const possibleExtensionsForAudioCodec = audioCodecs.map(
				(audioCodec) =>
					fileExtMap.forAudioCodec[
						audioCodec as typeof supportedAudioCodecs[T][number]
					].possible
			);

			const allPossibleExtensions = [
				fileExtMap.default,
				...possibleExtensionsForAudioCodec.flat(1),
			];

			for (const extension of allPossibleExtensions) {
				if (!map[extension]) {
					map[extension] = [];
				}

				if (!map[extension].includes(codec)) {
					map[extension].push(codec);
				}
			}
		}
	);

	return map;
};
