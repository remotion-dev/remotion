export const getAssetDisplayName = (filename: string): string => {
	if (filename.startsWith('data:')) {
		return 'Data URL';
	}

	if (filename.startsWith('blob:')) {
		const staticFile =
			typeof window === 'undefined'
				? undefined
				: window.remotion_staticFiles?.find((file) => file.src === filename);
		return staticFile ? getAssetDisplayName(staticFile.name) : 'Blob URL';
	}

	const splitted = filename
		.split('/')
		.map((s) => s.split('\\'))
		.flat(1);
	return splitted[splitted.length - 1];
};
