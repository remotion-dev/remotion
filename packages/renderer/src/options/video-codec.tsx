import type {Codec, CodecOrUndefined} from '../codec';
import {DEFAULT_CODEC, validCodecs} from '../codec';
import type {FileExtension} from '../file-extensions';
import {
	defaultCodecsForFileExtension,
	makeFileExtensionMap,
} from '../get-extension-from-codec';
import {getExtensionOfFilename} from '../get-extension-of-filename';
import type {AnyRemotionOption} from './option';

let codec: CodecOrUndefined;

const setCodec = (newCodec: CodecOrUndefined) => {
	if (newCodec === undefined) {
		codec = undefined;
		return;
	}

	if (!validCodecs.includes(newCodec)) {
		throw new Error(
			`Codec must be one of the following: ${validCodecs.join(
				', ',
			)}, but got ${newCodec}`,
		);
	}

	codec = newCodec;
};

export const getOutputCodecOrUndefined = () => {
	return codec;
};

const deriveCodecsFromFilename = (
	extension: string | null,
): {
	possible: Codec[];
	default: Codec | null;
} => {
	if (extension === null) {
		return {possible: [], default: null};
	}

	return {
		default: defaultCodecsForFileExtension[extension as FileExtension] ?? null,
		possible: makeFileExtensionMap()[extension] ?? [],
	};
};

const cliFlag = 'codec' as const;

export const videoCodecOption = {
	name: 'Codec',
	cliFlag,
	description: () => (
		<>
			H264 works well in most cases, but sometimes it&apos;s worth going for a
			different codec. WebM achieves higher compression but is slower to render.
			WebM, GIF and ProRes support transparency.
		</>
	),
	ssrName: 'codec',
	docLink: 'https://www.remotion.dev/docs/encoding/#choosing-a-codec',
	type: '' as Codec,
	getValue: (
		{commandLine}: {commandLine: Record<string, unknown>},
		{
			compositionCodec,
			configFile,
			downloadName,
			outName,
			uiCodec,
		}: {
			outName: string | null;
			downloadName: string | null;
			configFile: Codec | null;
			uiCodec: Codec | null;
			compositionCodec: Codec | null;
		},
	): {
		value: Codec;
		source: string;
	} => {
		if (uiCodec) {
			return {value: uiCodec, source: 'via UI'};
		}

		const downloadNameExtension = getExtensionOfFilename(downloadName);
		const outNameExtension = getExtensionOfFilename(outName);

		const derivedDownloadCodecs = deriveCodecsFromFilename(
			downloadNameExtension,
		);
		const derivedOutNameCodecs = deriveCodecsFromFilename(outNameExtension);

		if (
			derivedDownloadCodecs.possible.length > 0 &&
			derivedOutNameCodecs.possible.length > 0 &&
			derivedDownloadCodecs.possible.join('') !==
				derivedOutNameCodecs.possible.join('')
		) {
			throw new TypeError(
				`The download name is ${downloadName} but the output name is ${outName}. The file extensions must match`,
			);
		}

		const cliArgument = commandLine[cliFlag];

		if (cliArgument) {
			if (
				derivedDownloadCodecs.possible.length > 0 &&
				derivedDownloadCodecs.possible.indexOf(cliArgument as Codec) === -1
			) {
				throw new TypeError(
					`The download name is ${downloadName} but --codec=${cliArgument} was passed. The download name implies a codec of ${derivedDownloadCodecs.possible.join(
						' or ',
					)} which does not align with the --codec flag.`,
				);
			}

			if (
				derivedOutNameCodecs.possible.length > 0 &&
				derivedOutNameCodecs.possible.indexOf(cliArgument as Codec) === -1
			) {
				throw new TypeError(
					`The out name is ${outName} but --codec=${cliArgument} was passed. The out name implies a codec of ${derivedOutNameCodecs.possible.join(
						' or ',
					)} which does not align with the --codec flag.`,
				);
			}

			return {value: cliArgument as Codec, source: 'from --codec flag'};
		}

		if (derivedDownloadCodecs.possible.length > 0) {
			return {
				value: derivedDownloadCodecs.default as Codec,
				source: 'derived from download name',
			};
		}

		if (derivedOutNameCodecs.possible.length > 0) {
			return {
				value: derivedOutNameCodecs.default as Codec,
				source: 'derived from out name',
			};
		}

		if (compositionCodec) {
			return {value: compositionCodec, source: 'via calculateMetadata'};
		}

		if (configFile) {
			return {
				value: configFile,
				source: 'Config file',
			};
		}

		return {value: DEFAULT_CODEC, source: 'default'};
	},
	setConfig: setCodec,
} satisfies AnyRemotionOption<Codec>;
