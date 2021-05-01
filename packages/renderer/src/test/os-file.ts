export const fileNameInOs = (filename: string) => {
	if (process.platform === 'win32') {
		return filename.replace(/\//g, '\\');
	}

	return filename;
};
