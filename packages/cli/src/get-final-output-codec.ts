import type {Codec, CodecOrUndefined, FileExtension} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

const deriveCodecsFromFilename = (
	extension: string | null
): {
	possible: Codec[];
	default: Codec | null;
} => {
	if (extension === null) {
		return {possible: [], default: null};
	}

	return {
		default:
			RenderInternals.defaultCodecsForFileExtension[
				extension as FileExtension
			] ?? null,
		possible: RenderInternals.makeFileExtensionMap()[extension] ?? [],
	};
};

export const getFinalOutputCodec = ({
	cliFlag,
	configFile,
	downloadName,
	outName,
}: {
	cliFlag: CodecOrUndefined;
	outName: string | null;
	downloadName: string | null;
	configFile: Codec | null;
}): {codec: Codec; reason: string} => {
	const downloadNameExtension =
		RenderInternals.getExtensionOfFilename(downloadName);
	const outNameExtension = RenderInternals.getExtensionOfFilename(outName);

	const derivedDownloadCodecs = deriveCodecsFromFilename(downloadNameExtension);
	const derivedOutNameCodecs = deriveCodecsFromFilename(outNameExtension);

	if (
		derivedDownloadCodecs.possible.length > 0 &&
		derivedOutNameCodecs.possible.length > 0 &&
		derivedDownloadCodecs.possible.join('') !==
			derivedOutNameCodecs.possible.join('')
	) {
		throw new TypeError(
			`The download name is ${downloadName} but the output name is ${outName}. The file extensions must match`
		);
	}

	if (cliFlag) {
		if (
			derivedDownloadCodecs.possible.length > 0 &&
			derivedDownloadCodecs.possible.indexOf(cliFlag) === -1
		) {
			throw new TypeError(
				`The download name is ${downloadName} but --codec=${cliFlag} was passed. The download name implies a codec of ${derivedDownloadCodecs.possible.join(
					' or '
				)} which does not align with the --codec flag.`
			);
		}

		if (
			derivedOutNameCodecs.possible.length > 0 &&
			derivedOutNameCodecs.possible.indexOf(cliFlag) === -1
		) {
			throw new TypeError(
				`The out name is ${outName} but --codec=${cliFlag} was passed. The out name implies a codec of ${derivedOutNameCodecs.possible.join(
					' or '
				)} which does not align with the --codec flag.`
			);
		}

		return {codec: cliFlag, reason: 'from --codec flag'};
	}

	if (derivedDownloadCodecs.possible.length > 0) {
		return {
			codec: derivedDownloadCodecs.default as Codec,
			reason: 'derived from download name',
		};
	}

	if (derivedOutNameCodecs.possible.length > 0) {
		return {
			codec: derivedOutNameCodecs.default as Codec,
			reason: 'derived from out name',
		};
	}

	if (configFile) {
		return {
			codec: configFile,
			reason: 'Config file',
		};
	}

	return {codec: RenderInternals.DEFAULT_CODEC, reason: 'default'};
};
