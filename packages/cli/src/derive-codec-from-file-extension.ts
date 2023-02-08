import type {Codec} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export const makeFileExtensionMap = () => {
	const map: Record<string, Codec[]> = {};
	Object.keys(RenderInternals.defaultFileExtensionMap).forEach(
		<T extends Codec>(_codec: string) => {
			const codec = _codec as T;
			const {default: defaultExtension, forAudioCodec} =
				RenderInternals.defaultFileExtensionMap[codec];
			const audioCodecs = Object.keys(forAudioCodec);
			const possibleExtensionsForAudioCodec = audioCodecs.map(
				(audioCodec) =>
					forAudioCodec[
						audioCodec as typeof RenderInternals.supportedAudioCodec[T][number]
					].possible
			);

			const allPossibleExtensions = [
				defaultExtension,
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
