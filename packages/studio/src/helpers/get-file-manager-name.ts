export const getFileManagerName = (platform: string | null): string => {
	if (platform === 'darwin') {
		return 'Finder';
	}

	if (platform === 'win32') {
		return 'File Explorer';
	}

	return 'File Manager';
};
