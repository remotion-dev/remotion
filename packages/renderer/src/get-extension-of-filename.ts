import {pathNormalize} from './path-normalize';

export const getExtensionOfFilename = (
	filename: string | null,
): string | null => {
	if (filename === null) {
		return null;
	}

	const filenameArr = pathNormalize(filename).split('.');

	const hasExtension = filenameArr.length >= 2;
	const filenameArrLength = filenameArr.length;
	const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
	return extension;
};
