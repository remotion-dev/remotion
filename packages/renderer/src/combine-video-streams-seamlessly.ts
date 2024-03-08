export const combineVideoStreamsSeamlessly = ({files}: {files: string[]}) => {
	const fileList = `concat:${files.join('|')}`;
	return fileList;
};
