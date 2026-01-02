// The bitmap created from the SVG height and width might not be what we expect.
// Adjust the dimensions

export const fitSvgIntoItsContainer = ({
	containerSize,
	elementSize,
}: {
	containerSize: DOMRect;
	elementSize: {
		width: number;
		height: number;
	};
}) => {
	const heightRatio = containerSize.height / elementSize.height;
	const widthRatio = containerSize.width / elementSize.width;

	const ratio = Math.min(heightRatio, widthRatio);

	const newWidth = elementSize.width * ratio;
	const newHeight = elementSize.height * ratio;

	if (
		newWidth > containerSize.width + 0.000001 ||
		newHeight > containerSize.height + 0.000001
	) {
		throw new Error(
			`Element is too big to fit into the container. Max size: ${containerSize.width}x${containerSize.height}, element size: ${newWidth}x${newHeight}`,
		);
	}

	return {
		width: newWidth,
		height: newHeight,
		top: (containerSize.height - newHeight) / 2 + containerSize.top,
		left: (containerSize.width - newWidth) / 2 + containerSize.left,
	};
};
