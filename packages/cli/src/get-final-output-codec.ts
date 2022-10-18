import type {Codec, CodecOrUndefined} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

const fileExtensions: Record<string, Codec> = {
	webm: 'vp8',
	hevc: 'h265',
	mp3: 'mp3',
	mov: 'prores',
	wav: 'wav',
	aac: 'aac',
	mkv: 'h264-mkv',
	gif: 'gif',
	mp4: 'h264',
	m4a: 'aac',
};

const deriveExtensionFromFilename = (extension: string | null) => {
	if (extension === null) {
		return null;
	}

	return fileExtensions[extension] ?? null;
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

	const derivedDownloadCodec = deriveExtensionFromFilename(
		downloadNameExtension
	);
	const derivedOutNameCodec = deriveExtensionFromFilename(outNameExtension);

	if (
		derivedDownloadCodec &&
		derivedOutNameCodec &&
		derivedDownloadCodec !== derivedOutNameCodec
	) {
		throw new TypeError(
			`The download name is ${downloadName} but the output name is ${outName}. The file extensions must match`
		);
	}

	if (derivedDownloadCodec) {
		if (cliFlag && derivedDownloadCodec !== cliFlag) {
			throw new TypeError(
				`The download name is ${downloadName} but --codec=${cliFlag} was passed. The download name implies a codec of ${derivedDownloadCodec} which does not align with the --codec flag.`
			);
		}

		return {
			codec: derivedDownloadCodec,
			reason: 'derived from download name',
		};
	}

	if (derivedOutNameCodec) {
		if (cliFlag && derivedOutNameCodec !== cliFlag) {
			throw new TypeError(
				`The out name is ${outName} but --codec=${cliFlag} was passed. The out name implies a codec of ${derivedOutNameCodec} which does not align with the --codec flag.`
			);
		}

		if (configFile && derivedOutNameCodec !== configFile) {
			throw new TypeError(
				`The out name is ${outName} but ${configFile} was set as the codec in the config file. The out name implies a codec of ${derivedOutNameCodec} which does not align with the codec set in the config file.`
			);
		}

		return {
			codec: derivedOutNameCodec,
			reason: 'derived from out name',
		};
	}

	if (cliFlag) {
		return {codec: cliFlag, reason: 'from --codec flag'};
	}

	if (configFile) {
		return {
			codec: configFile,
			reason: 'Config file',
		};
	}

	return {codec: RenderInternals.DEFAULT_CODEC, reason: 'default'};
};
