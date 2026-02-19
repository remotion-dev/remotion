import type {StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';

const {cliFlag} = BrowserSafeApis.options.stillImageFormatOption;

const deriveExtensionFromFilename = (
	filename: string | null,
): StillImageFormat | null => {
	if (filename?.endsWith('.png')) {
		return 'png';
	}

	if (filename?.endsWith('.jpg')) {
		return 'jpeg';
	}

	if (filename?.endsWith('.jpeg')) {
		return 'jpeg';
	}

	if (filename?.endsWith('.pdf')) {
		return 'pdf';
	}

	if (filename?.endsWith('.webp')) {
		return 'webp';
	}

	return null;
};

export const determineFinalStillImageFormat = ({
	downloadName,
	outName,
	configuredImageFormat,
	isLambda,
	fromUi,
}: {
	downloadName: string | null;
	outName: string | null;
	configuredImageFormat: StillImageFormat | null;
	isLambda: boolean;
	fromUi: StillImageFormat | null;
}): {format: StillImageFormat; source: string} => {
	if (fromUi) {
		return {format: fromUi, source: 'via UI'};
	}

	const outNameExtension = deriveExtensionFromFilename(outName);
	const downloadNameExtension = deriveExtensionFromFilename(downloadName);

	const outNameDescription = isLambda ? 'S3 output key' : 'out name';

	if (
		outNameExtension &&
		downloadNameExtension &&
		outNameExtension !== downloadNameExtension
	) {
		throw new TypeError(
			`Image format mismatch: ${outName} was given as the ${outNameDescription} and ${downloadName} was given as the download name, but the extensions don't match.`,
		);
	}

	if (downloadNameExtension) {
		if (
			configuredImageFormat &&
			downloadNameExtension !== configuredImageFormat
		) {
			throw new TypeError(
				`Image format mismatch: ${downloadName} was given as the download name, but the image format "${configuredImageFormat}" was configured via --${cliFlag} or Config.setStillImageFormat(). The image formats must match.`,
			);
		}

		return {format: downloadNameExtension, source: 'Download name extension'};
	}

	if (outNameExtension) {
		if (configuredImageFormat && outNameExtension !== configuredImageFormat) {
			throw new TypeError(
				`Image format mismatch: ${outName} was given as the ${outNameDescription}, but the image format "${configuredImageFormat}" was configured via --${cliFlag} or Config.setStillImageFormat(). The image formats must match.`,
			);
		}

		return {format: outNameExtension, source: 'Out name extension'};
	}

	if (configuredImageFormat !== null) {
		return {format: configuredImageFormat, source: `--${cliFlag} or config`};
	}

	return {format: 'png', source: 'Default'};
};
