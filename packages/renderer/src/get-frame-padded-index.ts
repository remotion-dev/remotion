export const getFrameOutputFileName = ({
	filePadLength,
	index,
	frame,
	imageFormat,
}: {
	index: number;
	frame: number;
	filePadLength: number;
	imageFormat: 'png' | 'jpeg';
}) => {
	const paddedIndex = String(index).padStart(filePadLength, '0');
	return `element-${paddedIndex}.${imageFormat}`;
};
