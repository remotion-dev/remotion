export const getExtensionOfFilename = (filename: string) => {
	const filenameArr = filename.split('.');

	const hasExtension = filenameArr.length >= 2;
	const filenameArrLength = filenameArr.length;
	const extension = hasExtension ? filenameArr[filenameArrLength - 1] : null;
	return extension;
};
