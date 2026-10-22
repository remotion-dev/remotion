import {pathNormalize} from './path-normalize';

export const getExtensionOfFilename = (
	filename: string | null,
): string | null => {
	if (filename === null) {
		return null;
	}

	// Only the last path segment can have an extension: the dots in
	// `my.project/frames` or `../frames` belong to folders.
	const segments = pathNormalize(filename).split(/[/\\]/);
	const filenameArr = segments[segments.length - 1].split('.');

	const hasExtension = filenameArr.length >= 2;
	const filenameArrLength = filenameArr.length;
	const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
	return extension;
};
