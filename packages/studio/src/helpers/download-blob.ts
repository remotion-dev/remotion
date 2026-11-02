export const getDownloadFilename = (path: string): string => {
	return path.slice(path.lastIndexOf('/') + 1);
};

export const downloadBlob = (blob: Blob, filename: string): void => {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = getDownloadFilename(filename);
	a.click();
	URL.revokeObjectURL(url);
};
