import type {Codec, CodecOrUndefined} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

const fileExtensions: Record<string, Codec[]> = {
	webm: ['vp8', 'vp9'],
	hevc: ['h265'],
	mp3: ['mp3'],
	mov: ['prores'],
	wav: ['wav'],
	aac: ['aac'],
	mkv: ['h264-mkv'],
	gif: ['gif'],
	mp4: ['h264'],
	m4a: ['aac'],
};

const deriveExtensionFromFilename = (extension: string | null) => {
	if (extension === null) {
		return [];
	}

	return fileExtensions[extension] ?? [];
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
		derivedDownloadCodec.length === 0 &&
		derivedOutNameCodec.length === 0 &&
		derivedDownloadCodec.join('') !== derivedOutNameCodec.join('')
	) {
		throw new TypeError(
			`The download name is ${downloadName} but the output name is ${outName}. The file extensions must match`
		);
	}

	if (cliFlag) {
		if (
			derivedDownloadCodec.length > 0 &&
			derivedDownloadCodec.indexOf(cliFlag) === -1
		) {
			throw new TypeError(
				`The download name is ${downloadName} but --codec=${cliFlag} was passed. The download name implies a codec of ${derivedDownloadCodec.join(
					' or '
				)} which does not align with the --codec flag.`
			);
		}

		if (
			derivedOutNameCodec.length > 0 &&
			derivedOutNameCodec.indexOf(cliFlag) === -1
		) {
			throw new TypeError(
				`The out name is ${outName} but --codec=${cliFlag} was passed. The out name implies a codec of ${derivedOutNameCodec} which does not align with the --codec flag.`
			);
		}

		return {codec: cliFlag, reason: 'from --codec flag'};
	}

	if (derivedDownloadCodec) {
		return {
			codec: derivedDownloadCodec[0],
			reason: 'derived from download name',
		};
	}

	if (derivedOutNameCodec) {
		return {
			codec: derivedOutNameCodec[0],
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
