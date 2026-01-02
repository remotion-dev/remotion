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
	// If was already fitting, no need to calculate and lose precision
	if (
		Math.round(containerSize.width) === Math.round(elementSize.width) &&
		Math.round(containerSize.height) === Math.round(elementSize.height)
	) {
		return {
			width: containerSize.width,
			height: containerSize.height,
			top: containerSize.top,
			left: containerSize.left,
		};
	}

	if (containerSize.width <= 0 || containerSize.height <= 0) {
		throw new Error(
			`Container must have positive dimensions, but got ${containerSize.width}x${containerSize.height}`,
		);
	}

	if (elementSize.width <= 0 || elementSize.height <= 0) {
		throw new Error(
			`Element must have positive dimensions, but got ${elementSize.width}x${elementSize.height}`,
		);
	}
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
