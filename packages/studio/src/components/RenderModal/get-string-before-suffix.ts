export const getStringBeforeSuffix = (fileName: string) => {
	const dotPos = fileName.lastIndexOf('.');
	if (dotPos === -1) {
		return fileName;
	}

	return fileName.substring(0, dotPos);
};
