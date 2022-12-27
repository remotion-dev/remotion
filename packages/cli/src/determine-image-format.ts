import type {ImageFormat, StillImageFormat} from '@remotion/renderer';

const deriveExtensionFromFilename = (
	filename: string | null
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

	return null;
};

export const determineFinalImageFormat = ({
	downloadName,
	outName,
	configImageFormat,
	cliFlag,
	isLambda,
}: {
	downloadName: string | null;
	outName: string | null;
	configImageFormat: ImageFormat | null;
	cliFlag: ImageFormat | null;
	isLambda: boolean;
}): {format: StillImageFormat; source: string} => {
	const outNameExtension = deriveExtensionFromFilename(outName);
	const downloadNameExtension = deriveExtensionFromFilename(downloadName);

	const outNameDescription = isLambda ? 'S3 output key' : 'out name';

	if (
		outNameExtension &&
		downloadNameExtension &&
		outNameExtension !== downloadNameExtension
	) {
		throw new TypeError(
			`Image format mismatch: ${outName} was given as the ${outNameDescription} and ${downloadName} was given as the download name, but the extensions don't match.`
		);
	}

	if (downloadNameExtension) {
		if (cliFlag && downloadNameExtension !== cliFlag) {
			throw new TypeError(
				`Image format mismatch: ${downloadName} was given as the download name, but --image-format=${cliFlag} was passed. The image formats must match.`
			);
		}

		return {format: downloadNameExtension, source: 'Download name extension'};
	}

	if (outNameExtension) {
		if (cliFlag && outNameExtension !== cliFlag) {
			throw new TypeError(
				`Image format mismatch: ${outName} was given as the ${outNameDescription}, but --image-format=${cliFlag} was passed. The image formats must match.`
			);
		}

		return {format: outNameExtension, source: 'Out name extension'};
	}

	if (cliFlag === 'none') {
		throw new TypeError(
			'The --image-format flag must not be "none" for stills.'
		);
	}

	if (cliFlag !== null) {
		return {format: cliFlag, source: '--image-format flag'};
	}

	if (configImageFormat !== null && configImageFormat !== 'none') {
		return {format: configImageFormat, source: 'Config file'};
	}

	return {format: 'png', source: 'Default'};
};
