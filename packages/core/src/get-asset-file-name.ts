export const getAssetFileName = (filename: string): string => {
	const splitted = filename
		.split('/')
		.map(s => s.split('\\'))
		.flat(1);
	return splitted[splitted.length - 1];
};
