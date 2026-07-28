export const downloadBlob = (blob: Blob, filename: string): void => {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	const cleanFilename = filename.includes('/')
		? filename.substring(filename.lastIndexOf('/') + 1)
		: filename;
	a.download = cleanFilename;
	a.click();
	URL.revokeObjectURL(url);
};
