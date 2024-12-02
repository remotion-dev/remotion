export const calculateNewDimensionsFromDimensions = ({
	width,
	height,
	rotation,
}: {
	width: number;
	height: number;
	rotation: number;
}) => {
	const switchDimensions = rotation % 90 === 0 && rotation % 180 !== 0;

	const newHeight = switchDimensions ? width : height;
	const newWidth = switchDimensions ? height : width;

	return {height: newHeight, width: newWidth};
};
