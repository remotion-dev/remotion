export const getAssetDisplayName = (filename: string): string => {
	if (/data:|blob:/.test(filename.substring(0, 5))) {
		return 'Data URL';
	}

	const splitted = filename
		.split('/')
		.map((s) => s.split('\\'))
		.flat(1);
	return splitted[splitted.length - 1];
};
